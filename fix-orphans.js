// fix-orphans.js — 给剩下 9 个孤立页加正确链接
const fs = require('fs');
const path = require('path');

const ROOT = 'D:\\ai_schedule\\hermes-brain\\wiki';

// 给 04-facts 文件互链（替换之前无效的链接）
const factLinks = {
  'general.md':   '- [[user_pref]]\n- [[tool]]\n- [[project]]',
  'user_pref.md': '- [[general]]\n- [[tool]]\n- [[preferences]]',
  'tool.md':      '- [[general]]\n- [[user_pref]]\n- [[paths]]',
  'project.md':   '- [[general]]\n- [[projects]]',
};

// 给其他孤立页的"修复版"链接
const orphanFixes = {
  'aliyun': {
    path: '02-knowledge/aliyun.md',
    appendTo: '02-knowledge/paths.md',
    newLink: '- [[aliyun]]  # 阿里云服务器',
  },
  'night-lock': {
    path: '02-knowledge/night-lock.md',
    appendTo: '02-knowledge/paths.md',
    newLink: '- [[night-lock]]  # 夜间锁屏',
  },
  'semantic-memory': {
    path: '02-knowledge/semantic-memory.md',
    appendTo: '02-knowledge/tools-overview.md',
    newLink: '- [[semantic-memory]]  # 语义记忆（已 obsolete）',
  },
  'rsi-ledger': {
    path: '03-system/rsi-ledger.md',
    appendTo: '03-system/cron-jobs.md',
    newLink: '- [[rsi-ledger]]  # RSI 失败追踪',
  },
  'schedule-protocol': {
    path: '03-system/schedule-protocol.md',
    appendTo: '02-knowledge/ai-schedule.md',
    newLink: '- [[schedule-protocol]]  # 调度协议',
  },
};

// Fix 04-facts inter-linking
for (const [file, links] of Object.entries(factLinks)) {
  const full = path.join(ROOT, '04-facts', file);
  let content = fs.readFileSync(full, 'utf8');
  // Replace the auto-links section
  content = content.replace(
    /## 相关链接（自动补充）\s*\n[\s\S]*$/,
    `## 相关链接\n\n${links}\n`
  );
  fs.writeFileSync(full, content, 'utf8');
  console.log(`[OK] 04-facts/${file} relinked`);
}

// Add inbound links to other orphans
for (const [slug, fix] of Object.entries(orphanFixes)) {
  const targetPath = path.join(ROOT, fix.appendTo);
  if (!fs.existsSync(targetPath)) {
    console.log(`[MISS] ${fix.appendTo} not found`);
    continue;
  }
  let content = fs.readFileSync(targetPath, 'utf8');
  if (content.includes(`[[${slug}]]`)) {
    console.log(`[SKIP] ${fix.appendTo} already has [[${slug}]]`);
    continue;
  }
  // Append to bottom
  const section = `\n\n## 相关链接\n\n${fix.newLink}\n`;
  if (!content.includes('## 相关链接')) {
    content += section;
  } else {
    content += `\n${fix.newLink}\n`;
  }
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`[OK] ${fix.appendTo} now links to [[${slug}]]`);
}

console.log('\nDone. Run lint.js to verify.');