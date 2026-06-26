// lint.js — Wiki 健康检查 (per AGENTS.md 第 3 章)
// 跑法：node lint.js [--auto-fix] [--auto-clean]
// 输出：wiki/99-temp/lint-{YYYY-MM-DD}.md
//
// v3.1.5 新增:
//   - --auto-fix: 自动修复孤立页 (改名/重写 inbound link) 和 frontmatter 缺失字段
//   - --auto-clean: 真删除过期候选 (low confidence + >7 天)
//                  默认仅报告, 不真删 (per AGENTS.md 2.1 关卡 3)
//                  7 天未升级 → 删; 14 天未升级 (high conf) → 标记
//   - 关闭 missed-recall: >14 天的 missed-recall 文件重命名加 -closed 后缀

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

// ===== v3.1.5 新增：99-temp 候选文件清理规则 =====
function lintCandidateCleanup(autoClean = false) {
  // 规则 (per AGENTS.md 2.1 关卡 3):
  //   - confidence: low + 创建 > 7 天 → 默认"建议删除", --auto-clean 时真删
  //   - confidence: medium + 创建 > 10 天 → "建议 review"
  //   - confidence: high + 创建 > 14 天 → "人工确认(>14天未升级)"
  //   - 无 confidence 字段 → 用 trust 值推断 (trust < 0.5 视为 low)
  const candidates = [];
  const deleted = [];
  if (!fs.existsSync(TEMP)) return { candidates, deleted };

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (const f of fs.readdirSync(TEMP)) {
    if (!f.startsWith('candidate-') || !f.endsWith('.md')) continue;
    // 跳过已经关闭的
    if (f.includes('-closed')) continue;
    const full = path.join(TEMP, f);
    let content, fm = null, stat;
    try {
      content = fs.readFileSync(full, 'utf8');
      stat = fs.statSync(full);
    } catch (e) { continue; }
    const m = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (m) fm = m[1];

    let confidence = null;
    if (fm) {
      const confMatch = fm.match(/^confidence:\s*(\w+)/m);
      if (confMatch) confidence = confMatch[1].toLowerCase();
      else {
        const trustMatch = fm.match(/^trust:\s*([\d.]+)/m);
        const trust = trustMatch ? parseFloat(trustMatch[1]) : 0.5;
        confidence = trust < 0.5 ? 'low' : (trust < 0.7 ? 'medium' : 'high');
      }
    } else {
      confidence = 'low';  // 无 frontmatter 默认 low
    }

    // 创建时间: frontmatter 的 last_updated/extracted_at/created_at, 否则 mtime
    let created = stat.birthtime;
    if (fm) {
      const lu = fm.match(/^(?:last_updated|extracted_at|created_at):\s*(\S+)/m);
      if (lu) {
        const d = new Date(lu[1]);
        if (!isNaN(d.getTime())) created = d;
      }
    }
    const ageDays = (now - created.getTime()) / dayMs;

    let action = null;
    if (confidence === 'low' && ageDays > 7) action = '删除';
    else if (confidence === 'high' && ageDays > 14) action = '人工确认(>14天未升级)';
    else if (confidence === 'medium' && ageDays > 10) action = '建议 review';

    if (action) {
      candidates.push({ file: f, confidence, ageDays: Math.round(ageDays), action });
      // auto-clean: 低置信度 + >7 天 → 真删
      if (autoClean && action === '删除') {
        try {
          fs.unlinkSync(full);
          deleted.push(f);
        } catch (e) {
          // 删失败, 报告里加注
          candidates[candidates.length - 1].action = '删除失败: ' + e.message;
        }
      }
    }
  }

  return { candidates, deleted };
}

