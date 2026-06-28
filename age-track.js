'use strict';
// age-track.js — 知识新鲜度检查 (v1.0)
// 用法: node age-track.js [--threshold=30] [--archive]
// 扫描所有 wiki 页面，找出超过 N 天未更新的页面
//
// --threshold=30  : 多少天算"旧" (默认 30)
// --archive       : 将旧页面移至 98-archive（谨慎使用）

const fs = require('fs');
const path = require('path');

const ROOT = 'D:\\ai_schedule\\hermes-brain';
const WIKI = path.join(ROOT, 'wiki');
const ARCHIVE = path.join(WIKI, '98-archive');

// 跳过目录
const SKIP_DIRS = ['98-archive', '99-temp', '.obsidian'];

function walkMarkdown(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.includes(entry.name)) {
        results.push(...walkMarkdown(full));
      }
    } else if (entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function parseFrontmatter(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return null;
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) data[kv[1]] = kv[2].trim();
  }
  return { data, body: content.slice(m[0].length) };
}

function parseArgs() {
  const args = process.argv.slice(2);
  let threshold = 30;
  let archive = false;
  for (const arg of args) {
    if (arg.startsWith('--threshold=')) threshold = parseInt(arg.split('=')[1], 10);
    if (arg === '--archive') archive = true;
    if (arg === '--help' || arg === '-h') {
      console.log('用法: node age-track.js [--threshold=30] [--archive]');
      process.exit(0);
    }
  }
  return { threshold, archive };
}

function main() {
  const opts = parseArgs();
  const now = Date.now();
  const cutoff = opts.threshold * 24 * 60 * 60 * 1000;
  const pages = walkMarkdown(WIKI);

  const aged = [];
  const unknown = [];

  for (const file of pages) {
    const content = fs.readFileSync(file, 'utf8');
    const parsed = parseFrontmatter(content);
    if (!parsed || !parsed.data) {
      unknown.push({ file, reason: 'no frontmatter' });
      continue;
    }

    const updated = parsed.data.last_updated || parsed.data.date || '';
    if (!updated) {
      unknown.push({ file, reason: 'no last_updated field' });
      continue;
    }

    // Parse date - try multiple formats
    const ts = new Date(updated).getTime();
    if (isNaN(ts)) {
      unknown.push({ file, reason: `unparseable date: ${updated}` });
      continue;
    }

    const ageDays = (now - ts) / (24 * 60 * 60 * 1000);
    if (ageDays > opts.threshold) {
      aged.push({ file, ageDays: Math.round(ageDays), updated });
    }
  }

  // Report
  console.log(`# 知识新鲜度报告 — ${new Date().toISOString().slice(0, 10)}`);
  console.log(`阈值: ${opts.threshold} 天`);
  console.log('');
  console.log(`## 过期页面 (${aged.length})`);
  console.log('');
  if (aged.length === 0) {
    console.log('无 — 所有页面都在阈值内 ✅');
  } else {
    aged.sort((a, b) => b.ageDays - a.ageDays);
    for (const page of aged) {
      const rel = path.relative(ROOT, page.file).replace(/\\/g, '/');
      console.log(`- ${rel}  (${page.ageDays}天未更新, 最后: ${page.updated})`);
    }
  }

  console.log('');
  console.log(`## 无法判断 (${unknown.length})`);
  if (unknown.length > 0) {
    for (const page of unknown) {
      const rel = path.relative(ROOT, page.file).replace(/\\/g, '/');
      console.log(`- ${rel}  (${page.reason})`);
    }
  }

  // Archive mode
  if (opts.archive && aged.length > 0) {
    console.log('');
    console.log('## 归档操作');
    if (!fs.existsSync(ARCHIVE)) fs.mkdirSync(ARCHIVE, { recursive: true });
    for (const page of aged) {
      const rel = path.relative(WIKI, page.file);
      const dest = path.join(ARCHIVE, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.renameSync(page.file, dest);
      console.log(`- moved: ${rel} → 98-archive/${rel}`);
    }
  }

  console.log('');
  console.log('---');
  console.log(`总计: ${pages.length} 页 | 过期: ${aged.length} | 无法判断: ${unknown.length}`);
}

main();
