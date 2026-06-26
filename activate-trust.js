// activate-trust.js — 给核心事实 trust +0.2
// 理由：user_pref 类是 YANG 直接偏好、project 是 YANG 项目、tool 是 YANG 验证过的路径
// 这些都已被多次确认有用，从默认 0.5 → 0.7

const fs = require('fs');
const path = require('path');

const ROOT = 'D:\\ai_schedule\\hermes-brain\\wiki\\04-facts';

// Trust boost 配置
const boosts = {
  'user_pref.md': 0.2,  // YANG 直接偏好，最高信任
  'project.md':   0.2,  // YANG 当前在做的项目
  'tool.md':      0.15, // 工具路径类，YANG 验证过的
  'general.md':   0.1,  // 通用事实，保守提升
};

for (const [file, delta] of Object.entries(boosts)) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    console.log(`[MISS] ${file}`);
    continue;
  }
  let content = fs.readFileSync(full, 'utf8');

  // Update frontmatter trust if present
  const oldFmTrust = content.match(/^trust:\s*([\d.]+)/m);
  if (oldFmTrust) {
    const newTrust = Math.min(1.0, parseFloat(oldFmTrust[1]) + delta);
    content = content.replace(/^trust:\s*[\d.]+/m, `trust: ${newTrust.toFixed(2)}`);
    console.log(`[FM] ${file}: frontmatter trust ${oldFmTrust[1]} → ${newTrust.toFixed(2)}`);
  }

  // Update inline fact trust entries (## HERMES-FACT-NNN (trust: 0.5))
  const factPattern = /(\(trust:\s*)([\d.]+)\)/g;
  let count = 0;
  content = content.replace(factPattern, (match, prefix, trustStr) => {
    const oldTrust = parseFloat(trustStr);
    const newTrust = Math.min(1.0, oldTrust + delta).toFixed(2);
    count++;
    return `${prefix}${newTrust})`;
  });

  fs.writeFileSync(full, content, 'utf8');
  console.log(`[OK] ${file}: ${count} facts boosted by +${delta}`);
}

console.log('\nDone. Trust system activated for core facts.');