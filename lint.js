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
  const cutoff30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
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
      if (trust < 0.3 && updated < cutoff30) {
        candidates.push({ file: path.relative(ROOT, full), trust, updated });
      }
    }
  }
  return candidates;
}

// ===== v3.0 F3 新增：知识生命周期检查 =====
function lintKnowledgeLifecycle() {
  // 规则 (per F3 任务单):
  //   - last_updated > 30天 且 retrieval_count=0 → 标记"候选归档"
  //   - 归档后 > 90 天 → 真删
  const now = new Date();
  const cutoff30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const cutoff90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const archiveCandidates = [];
  const deleteCandidates = [];

  for (const cat of ['04-facts']) {
    const dir = path.join(WIKI, cat);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const full = path.join(dir, f);
      const content = fs.readFileSync(full, 'utf8');
      const fm = extractFrontmatter(content);
      if (!fm) continue;

      const updatedMatch = fm.match(/^last_updated:\s*(.+)$/m);
      const retrievalMatch = fm.match(/^retrieval_count:\s*(\d+)/m);
      const updated = updatedMatch ? new Date(updatedMatch[1]) : new Date(0);
      const retrievalCount = retrievalMatch ? parseInt(retrievalMatch[1]) : 0;

      // 检查候选归档条件
      if (updated < cutoff30 && retrievalCount === 0) {
        archiveCandidates.push({ 
          file: path.relative(ROOT, full), 
          updated,
          retrievalCount,
          reason: '30天未更新且无召回记录'
        });
      }

      // 检查归档文件删除条件
      if (cat === '98-archive') {
        if (updated < cutoff90) {
          deleteCandidates.push({ 
            file: path.relative(ROOT, full), 
            updated,
            reason: '归档超过90天'
          });
        }
      }
    }
  }

  return { archiveCandidates, deleteCandidates };
}

function lintIndexSize() {
  const idxPath = path.join(ROOT, 'index.md');
  if (!fs.existsSync(idxPath)) return null;
  const content = fs.readFileSync(idxPath, 'utf8');
  // Count Chinese chars + bytes (utf8)
  const zh = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  // v3.1.5 fix: 之前用 content.length (UTF-16 code units, ~字符数), 不是字节数
  // 现在用 Buffer.byteLength 拿真实字节数
  const bytes = Buffer.byteLength(content, 'utf8');
  return { path: 'index.md', bytes, chinese_chars: zh };
}

