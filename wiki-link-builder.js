// wiki-link-builder.js — 给孤立页加出站链接
// 用法：node wiki-link-builder.js
// 目标：消除 20 个孤立页

const fs = require('fs');
const path = require('path');

const ROOT = 'D:\\ai_schedule\\hermes-brain\\wiki';

// Mapping: 孤立页 -> 应该链接到哪些页面
const linkMap = {
  // 02-knowledge
  'aliyun':           ['[[paths]]', '[[ssh-config]]', '[[desktop]]'],
  'apk-build':        ['[[capacitor]]', '[[android]]', '[[projects]]'],
  'bb-browser':       ['[[mcp-plugins]]', '[[web-search]]', '[[self-media]]'],
  'image-gen':        ['[[kolors]]', '[[siliconflow]]', '[[vision-ocr]]'],
  'markitdown':       ['[[doc-conversion]]', '[[pdf]]', '[[ocr]]'],
  'mcp-plugins':      ['[[bb-browser]]', '[[plugins]]', '[[disk-cleanup]]'],
  'minimax-m3':       ['[[m3-coding]]', '[[reasonix]]', '[[budget]]'],
  'night-lock':       ['[[auto-tasks]]', '[[cron]]', '[[desktop]]'],
  'novel-rules':      ['[[projects]]', '[[twentythree-fire]]', '[[writing]]'],
  'paths':            ['[[paths-conventions]]', '[[desktop]]', '[[profile]]'],
  'paths-conventions':['[[paths]]', '[[hermes-home]]', '[[scripts-conventions]]'],
  'reasonix':        ['[[minimax-m3]]', '[[coding]]', '[[cli-tools]]'],
  'self-media':      ['[[hot-search]]', '[[comment-mining]]', '[[image-gen]]'],
  'semantic-memory':  ['[[embedding]]', '[[vec0]]', '[[obsolete]]'],
  'tools-overview':  ['[[npm-global]]', '[[hermes-venv]]', '[[paths]]'],
  'vision-ocr':      ['[[image-gen]]', '[[markitdown]]', '[[paddleocr]]'],
  // 03-system
  'backup':          ['[[backup-strategy]]', '[[paths]]', '[[cron]]'],
  'cron-jobs':       ['[[hermes-hooks]]', '[[auto-tasks]]', '[[backup]]'],
  'hermes-hooks':    ['[[cron-jobs]]', '[[plugins]]', '[[topic-gate]]'],
  'rsi-ledger':      ['[[failure-tracking]]', '[[auto-learning]]', '[[cron]]'],
  'schedule-protocol':['[[ai-schedule]]', '[[mavis]]', '[[hermes]]'],
  // 04-facts
  'general':         ['[[trust-system]]', '[[fact-aggregation]]'],
  'project':         ['[[projects]]', '[[twentythree-fire]]'],
  'tool':            ['[[paths]]', '[[mcp-plugins]]', '[[tools-overview]]'],
  'user_pref':       ['[[preferences]]', '[[communication]]'],
};

function processFile(slug, links) {
  const file = path.join(ROOT, '02-knowledge', slug + '.md');
  let target = file;
  if (!fs.existsSync(target)) {
    target = path.join(ROOT, '03-system', slug + '.md');
  }
  if (!fs.existsSync(target)) {
    target = path.join(ROOT, '04-facts', slug + '.md');
  }
  if (!fs.existsSync(target)) {
    console.log(`[MISS] ${slug}.md not found in any category`);
    return;
  }
  let content = fs.readFileSync(target, 'utf8');
  // Avoid duplicate links
  const linkSection = '\n\n## 相关链接（自动补充）\n\n' + links.map(l => `- ${l}`).join('\n') + '\n';
  if (!content.includes('## 相关链接（自动补充）')) {
    content += linkSection;
    fs.writeFileSync(target, content, 'utf8');
    console.log(`[OK] ${slug}.md +${links.length} links`);
  } else {
    console.log(`[SKIP] ${slug}.md already has auto links`);
  }
}

console.log('=== Adding outbound links to orphan pages ===');
for (const [slug, links] of Object.entries(linkMap)) {
  processFile(slug, links);
}
console.log('\nDone. Run lint.js to verify orphans reduced.');