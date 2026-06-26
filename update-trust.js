// update-trust.js — 更新 04-facts 中单条 fact 的 trust + retrieval_count
// 用法: node update-trust.js <fact-id> <delta>
//   例: node update-trust.js HERMES-FACT-002 +0.1
//       node update-trust.js HERMES-FACT-007 -0.2
//       node update-trust.js HERMES-FACT-002 --show
//
// 行为:
//   - 在 wiki/04-facts/*.md 中扫描所有 "## HERMES-FACT-XXX" 段
//   - 找到指定 id 的段, 更新该段内的 **trust**: 和 **retrieval_count**:
//   - 同时更新段标题里的 (trust: X.X)
//   - 信任值范围 [0.0, 1.0], delta 会做边界截断
//   - 自动更新 frontmatter 的 last_updated
//   - --show 模式: 只显示当前值, 不修改
//
// 找不到 fact-id → 列出所有可用 id 然后退出 1

'use strict';

const fs = require('fs');
const path = require('path');
const { walkMarkdown, parseFrontmatter, formatFrontmatter, getLocalDateString } = require('./wiki-utils');

const ROOT = path.join('D:', 'ai_schedule', 'hermes-brain');
const FACTS_DIR = path.join(ROOT, 'wiki', '04-facts');

function listFactIds(dir) {
  const ids = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md')) continue;
    const full = path.join(dir, f);
    const content = fs.readFileSync(full, 'utf8');
    const re = /^## (HERMES-FACT-\S+)/gm;
    let m;
    while ((m = re.exec(content)) !== null) ids.push({ id: m[1], file: f, mode: 'section' });
    const parsed = parseFrontmatter(content);
    if (parsed.data && parsed.data.id) {
      ids.push({ id: parsed.data.id, file: f, mode: 'frontmatter' });
    }
  }
  return ids;
}

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length < 1 || args[0] === '-h' || args[0] === '--help') {
    console.log('用法: node update-trust.js <fact-id> <delta>');
    console.log('     node update-trust.js <fact-id> --show');
    process.exit(args.length < 1 ? 1 : 0);
  }
  const factId = args[0];
  let delta = null;
  let showOnly = false;
  if (args.length >= 2) {
    if (args[1] === '--show') showOnly = true;
    else delta = parseFloat(args[1]);
  }
  return { factId, delta, showOnly };
}

