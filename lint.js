// lint.js — Wiki 健康检查 (per AGENTS.md 第 3 章)
// 跑法：node lint.js [--auto-fix]
// 输出：wiki/99-temp/lint-{YYYY-MM-DD}.md

const fs = require('fs');
const path = require('path');

const ROOT = 'D:\\ai_schedule\\hermes-brain';
const WIKI = path.join(ROOT, 'wiki');
const TEMP = path.join(WIKI, '99-temp');

function walkPages(dir, list = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkPages(full, list);
    else if (entry.name.endsWith('.md')) list.push(full);
  }
  return list;
}

function extractFrontmatter(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return null;
  return m[1];
}

function extractLinks(content) {
  // Find [[wiki-link]] and bare link references
  const links = [];
  const linkRe = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = linkRe.exec(content)) !== null) {
    links.push(m[1].trim());
  }
  return links;
}

function getAllPages() {
  return walkPages(WIKI).filter(f => !f.includes('99-temp'));
}

function lintFrontmatter() {
  const requiredFields = ['id', 'title', 'type', 'tags', 'trust', 'last_updated'];
  const issues = [];
  const pages = getAllPages();
  for (const p of pages) {
    const content = fs.readFileSync(p, 'utf8');
    const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (!fmMatch) {
      issues.push({ file: path.relative(WIKI, p), issue: 'missing frontmatter' });
      continue;
    }
    const fm = fmMatch[1];
    for (const field of requiredFields) {
      const re = new RegExp(`^${field}:`, 'm');
      if (!re.test(fm)) {
        issues.push({ file: path.relative(WIKI, p), issue: `missing field: ${field}` });
      }
    }
  }
  return issues;
}

function lintOrphanPages() {
  const pages = getAllPages();
  const allLinks = new Set();
  for (const p of pages) {
    const content = fs.readFileSync(p, 'utf8');
    for (const link of extractLinks(content)) {
      allLinks.add(link);
    }
  }
  // Also include links from root INDEX.md (it's outside wiki/ but lists wiki pages)
  const indexFile = path.join(ROOT, 'index.md');
  if (fs.existsSync(indexFile)) {
    const indexContent = fs.readFileSync(indexFile, 'utf8');
    for (const link of extractLinks(indexContent)) {
      allLinks.add(link);
    }
  }
  const orphans = [];
  for (const p of pages) {
    const rel = path.relative(WIKI, p).replace(/\\/g, '/').replace(/\.md$/, '');
    const name = path.basename(p, '.md');
    // Has incoming link if its name OR full path is in allLinks
    const hasInbound = allLinks.has(name) || allLinks.has(rel);
    if (!hasInbound && !name.startsWith('index') && !rel.includes('INDEX')) {
      orphans.push({ file: rel, name });
    }
  }
  return orphans;
}

function lintExpiringFacts() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const candidates = [];

  for (const cat of ['04-facts']) {
    const dir = path.join(WIKI, cat);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const full = path.join(dir, f);
      const content = fs.readFileSync(full, 'utf8');
      const fm = extractFrontmatter(content);
      if (!fm) continue;
      const trustMatch = fm.match(/^trust:\s*([\d.]+)/m);
      const updatedMatch = fm.match(/^last_updated:\s*(.+)$/m);
      const trust = trustMatch ? parseFloat(trustMatch[1]) : 1;
      const updated = updatedMatch ? new Date(updatedMatch[1]) : new Date(0);
      if (trust < 0.3 && updated < cutoff) {
        candidates.push({ file: path.relative(ROOT, full), trust, updated });
      }
    }
  }
  return candidates;
}

function lintIndexSize() {
  const idxPath = path.join(ROOT, 'index.md');
  if (!fs.existsSync(idxPath)) return null;
  const content = fs.readFileSync(idxPath, 'utf8');
  // Count Chinese chars + ASCII chars as approximation
  const zh = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const total = content.length;
  return { path: 'index.md', bytes: total, chinese_chars: zh };
}

