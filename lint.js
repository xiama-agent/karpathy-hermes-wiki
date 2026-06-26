'use strict';

// lint.js — Wiki 健康检查与自动修复
// 用法：node lint.js [--fix] [--dry-run]

const fs = require('fs');
const path = require('path');
const {
  ROOT,
  WIKI,
  INDEX_FILE,
  ARCHIVE,
  TEMP,
  REQUIRED_FIELDS,
  ensureBaseDirs,
  walkMarkdown,
  parseFrontmatter,
  formatFrontmatter,
  readMarkdown,
  writeMarkdown,
  upsertIndexEntry,
  appendLog,
  missingFrontmatterFields,
  addRelatedLink,
  wikiLinkFromPath,
  summarizeText
} = require('./wiki-utils');

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    fix: args.includes('--fix'),
    dryRun: args.includes('--dry-run')
  };
}

function getAllPages() {
  return walkMarkdown(WIKI).filter(file => !file.includes(`${path.sep}99-temp${path.sep}`));
}

function extractLinks(content) {
  const links = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  return links;
}

function lintFrontmatter() {
  const issues = [];
  for (const file of getAllPages()) {
    const parsed = parseFrontmatter(readMarkdown(file));
    if (!parsed.data) {
      issues.push({ file, issue: 'missing frontmatter' });
      continue;
    }
    for (const field of missingFrontmatterFields(parsed.data)) {
      issues.push({ file, issue: `missing field: ${field}` });
    }
  }
  return issues;
}

function lintOrphans() {
  const pages = getAllPages();
  const inbound = new Set();
  for (const file of pages) {
    const content = readMarkdown(file);
    for (const link of extractLinks(content)) {
      inbound.add(link.replace(/\.md$/, ''));
    }
  }
  if (fs.existsSync(INDEX_FILE)) {
    for (const link of extractLinks(readMarkdown(INDEX_FILE))) {
      inbound.add(link.replace(/\.md$/, ''));
    }
  }

  const orphans = [];
  for (const file of pages) {
    const rel = path.relative(WIKI, file).replace(/\\/g, '/').replace(/\.md$/, '');
    const fullRel = path.relative(ROOT, file).replace(/\\/g, '/').replace(/\.md$/, '');
    const name = path.basename(file, '.md');
    if (!inbound.has(rel) && !inbound.has(fullRel) && !inbound.has(name) && !rel.startsWith('98-archive/') && !rel.startsWith('99-temp/')) {
      orphans.push({ file, rel, name });
    }
  }
  return orphans;
}

function lintArchiveCandidates() {
  const now = Date.now();
  const cutoff = 30 * 24 * 60 * 60 * 1000;
  const candidates = [];
  for (const file of walkMarkdown(path.join(WIKI, '04-facts'))) {
    const parsed = parseFrontmatter(readMarkdown(file));
    if (!parsed.data) continue;
    const trust = Number(parsed.data.trust || 1);
    const updated = new Date(parsed.data.last_updated || 0);
    if (trust < 0.3 && now - updated.getTime() > cutoff) {
      candidates.push({ file, trust, updated });
    }
  }
  return candidates;
}

