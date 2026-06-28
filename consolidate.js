'use strict';
// consolidate.js — 知识巩固通道 (v1.0)
// 用法: node consolidate.js <category> <title> [content]
//   例: node consolidate.js correction "路径自由裁量权纠正" "Topic-Gate 不能搜到就停，必须查指定路径"
//       node consolidate.js --list
//
// 分类: correction | preference | workflow | decision
// 输出: wiki/99-temp/candidate-{category}-{date}.md

const fs = require('fs');
const path = require('path');

const BRAIN_ROOT = 'D:\\ai_schedule\\hermes-brain';
const TEMP = path.join(BRAIN_ROOT, 'wiki', '99-temp');

const VALID_CATEGORIES = ['correction', 'preference', 'workflow', 'decision'];

function getDateString() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('用法: node consolidate.js <category> <title> [content]');
    console.log('  例: node consolidate.js correction "路径自由裁量权纠正" "Topic-Gate...');
    console.log('  例: node consolidate.js --list');
    console.log('分类: correction | preference | workflow | decision');
    process.exit(args.length === 0 ? 1 : 0);
  }
  if (args[0] === '--list') {
    return { list: true };
  }
  const category = args[0];
  if (!VALID_CATEGORIES.includes(category)) {
    console.error(`无效分类: ${category}，有效值: ${VALID_CATEGORIES.join(', ')}`);
    process.exit(1);
  }
  const title = args[1] || '未命名';
  const content = args.slice(2).join(' ') || '（待补充）';
  return { category, title, content };
}

function listCandidates() {
  if (!fs.existsSync(TEMP)) {
    console.log('99-temp 目录为空');
    return;
  }
  const files = fs.readdirSync(TEMP).filter(f => f.startsWith('candidate-') && f.endsWith('.md'));
  if (files.length === 0) {
    console.log('99-temp 中没有候选文件');
    return;
  }
  console.log(`共 ${files.length} 个候选文件：`);
  for (const f of files) {
    const full = path.join(TEMP, f);
    const stat = fs.statSync(full);
    const firstLine = fs.readFileSync(full, 'utf8').split('\n')[0];
    console.log(`  ${f} (${Math.round(stat.size)} bytes)`);
  }
}

function writeCandidate(category, title, content) {
  if (!fs.existsSync(TEMP)) {
    fs.mkdirSync(TEMP, { recursive: true });
  }

  const date = getDateString();
  const filename = `candidate-${category}-${date}.md`;
  const filepath = path.join(TEMP, filename);

  const confidenceMap = {
    correction: 'high',
    preference: 'high',
    workflow: 'medium',
    decision: 'medium'
  };

  const categoryLabels = {
    correction: 'YANG 纠正',
    preference: 'YANG 偏好',
    workflow: '工作流发现',
    decision: '项目决策理由'
  };

  const body = `---
type: candidate_knowledge
status: pending
source: conversation_consolidation
category: ${category}
category_label: ${categoryLabels[category]}
confidence: ${confidenceMap[category]}
extracted_at: ${date}
title: ${title}
---

# Knowledge candidate: ${title}

**分类**: ${categoryLabels[category]}
**时间**: ${date}

${content}

---
*自动巩固自对话，待 lint 评估升级或归档。*
`;

  fs.writeFileSync(filepath, body, 'utf8');
  console.log(`✅ 候选已写入: ${filepath}`);
  console.log(`   分类: ${categoryLabels[category]}`);
  console.log(`   标题: ${title}`);
  return filepath;
}

// Main
const opts = parseArgs();
if (opts.list) {
  listCandidates();
} else {
  writeCandidate(opts.category, opts.title, opts.content);
}