function updateFactInSection(content, factId, delta) {
  const headerRe = new RegExp(`^## (${factId.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}) \\(trust: ([0-9.]+)\\)`, 'm');
  const headerMatch = content.match(headerRe);
  if (!headerMatch) return { ok: false, reason: 'header_not_found' };

  const headerStart = headerMatch.index;
  const oldTrust = parseFloat(headerMatch[2]);
  const newTrust = Math.max(0, Math.min(1, oldTrust + delta));
  const afterHeader = headerStart + headerMatch[0].length;
  const nextHeaderRe = /^## /gm;
  nextHeaderRe.lastIndex = afterHeader;
  const nextMatch = nextHeaderRe.exec(content);
  const sectionEnd = nextMatch ? nextMatch.index : content.length;
  const section = content.slice(headerStart, sectionEnd);

  const newSection = section
    .replace(/^(\s*## HERMES-FACT-\S+ \(trust: )[0-9.]+(\))/m, `$1${newTrust.toFixed(1)}$2`)
    .replace(/^(\s*-\s+\*\*trust\*\*:\s*)[0-9.]+/m, `$1${newTrust.toFixed(1)}`)
    .replace(/^(\s*-\s+\*\*retrieval_count\*\*:\s*)(\d+)/m, (_, p1, p2) => `${p1}${parseInt(p2, 10) + 1}`);

  const newContent = content.slice(0, headerStart) + newSection + content.slice(sectionEnd);
  const updated = newContent.replace(/^(last_updated:\s*)\S+/m, `$1${getLocalDateString()}`);
  return { ok: true, content: updated, oldTrust, newTrust, mode: 'section' };
}

function updateFrontmatterPage(content, delta) {
  const parsed = parseFrontmatter(content);
  if (!parsed.data) return { ok: false, reason: 'missing_frontmatter' };
  const oldTrust = Number(parsed.data.trust || 0.3);
  const newTrust = Math.max(0, Math.min(1, oldTrust + delta));
  const retrievalCount = Number(parsed.data.retrieval_count || 0) + 1;
  parsed.data.trust = Number(newTrust.toFixed(1));
  parsed.data.retrieval_count = retrievalCount;
  parsed.data.last_updated = getLocalDateString();
  const updated = `${formatFrontmatter(parsed.data)}\n${parsed.body.trim()}\n`;
  return { ok: true, content: updated, oldTrust, newTrust, mode: 'frontmatter' };
}

function showFact(content, factId) {
  const parsed = parseFrontmatter(content);
  if (parsed.data && parsed.data.id === factId) {
    return content.trim();
  }
  const headerRe = new RegExp(`^## (${factId.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})[^\\n]*`, 'm');
  const m = content.match(headerRe);
  if (!m) return null;
  const start = m.index;
  const after = start + m[0].length;
  const nextRe = /^## /gm;
  nextRe.lastIndex = after;
  const next = nextRe.exec(content);
  const end = next ? next.index : content.length;
  return content.slice(start, end);
}

function main() {
  const { factId, delta, showOnly } = parseArgs();
  if (!fs.existsSync(FACTS_DIR)) {
    console.error(`❌ 04-facts 目录不存在: ${FACTS_DIR}`);
    process.exit(1);
  }

  const ids = listFactIds(FACTS_DIR);
  const found = ids.find(x => x.id === factId);
  if (!found) {
    console.error(`❌ 找不到 fact-id: ${factId}`);
    console.error(`可用 id (${ids.length} 条):`);
    ids.slice(0, 30).forEach(x => console.error(`  ${x.id}  (in ${x.file})`));
    if (ids.length > 30) console.error(`  ... +${ids.length - 30} more`);
    process.exit(1);
  }

  const filepath = path.join(FACTS_DIR, found.file);
  const content = fs.readFileSync(filepath, 'utf8');
  if (showOnly) {
    const section = showFact(content, factId);
    if (section) console.log(section.trim());
    else process.exit(1);
    return;
  }
  if (delta === null || isNaN(delta)) {
    console.error('❌ delta 必须是数字');
    process.exit(1);
  }

  const result = found.mode === 'frontmatter' && !content.includes(`## ${factId}`)
    ? updateFrontmatterPage(content, delta)
    : updateFactInSection(content, factId, delta);
  if (!result.ok && found.mode === 'section') {
    const fallback = updateFrontmatterPage(content, delta);
    if (!fallback.ok) {
      console.error(`❌ 更新失败: ${result.reason}`);
      process.exit(1);
    }
    fs.writeFileSync(filepath, fallback.content, 'utf8');
    console.log(`✅ ${factId} (${found.file}) [frontmatter]:`);
    console.log(`   trust: ${fallback.oldTrust.toFixed(1)} → ${fallback.newTrust.toFixed(1)} (delta: ${delta > 0 ? '+' : ''}${delta})`);
    console.log('   retrieval_count: +1');
    console.log(`   last_updated: ${getLocalDateString()}`);
    return;
  }
  if (!result.ok) {
    console.error(`❌ 更新失败: ${result.reason}`);
    process.exit(1);
  }

  fs.writeFileSync(filepath, result.content, 'utf8');
  console.log(`✅ ${factId} (${found.file}) [${result.mode}]:`);
  console.log(`   trust: ${result.oldTrust.toFixed(1)} → ${result.newTrust.toFixed(1)} (delta: ${delta > 0 ? '+' : ''}${delta})`);
  console.log('   retrieval_count: +1');
  console.log(`   last_updated: ${getLocalDateString()}`);
}

if (require.main === module) main();