function lintAll() {
  const today = new Date().toISOString().slice(0, 10);
  const report = [];
  report.push(`# Lint Report — ${today}\n`);
  report.push(`> 自动生成 by lint.js，详见 AGENTS.md 第 3 章\n\n---\n`);

  // 1. Orphan pages
  const orphans = lintOrphanPages();
  report.push(`## 孤立页 (${orphans.length})\n`);
  if (orphans.length === 0) {
    report.push('- 无 ✅\n');
  } else {
    orphans.forEach(o => report.push(`- ${o.file}\n`));
  }
  report.push('\n');

  // 2. Expiring facts
  const expiring = lintExpiringFacts();
  report.push(`## 候选归档 (${expiring.length})\n`);
  if (expiring.length === 0) {
    report.push('- 无 ✅\n');
  } else {
    expiring.forEach(e => report.push(`- ${e.file} (trust: ${e.trust}, updated: ${e.updated.toISOString().slice(0, 10)})\n`));
  }
  report.push('\n');

  // 3. INDEX size
  const idx = lintIndexSize();
  report.push(`## INDEX 健康\n`);
  if (idx) {
    const status = idx.bytes <= 1600 ? '✅ 健康' : '⚠️ 超 1600 bytes';
    report.push(`- ${idx.path}: ${idx.bytes} bytes / 约 ${idx.chinese_chars} 汉字 (${status})\n`);
  } else {
    report.push('- INDEX.md 不存在 ❌\n');
  }
  report.push('\n');

  // 3.5 Frontmatter check
  const fmIssues = lintFrontmatter();
  report.push(`## Frontmatter 必填字段 (${fmIssues.length} 处问题)\n`);
  if (fmIssues.length === 0) {
    report.push('- 所有页面都通过校验 ✅\n');
  } else {
    fmIssues.slice(0, 10).forEach(i => report.push(`- ${i.file}: ${i.issue}\n`));
    if (fmIssues.length > 10) {
      report.push(`- ... 还有 ${fmIssues.length - 10} 处\n`);
    }
  }
  report.push('\n');

  // 4. Missed recall (check 99-temp)
  report.push(`## 召回失败记录\n`);
  let missedOld = 0;  // > 14 days old
  if (fs.existsSync(TEMP)) {
    const missed = fs.readdirSync(TEMP).filter(f => f.startsWith('missed-recall-'));
    report.push(`- 共 ${missed.length} 条失败记录\n`);
    if (missed.length > 0) {
      // Check age: files older than 14 days should be upgraded
      const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      missed.slice(-10).forEach(m => {
        const dateMatch = m.match(/missed-recall-(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          const fileDate = new Date(dateMatch[1]);
          if (fileDate < cutoff) {
            missedOld++;
            report.push(`  - ⚠️ ${m} (>14天，建议升级或归档)\n`);
          } else {
            report.push(`  - ${m}\n`);
          }
        } else {
          report.push(`  - ${m}\n`);
        }
      });
      if (missedOld > 0) {
        report.push(`\n**⚠️ 升级建议**：${missedOld} 个 missed-recall 文件超过 14 天未升级\n`);
        report.push(`- 行动：要么新建 wiki 页面消化这些缺口，要么归档（删除）\n`);
      }
    }
  } else {
    report.push('- 99-temp 目录不存在\n');
  }
  report.push('\n');

  // Summary
  report.push(`---\n\n## 总结\n`);
  report.push(`- Wiki 总页面数: ${getAllPages().length}\n`);
  report.push(`- 孤立页: ${orphans.length}\n`);
  report.push(`- 候选归档: ${expiring.length}\n`);
  report.push(`- 召回失败 (>14天): ${missedOld}\n`);
  report.push(`- INDEX ${idx ? idx.bytes : '?'} bytes\n`);

  return report.join('');
}

function main() {
  const report = lintAll();
  if (!fs.existsSync(TEMP)) fs.mkdirSync(TEMP, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const out = path.join(TEMP, `lint-${today}.md`);
  fs.writeFileSync(out, report, 'utf8');
  console.log('Lint report written to:', out);
  console.log('\n' + report);
}

main();