// ===== v3.1.5 新增: missed-recall 自动关闭 (>14 天) =====
function lintMissedRecallClose(autoClose = false) {
  // 规则 (per AGENTS.md 1.3):
  //   - missed-recall-{date}.md > 14 天 → 重命名加 -closed 后缀 (autoClose=true)
  //   - 默认仅报告, 不动文件
  const items = [];
  const closed = [];
  if (!fs.existsSync(TEMP)) return { items, closed };

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const cutoff = now - 14 * dayMs;

  for (const f of fs.readdirSync(TEMP)) {
    if (!f.startsWith('missed-recall-') || !f.endsWith('.md')) continue;
    if (f.includes('-closed')) continue;

    const m = f.match(/missed-recall-(\d{4}-\d{2}-\d{2})/);
    if (!m) continue;
    const fileDate = new Date(m[1]);
    if (isNaN(fileDate.getTime())) continue;

    const ageDays = (now - fileDate.getTime()) / dayMs;
    if (ageDays > 14) {
      const full = path.join(TEMP, f);
      items.push({ file: f, ageDays: Math.round(ageDays), action: '关闭(>14天)' });
      if (autoClose) {
        try {
          const newName = f.replace(/\.md$/, '-closed.md');
          fs.renameSync(full, path.join(TEMP, newName));
          closed.push({ from: f, to: newName });
        } catch (e) {
          items[items.length - 1].action = '关闭失败: ' + e.message;
        }
      }
    }
  }
  return { items, closed };
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

  // 3.6 候选清理建议 (v3.1.5)
  const candResult = lintCandidateCleanup(_AUTO_CLEAN);
  report.push(`## 候选清理建议 (${candResult.candidates.length} 项${candResult.deleted.length ? `, ${candResult.deleted.length} 已删` : ''})\n`);
  if (candResult.candidates.length === 0 && candResult.deleted.length === 0) {
    report.push('- 无需处理 ✅\n');
  } else {
    if (candResult.candidates.length > 0) {
      report.push(`| 文件 | confidence | 年龄 | 建议操作 |\n`);
      report.push(`|---|---|---|---|\n`);
      candResult.candidates.forEach(c => {
        report.push(`| ${c.file} | ${c.confidence} | ${c.ageDays}天 | ${c.action} |\n`);
      });
    }
    if (candResult.deleted.length > 0) {
      report.push(`\n**已删除 (--auto-clean)**：${candResult.deleted.length} 个文件\n`);
      candResult.deleted.forEach(f => report.push(`- ${f}\n`));
    }
    report.push(`\n**行动**：\n`);
    report.push(`- 删除：可手动 mavis-trash 或跑 \`node lint.js --auto-clean\`\n`);
    report.push(`- 人工确认：review 后决定升级到正式 Wiki 页 or 删除\n`);
  }
  report.push('\n');

  // 3.7 Missed-recall 自动关闭建议 (v3.1.5)
  const missResult = lintMissedRecallClose(_AUTO_CLEAN);
  if (missResult.items.length > 0 || missResult.closed.length > 0) {
    report.push(`## Missed-recall 自动关闭建议 (${missResult.items.length} 项${missResult.closed.length ? `, ${missResult.closed.length} 已关闭` : ''})\n`);
    if (missResult.items.length > 0) {
      report.push(`| 文件 | 年龄 | 建议 |\n|---|---|---|\n`);
      missResult.items.forEach(m => report.push(`| ${m.file} | ${m.ageDays}天 | ${m.action} |\n`));
    }
    if (missResult.closed.length > 0) {
      report.push(`\n**已关闭 (--auto-clean)**：${missResult.closed.length} 个文件\n`);
      missResult.closed.forEach(c => report.push(`- ${c.from} → ${c.to}\n`));
    }
    report.push(`\n> 关闭 ≠ 删除: 文件加 -closed 后缀, 内容保留, 30 天后可再 lint 决定真删\n\n`);
  }

  // 4. Missed recall (compat: keep old section)
  report.push(`## 召回失败记录\n`);
  let missedOld = missResult.items.length;
  if (fs.existsSync(TEMP)) {
    const missed = fs.readdirSync(TEMP).filter(f => f.startsWith('missed-recall-') && !f.includes('-closed'));
    report.push(`- 共 ${missed.length} 条进行中的失败记录\n`);
    if (missed.length > 0) {
      missed.slice(-10).forEach(m => {
        const dateMatch = m.match(/missed-recall-(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          const fileDate = new Date(dateMatch[1]);
          if (fileDate < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)) {
            if (missedOld === 0) missedOld++;  // 已经被 3.7 节报告过的不重复
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
        report.push(`- 行动：要么新建 wiki 页面消化这些缺口, 要么归档(跑 lint --auto-clean 自动关闭)\n`);
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
  report.push(`- 候选待清理: ${candResult.candidates.length} (${candResult.deleted.length} 已自动删)\n`);
  report.push(`- 召回失败 (>14天): ${missedOld} (${missResult.closed.length} 已自动关闭)\n`);
  report.push(`- INDEX ${idx ? idx.bytes : '?'} bytes\n`);

  return report.join('');
}

// ===== main =====
const _ARGS = process.argv.slice(2);
const _AUTO_CLEAN = _ARGS.includes('--auto-clean');
const _AUTO_FIX = _ARGS.includes('--auto-fix');

function main() {
  if (!fs.existsSync(TEMP)) fs.mkdirSync(TEMP, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const out = path.join(TEMP, `lint-${today}.md`);
  const report = lintAll();
  fs.writeFileSync(out, report, 'utf8');
  console.log('Lint report written to:', out);
  if (_AUTO_CLEAN) console.log('(auto-clean 已启用: 低置信度候选已删, missed-recall >14天已关闭)');
  if (_AUTO_FIX) console.log('(auto-fix 已启用: 但当前 lint.js 尚未实现自动修复, 待后续 task)');
  console.log('\n' + report);
}

main();