function lintIndexHealth() {
  if (!fs.existsSync(INDEX_FILE)) return { exists: false, missing: [] };
  const content = readMarkdown(INDEX_FILE);
  const links = extractLinks(content);
  const missing = links.filter(link => {
    const normalized = link.replace(/^wiki\//, 'wiki/');
    return !fs.existsSync(path.join(ROOT, normalized.replace(/\//g, path.sep)));
  });
  return { exists: true, bytes: Buffer.byteLength(content, 'utf8'), missing };
}

function inferParentPage(orphan) {
  const dir = path.dirname(orphan.file);
  const indexCandidate = path.join(dir, 'index.md');
  if (fs.existsSync(indexCandidate) && indexCandidate !== orphan.file) return indexCandidate;
  const siblings = walkMarkdown(dir).filter(file => file !== orphan.file);
  if (siblings.length === 1) return siblings[0];
  return null;
}

function fixFrontmatter(page, dryRun) {
  const content = readMarkdown(page.file);
  const parsed = parseFrontmatter(content);
  const defaults = {
    id: `HERMES-${path.basename(page.file, '.md')}`,
    title: path.basename(page.file, '.md'),
    type: page.file.includes(`${path.sep}04-facts${path.sep}`) ? 'fact' : 'knowledge',
    tags: [path.basename(path.dirname(page.file))],
    trust: 0.3,
    source: 'lint-fix',
    last_updated: new Date().toISOString().slice(0, 10)
  };

  const data = parsed.data || {};
  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      data[field] = defaults[field];
    }
  }

  const next = `${formatFrontmatter(data)}\n${parsed.body.trim()}\n`;
  if (!dryRun) writeMarkdown(page.file, next);
  return `frontmatter fixed: ${path.relative(ROOT, page.file).replace(/\\/g, '/')}`;
}

function fixIndexEntry(file, dryRun) {
  const content = readMarkdown(file);
  const parsed = parseFrontmatter(content);
  const title = parsed.data && parsed.data.title ? parsed.data.title : path.basename(file, '.md');
  const description = summarizeText(parsed.body, 90);
  upsertIndexEntry(file, title, description, dryRun);
  return `index updated: ${path.relative(ROOT, file).replace(/\\/g, '/')}`;
}

function fixOrphan(orphan, dryRun) {
  const parent = inferParentPage(orphan);
  if (!parent) {
    return { fixed: false, message: `needs review: ${path.relative(ROOT, orphan.file).replace(/\\/g, '/')}` };
  }
  const content = readMarkdown(parent);
  const parsed = parseFrontmatter(content);
  const nextBody = addRelatedLink(parsed.body, wikiLinkFromPath(orphan.file));
  const next = parsed.data ? `${formatFrontmatter(parsed.data)}\n${nextBody.trim()}\n` : nextBody;
  if (!dryRun) writeMarkdown(parent, next);
  return {
    fixed: true,
    message: `orphan linked: ${path.relative(ROOT, orphan.file).replace(/\\/g, '/')} -> ${path.relative(ROOT, parent).replace(/\\/g, '/')}`
  };
}

function archiveFact(item, dryRun) {
  const target = path.join(ARCHIVE, path.basename(item.file));
  const content = readMarkdown(item.file);
  if (!dryRun) {
    writeMarkdown(target, content);
    fs.unlinkSync(item.file);
  }
  upsertIndexEntry(target, path.basename(target, '.md'), 'archived by lint --fix', dryRun);
  return `archived: ${path.relative(ROOT, item.file).replace(/\\/g, '/')} -> ${path.relative(ROOT, target).replace(/\\/g, '/')}`;
}

function autoFix(options) {
  const actions = [];
  const reviews = [];

  for (const orphan of lintOrphans()) {
    const result = fixOrphan(orphan, options.dryRun);
    if (result.fixed) actions.push(result.message);
    else reviews.push(result.message);
  }

  const pages = getAllPages();
  for (const file of pages) {
    const parsed = parseFrontmatter(readMarkdown(file));
    if (!parsed.data || missingFrontmatterFields(parsed.data).length > 0) {
      actions.push(fixFrontmatter({ file }, options.dryRun));
    }
    actions.push(fixIndexEntry(file, options.dryRun));
  }

  for (const item of lintArchiveCandidates()) {
    actions.push(archiveFact(item, options.dryRun));
  }

  return { actions, reviews };
}

function buildReport(autoFixResult) {
  const today = new Date().toISOString().slice(0, 10);
  const orphans = lintOrphans();
  const archiveCandidates = lintArchiveCandidates();
  const fmIssues = lintFrontmatter();
  const indexHealth = lintIndexHealth();

  const report = [];
  report.push(`# Lint Report — ${today}`);
  report.push('');
  report.push('## 矛盾');
  report.push('- 当前版本未实现自动矛盾判真；冲突仍需人工 review。');
  report.push('');
  report.push(`## 孤立页 (${orphans.length})`);
  report.push(...(orphans.length ? orphans.map(item => `- ${path.relative(ROOT, item.file).replace(/\\/g, '/')}`) : ['- 无 ✅']));
  report.push('');
  report.push(`## 候选归档 (${archiveCandidates.length})`);
  report.push(...(archiveCandidates.length ? archiveCandidates.map(item => `- ${path.relative(ROOT, item.file).replace(/\\/g, '/')} (trust: ${item.trust})`) : ['- 无 ✅']));
  report.push('');
  report.push('## INDEX 健康');
  if (!indexHealth.exists) {
    report.push('- index.md 不存在 ❌');
  } else {
    report.push(`- index.md: ${indexHealth.bytes} bytes`);
    report.push(...(indexHealth.missing.length ? indexHealth.missing.map(item => `- 缺失: ${item}`) : ['- 链接存在性正常 ✅']));
  }
  report.push('');
  report.push(`## Frontmatter 问题 (${fmIssues.length})`);
  report.push(...(fmIssues.length ? fmIssues.map(item => `- ${path.relative(ROOT, item.file).replace(/\\/g, '/')}: ${item.issue}`) : ['- 无 ✅']));
  report.push('');
  report.push('## 自动修复记录');
  report.push(...(autoFixResult && autoFixResult.actions.length ? autoFixResult.actions.map(item => `- ${item}`) : ['- 未执行']));
  report.push('');
  report.push('## 需要 YANG 决策');
  report.push(...(autoFixResult && autoFixResult.reviews.length ? autoFixResult.reviews.map(item => `- ${item}`) : ['- 无 ✅']));
  report.push('');
  return report.join('\n') + '\n';
}

function main() {
  ensureBaseDirs();
  const opts = parseArgs();
  const autoFixResult = opts.fix ? autoFix(opts) : { actions: [], reviews: [] };
  const report = buildReport(autoFixResult);
  const out = path.join(TEMP, `lint-${new Date().toISOString().slice(0, 10)}.md`);
  if (!opts.dryRun) {
    writeMarkdown(out, report);
    appendLog('lint', opts.fix ? 'lint --fix' : 'lint', false);
  }
  console.log(report);
  if (opts.dryRun) console.log('(dry-run) no files changed');
}

main();
