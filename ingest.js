'use strict';

const fs = require('fs');
const path = require('path');
const {
  ROOT,
  RAW,
  SOURCES,
  ensureBaseDirs,
  readMarkdown,
  writeMarkdown,
  appendLog,
  inferCategoryFromText,
  hyphenTitle,
  wikiLinkFromPath,
  upsertIndexEntry,
  listRawFiles,
  summarizeText,
  addRelatedLink,
  buildPageContent,
  parseFrontmatter,
  getLocalDateString
} = require('./wiki-utils');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { file: null, dir: null, list: false, dryRun: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file') opts.file = args[++i];
    else if (args[i] === '--dir') opts.dir = args[++i];
    else if (args[i] === '--list') opts.list = true;
    else if (args[i] === '--dry-run') opts.dryRun = true;
  }
  return opts;
}

function resolveRawPath(target) {
  if (!target) return null;
  return path.isAbsolute(target) ? target : path.join(ROOT, target);
}

function listPendingFiles() {
  ensureBaseDirs();
  return listRawFiles(RAW)
    .filter(file => {
      const rel = path.relative(RAW, file).replace(/\\/g, '/');
      if (/(^|\/)\.[^/]+\//.test(rel)) return false;
      const slug = hyphenTitle(rel);
      return !fs.existsSync(path.join(SOURCES, `${slug}.md`));
    });
}

function chunkLargeText(content, size = 12000) {
  const chunks = [];
  for (let i = 0; i < content.length; i += size) {
    chunks.push(content.slice(i, i + size));
  }
  return chunks;
}

function gatherTargets(opts) {
  if (opts.file) return [resolveRawPath(opts.file)];
  if (opts.dir) return listRawFiles(resolveRawPath(opts.dir));
  return [];
}

function buildSourcePage(rawFile, content) {
  const slug = hyphenTitle(path.relative(RAW, rawFile));
  const title = path.basename(rawFile);
  const category = inferCategoryFromText(content, rawFile);
  const sourcePath = path.join(SOURCES, `${slug}.md`);
  const frontmatter = {
    id: `HERMES-SOURCE-${slug}`,
    title: `${title} 来源摘要`,
    type: 'source',
    tags: ['source', category],
    trust: 0.3,
    use_cases: ['追溯原始材料', '定位知识来源'],
    source: path.relative(ROOT, rawFile).replace(/\\/g, '/'),
    last_updated: getLocalDateString()
  };
  const summary = summarizeText(content, 220);
  const page = buildPageContent(frontmatter, `${title} 来源摘要`, {
    core: `## 核心内容\n\n- 原始文件：\`${path.relative(ROOT, rawFile).replace(/\\/g, '/')}\`\n- 推断分类：\`${category}\`\n- 摘要：${summary}`,
    recall: '## 召回条件\n\n- 当需要追溯该原始材料、确认结论来源或重新 ingest 时召回。',
    links: '## 相关链接\n'
  });
  return { slug, title, category, sourcePath, page, summary };
}

function buildCategoryPage(rawFile, content, sourceInfo, chunkIndex = null, chunkText = null) {
  const suffix = chunkIndex === null ? '' : `-part-${chunkIndex + 1}`;
  const slug = `${sourceInfo.slug}${suffix}`;
  const pageTitle = chunkIndex === null ? path.basename(rawFile, path.extname(rawFile)) : `${path.basename(rawFile, path.extname(rawFile))} Part ${chunkIndex + 1}`;
  const targetDir = path.join(ROOT, 'wiki', sourceInfo.category);
  const filePath = path.join(targetDir, `${slug}.md`);
  const frontmatter = {
    id: `HERMES-${sourceInfo.category.toUpperCase().replace(/[^A-Z0-9]/g, '-')}-${slug}`,
    title: pageTitle,
    type: sourceInfo.category === '04-facts' ? 'fact' : (sourceInfo.category === '03-system' ? 'workflow' : 'knowledge'),
    tags: [sourceInfo.category, 'ingest'],
    trust: 0.3,
    use_cases: ['从 raw 材料快速召回结论'],
    source: path.relative(ROOT, rawFile).replace(/\\/g, '/'),
    last_updated: getLocalDateString()
  };
  const summary = summarizeText(chunkText || content, 200);
  const wikiLink = wikiLinkFromPath(sourceInfo.sourcePath);
  const page = buildPageContent(frontmatter, pageTitle, {
    core: `## 核心内容\n\n${summary}`,
    recall: '## 召回条件\n\n- 当问题直接涉及该材料结论、路径约定、系统流程或事实摘要时召回。',
    links: `## 相关链接\n\n- ${wikiLink}`
  });
  return { filePath, pageTitle, page, summary };
}

function updateSourceBacklinks(sourceInfo, pages, dryRun) {
  let content = sourceInfo.page;
  for (const page of pages) {
    content = addRelatedLink(content, wikiLinkFromPath(page.filePath));
  }
  if (!dryRun) writeMarkdown(sourceInfo.sourcePath, content);
  return content;
}

function markConflict(existingContent, sourceInfo, rawFile) {
  if (existingContent.includes('[CONFLICT ')) return existingContent;
  const stamp = getLocalDateString();
  const note = `\n\n[CONFLICT ${stamp}] 新摄入来源 \`${path.relative(ROOT, rawFile).replace(/\\/g, '/')}\` 与当前页面内容可能不一致，需人工核对。\n`;
  return existingContent.trimEnd() + note;
}

function processFile(rawFile, dryRun) {
  const content = readMarkdown(rawFile);
  const sourceInfo = buildSourcePage(rawFile, content);
  const createdPages = [];
  const updatedPages = [];
  const conflicts = [];
  const relatedPages = [];
  const chunks = content.length > 20000 ? chunkLargeText(content) : [content];

  if (!dryRun) writeMarkdown(sourceInfo.sourcePath, sourceInfo.page);
  upsertIndexEntry(sourceInfo.sourcePath, `${sourceInfo.title} 来源摘要`, sourceInfo.summary, dryRun);

  chunks.forEach((chunk, index) => {
    const pageInfo = buildCategoryPage(rawFile, content, sourceInfo, chunks.length > 1 ? index : null, chunk);
    if (fs.existsSync(pageInfo.filePath)) {
      const existing = readMarkdown(pageInfo.filePath);
      const parsed = parseFrontmatter(existing);
      let nextBody = addRelatedLink(parsed.body, wikiLinkFromPath(sourceInfo.sourcePath));
      let nextContent = `${existing.startsWith('---') ? existing.slice(0, existing.indexOf(parsed.body)) : ''}${nextBody}`;
      if (!existing.includes(sourceInfo.summary.slice(0, 48))) {
        nextContent = markConflict(nextContent, sourceInfo, rawFile);
        conflicts.push(path.relative(ROOT, pageInfo.filePath).replace(/\\/g, '/'));
      }
      if (!dryRun) writeMarkdown(pageInfo.filePath, nextContent);
      updatedPages.push(pageInfo.filePath);
    } else {
      if (!dryRun) writeMarkdown(pageInfo.filePath, pageInfo.page);
      createdPages.push(pageInfo);
    }
    relatedPages.push(pageInfo);
    upsertIndexEntry(pageInfo.filePath, pageInfo.pageTitle, pageInfo.summary, dryRun);
  });

  updateSourceBacklinks(sourceInfo, relatedPages, dryRun);
  appendLog('ingest', path.basename(rawFile), dryRun);

  return {
    file: rawFile,
    created: createdPages.length + 1,
    updated: updatedPages.length,
    conflicts: conflicts.length
  };
}

function main() {
  ensureBaseDirs();
  const opts = parseArgs();
  if (opts.list) {
    const pending = listPendingFiles();
    pending.forEach(file => console.log(path.relative(ROOT, file).replace(/\\/g, '/')));
    console.log(`Pending: ${pending.length}`);
    return;
  }

  const targets = gatherTargets(opts).filter(file => fs.existsSync(file));
  if (targets.length === 0) {
    console.error('Usage: node ingest.js --file raw/xxx.md | --dir raw/articles | --list [--dry-run]');
    process.exit(1);
  }

  let totalCreated = 0;
  let totalUpdated = 0;
  let totalConflicts = 0;
  for (const rawFile of targets) {
    const result = processFile(rawFile, opts.dryRun);
    totalCreated += result.created;
    totalUpdated += result.updated;
    totalConflicts += result.conflicts;
  }

  console.log(`Created: ${totalCreated}`);
  console.log(`Updated: ${totalUpdated}`);
  console.log(`Conflicts: ${totalConflicts}`);
  if (opts.dryRun) console.log('(dry-run) no files changed');
}

main();