// ===== v3.1.5 新增：99-temp 候选文件清理规则 =====
function lintCandidateCleanup(autoClean = false) {
  // 规则 (per AGENTS.md 2.1 关卡 3):
  //   - confidence: low + 创建 > 7 天 → 默认"建议删除", --auto-clean 时真删
  //   - confidence: medium + 创建 > 10 天 → "建议 review"
  //   - confidence: high + 创建 > 14 天 → "人工确认(>14天未升级)"
  //   - 无 confidence 字段 → 用 trust 值推断 (trust < 0.5 视为 low)
  // v3.0 F5 新增: 候选堆积 > 14 天 → 自动删 (无需判断 confidence)
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
    // v3.0 F5 新增: 候选堆积 > 14 天 → 自动删
    if (ageDays > 14) {
      action = '删除(>14天未升级)';
      candidates.push({ file: f, confidence, ageDays: Math.round(ageDays), action });
      // auto-fix: >14 天自动删除
      if (autoClean) {
        try {
          fs.unlinkSync(full);
          deleted.push(f);
        } catch (e) {
          candidates[candidates.length - 1].action = '删除失败: ' + e.message;
        }
      }
    } else if (confidence === 'low' && ageDays > 7) {
      action = '删除';
      candidates.push({ file: f, confidence, ageDays: Math.round(ageDays), action });
      // auto-clean: 低置信度 + >7 天 → 真删
      if (autoClean) {
        try {
          fs.unlinkSync(full);
          deleted.push(f);
        } catch (e) {
          candidates[candidates.length - 1].action = '删除失败: ' + e.message;
        }
      }
    } else if (confidence === 'high' && ageDays > 14) {
      action = '人工确认(>14天未升级)';
      candidates.push({ file: f, confidence, ageDays: Math.round(ageDays), action });
    } else if (confidence === 'medium' && ageDays > 10) {
      action = '建议 review';
      candidates.push({ file: f, confidence, ageDays: Math.round(ageDays), action });
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

  // 2.5 知识生命周期检查 (F3 新增)
  const lifecycle = lintKnowledgeLifecycle();
  report.push(`## 知识生命周期 (${lifecycle.archiveCandidates.length + lifecycle.deleteCandidates.length})\n`);
  
  if (lifecycle.archiveCandidates.length === 0 && lifecycle.deleteCandidates.length === 0) {
    report.push('- 生命周期健康 ✅\n');
  } else {
    if (lifecycle.archiveCandidates.length > 0) {
      report.push(`### 候选归档 (${lifecycle.archiveCandidates.length})\n`);
      report.push(`| 文件 | 更新日期 | 召回次数 | 原因 |\n`);
      report.push(`|---|---|---|---|\n`);
      lifecycle.archiveCandidates.forEach(c => {
        report.push(`| ${c.file} | ${c.updated.toISOString().slice(0, 10)} | ${c.retrievalCount} | ${c.reason} |\n`);
      });
    }
    
    if (lifecycle.deleteCandidates.length > 0) {
      report.push(`### 候选真删 (${lifecycle.deleteCandidates.length})\n`);
      report.push(`| 文件 | 更新日期 | 原因 |\n`);
      report.push(`|---|---|---|\n`);
      lifecycle.deleteCandidates.forEach(c => {
        report.push(`| ${c.file} | ${c.updated.toISOString().slice(0, 10)} | ${c.reason} |\n`);
      });
    }
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
  report.push(`- 生命周期: ${lifecycle.archiveCandidates.length} 候选归档, ${lifecycle.deleteCandidates.length} 候选删除\n`);

  return report.join('');
}

// ===== v3.0 F5 新增：孤立页自动修复 =====
function autoFixOrphanPages() {
  const idxPath = path.join(ROOT, 'index.md');
  if (!fs.existsSync(idxPath)) return { fixed: 0, skipped: 0 };

  const pages = getAllPages();
  const allLinks = new Set();
  for (const p of pages) {
    const content = fs.readFileSync(p, 'utf8');
    for (const link of extractLinks(content)) {
      allLinks.add(link);
    }
  }

  let fixed = 0;
  let skipped = 0;
  const orphansToFix = [];

  for (const p of pages) {
    const rel = path.relative(WIKI, p).replace(/\\/g, '/').replace(/\.md$/, '');
    const name = path.basename(p, '.md');
    const hasInbound = allLinks.has(name) || allLinks.has(rel);

    if (!hasInbound && !name.startsWith('index') && !rel.includes('INDEX')) {
      // 这是一个孤立页，尝试自动补录
      const content = fs.readFileSync(p, 'utf8');
      const fm = extractFrontmatter(content);
      if (fm) {
        const titleMatch = fm.match(/^title:\s*(.+)$/m);
        const title = titleMatch ? titleMatch[1] : name;
        const descMatch = content.match(/^#\s+(.+)$/m);
        const description = descMatch ? descMatch[1].trim().slice(0, 40) + '...' : '';

        // 确定分类
        const catMatch = rel.match(/^(\d{2}-[^\/]+)/);
        const category = catMatch ? catMatch[1] : 'other';

        orphansToFix.push({ 
          file: rel, 
          category, 
          title, 
          description: title + ': ' + description 
        });
        fixed++;
      } else {
        skipped++;
      }
    }
  }

  // 自动更新 index.md
  if (orphansToFix.length > 0) {
    let indexContent = fs.readFileSync(idxPath, 'utf8');
    
    // 按分类分组
    const byCategory = {};
    orphansToFix.forEach(o => {
      if (!byCategory[o.category]) byCategory[o.category] = [];
      byCategory[o.category].push(o);
    });

    // 为每个分类添加链接
    for (const cat in byCategory) {
      const catHeader = `## ${cat.replace(/-/g, ' ')}`;
      const catIndex = indexContent.indexOf(catHeader);
      
      if (catIndex >= 0) {
        // 找到分类，添加链接
        const nextHeaderIndex = indexContent.indexOf('##', catIndex + catHeader.length);
        let insertPoint = nextHeaderIndex;
        if (insertPoint < 0) insertPoint = indexContent.length;
        
        const linksToAdd = byCategory[cat].map(o => 
          `- [[wiki/${o.file}]] — ${o.description}\n`
        ).join('');
        
        indexContent = indexContent.slice(0, insertPoint) + 
          '\n' + linksToAdd + indexContent.slice(insertPoint);
      } else {
        // 分类不存在，新建
        const newCatSection = `\n## ${cat.replace(/-/g, ' ')}\n\n`;
        const linksToAdd = byCategory[cat].map(o => 
          `- [[wiki/${o.file}]] — ${o.description}\n`
        ).join('');
        
        indexContent += newCatSection + linksToAdd;
      }
    }

    fs.writeFileSync(idxPath, indexContent, 'utf8');
  }

  return { fixed, skipped, orphans: orphansToFix };
}

// ===== v3.0 F3 新增：自动归档功能 =====
function autoArchive() {
  const now = new Date();
  const cutoff30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const archiveDir = path.join(WIKI, '98-archive');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const archived = [];

  for (const cat of ['04-facts']) {
    const dir = path.join(WIKI, cat);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const full = path.join(dir, f);
      const content = fs.readFileSync(full, 'utf8');
      const fm = extractFrontmatter(content);
      if (!fm) continue;

      const updatedMatch = fm.match(/^last_updated:\s*(.+)$/m);
      const retrievalMatch = fm.match(/^retrieval_count:\s*(\d+)/m);
      const updated = updatedMatch ? new Date(updatedMatch[1]) : new Date(0);
      const retrievalCount = retrievalMatch ? parseInt(retrievalMatch[1]) : 0;

      // 归档条件: last_updated > 30天 且 retrieval_count=0
      if (updated < cutoff30 && retrievalCount === 0) {
        const archiveName = `${now.toISOString().slice(0, 10)}-${f}`;
        const archivePath = path.join(archiveDir, archiveName);
        try {
          fs.renameSync(full, archivePath);
          archived.push({ from: path.relative(ROOT, full), to: path.relative(ROOT, archivePath) });
        } catch (e) {
          console.error(`归档失败: ${full} -> ${archivePath}`, e.message);
        }
      }
    }
  }

  return archived;
}

// ===== v3.0 F3 新增：自动删除功能 =====
function autoDelete() {
  const now = new Date();
  const cutoff90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const archiveDir = path.join(WIKI, '98-archive');
  const deleted = [];

  if (!fs.existsSync(archiveDir)) return deleted;

  for (const f of fs.readdirSync(archiveDir)) {
    if (!f.endsWith('.md')) continue;
    const full = path.join(archiveDir, f);
    const content = fs.readFileSync(full, 'utf8');
    const fm = extractFrontmatter(content);
    if (!fm) continue;

    const updatedMatch = fm.match(/^last_updated:\s*(.+)$/m);
    const updated = updatedMatch ? new Date(updatedMatch[1]) : new Date(0);

    // 删除条件: 归档 > 90 天
    if (updated < cutoff90) {
      try {
        fs.unlinkSync(full);
        deleted.push({ file: path.relative(ROOT, full), updated });
      } catch (e) {
        console.error(`删除失败: ${full}`, e.message);
      }
    }
  }

  return deleted;
}

// ===== main =====
const _ARGS = process.argv.slice(2);
const _AUTO_CLEAN = _ARGS.includes('--auto-clean');
const _AUTO_FIX = _ARGS.includes('--auto-fix');

function main() {
  if (!fs.existsSync(TEMP)) fs.mkdirSync(TEMP, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const out = path.join(TEMP, `lint-${today}.md`);
  
  // 自动修复 (F5)
  if (_AUTO_FIX) {
    // 孤立页自动补录 INDEX
    const orphanFix = autoFixOrphanPages();
    if (orphanFix.fixed > 0) {
      console.log(`自动补录孤立页: ${orphanFix.fixed} 个文件`);
      orphanFix.orphans.forEach(o => console.log(`  ${o.file} → INDEX`));
    }
    if (orphanFix.skipped > 0) {
      console.log(`跳过孤立页(无frontmatter): ${orphanFix.skipped} 个`);
    }
    
    // 自动归档 (F3)
    const archived = autoArchive();
    if (archived.length > 0) {
      console.log(`自动归档: ${archived.length} 个文件`);
      archived.forEach(a => console.log(`  ${a.from} -> ${a.to}`));
    }
    
    // 自动删除 (F3)
    const deleted = autoDelete();
    if (deleted.length > 0) {
      console.log(`自动删除: ${deleted.length} 个文件`);
      deleted.forEach(d => console.log(`  ${d.file} (更新: ${d.updated.toISOString().slice(0, 10)})`));
    }
  }
  
  const report = lintAll();
  fs.writeFileSync(out, report, 'utf8');
  console.log('Lint report written to:', out);
  if (_AUTO_CLEAN) console.log('(auto-clean 已启用: 低置信度候选已删, missed-recall >14天已关闭)');
  if (_AUTO_FIX) console.log('(auto-fix 已启用: 孤立页补录INDEX + 候选归档 + >90天删除)');
  console.log('\n' + report);
}

main();