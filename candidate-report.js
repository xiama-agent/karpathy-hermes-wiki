'use strict';
// candidate-report.js — 候选知识汇报 (v1.0)
// 用法: node candidate-report.js
// 读取 99-temp 所有候选文件，汇总成表格输出

const fs = require('fs');
const path = require('path');

const TEMP = 'D:\\ai_schedule\\hermes-brain\\wiki\\99-temp';

function parseFrontmatter(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) data[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return data;
}

function main() {
  if (!fs.existsSync(TEMP)) {
    console.log('99-temp 目录为空，无需汇报。');
    return;
  }

  const files = fs.readdirSync(TEMP)
    .filter(f => f.startsWith('candidate-') && f.endsWith('.md'))
    .sort();

  if (files.length === 0) {
    console.log('99-temp 中没有候选文件，无需汇报。');
    return;
  }

  console.log(`# 🗳 候选知识汇报 — ${new Date().toISOString().slice(0, 10)}`);
  console.log('');
  console.log(`99-temp 中有 **${files.length}** 个候选文件待处理：`);
  console.log('');

  const categoryLabels = {
    correction: '纠正',
    preference: '偏好',
    workflow: '工作流',
    decision: '决策'
  };

  for (const f of files) {
    const content = fs.readFileSync(path.join(TEMP, f), 'utf8');
    const meta = parseFrontmatter(content);
    const title = meta.title || f;
    const cat = meta.category || 'unknown';
    const conf = meta.confidence || '?';
    const date = f.match(/candidate-\w+-(\d{4}-\d{2}-\d{2})/)?.[1] || '?';
    const label = categoryLabels[cat] || cat;

    console.log(`## ${title}`);
    console.log(`- **分类**: ${label} | **置信度**: ${conf} | **日期**: ${date}`);
    console.log(`- **文件**: \`${f}\``);
    // Extract body (content after frontmatter)
    const bodyMatch = content.match(/---\n\n([\s\S]*)/);
    if (bodyMatch) {
      const body = bodyMatch[1].split('\n').slice(0, 5).join('\n').trim();
      if (body) console.log(`- **摘要**: ${body.slice(0, 200)}`);
    }
    console.log('');
  }

  console.log('---');
  console.log('请说"留"保留或"删"删除，也可以说"全留"或"全删"。');
}

main();
