// fix-dead-links.js — 批量清理死链
// 策略：
// 1. 删除所有 "## 相关链接（自动补充）" 段落（之前占位符链接）
// 2. 处理 hermes 列出的 6 个真死链：
//    - ssh-config → 删除（信息在 aliyun.md）
//    - plugins → 删除（信息在 mcp-plugins.md）
//    - writing → 删除（信息在 novel-rules.md）
//    - disk-cleanup → 建页（plugin 重要）
//    - twentythree-fire → 建页（方法论作者重要）
//    - auto-tasks → 建页（cron 类别）

const fs = require('fs');
const path = require('path');

const WIKI = 'D:\\ai_schedule\\hermes-brain\\wiki';

// === Step 1: 删除所有 "## 相关链接（自动补充）" 段落 ===
const allMd = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith('.md')) allMd.push(full);
  }
}
walk(WIKI);

let stripped = 0;
for (const f of allMd) {
  let c = fs.readFileSync(f, 'utf8');
  const before = c.length;
  c = c.replace(/\n## 相关链接（自动补充）\s*\n[\s\S]*?(?=\n## |\n---|\n*$)/g, '');
  if (c.length !== before) {
    fs.writeFileSync(f, c, 'utf8');
    stripped++;
  }
}
console.log(`[Step 1] Stripped auto-link sections from ${stripped} files`);

// === Step 2: 删除指定死链 ===
const linksToRemove = ['ssh-config', 'plugins', 'writing'];
let linksRemoved = 0;
for (const f of allMd) {
  let c = fs.readFileSync(f, 'utf8');
  const before = c.length;
  for (const target of linksToRemove) {
    // Match `- [[target]]` or `- [[target]] # 注释`
    const re = new RegExp(`- \\[\\[${target}\\]\\][^\\n]*\\n`, 'g');
    c = c.replace(re, '');
  }
  if (c.length !== before) {
    fs.writeFileSync(f, c, 'utf8');
    linksRemoved++;
  }
}
console.log(`[Step 2] Removed ${linksToRemove.length} dead link types from ${linksRemoved} files`);

// === Step 3: 建 3 个新页面 ===
const newPages = [
  {
    path: '03-system/disk-cleanup.md',
    title: 'disk-cleanup 插件',
    content: `---
id: HERMES-SYS-DC-001
title: disk-cleanup 插件
type: system
tags: [plugin, disk-cleanup, hermes]
trust: 1.0
use_cases: ["disk-cleanup 是什么", "磁盘清理", "plugin 配置"]
source: config.yaml plugins.enabled
last_updated: 2026-06-26
---

# disk-cleanup 插件

## 状态
- ✅ **已启用**：在 \`config.yaml\` 的 \`plugins.enabled\` 列表中
- 用途：自动清理临时文件，节省磁盘空间
- 触发：定期 cron + 手动触发

## 相关配置
\`\`\`yaml
plugins:
  enabled:
  - disk-cleanup
  - topic_gate
  - web/ddgs
\`\`\`

## 相关链接
- [[hermes-hooks]]
- [[cron-jobs]]
- [[mcp-plugins]]
`,
  },
  {
    path: '03-system/twentythree-fire.md',
    title: '二十三火小说方法论',
    type: 'knowledge',
    content: `---
id: HERMES-KNOW-23FIRE-001
title: 二十三火小说方法论
type: knowledge
tags: [novel, methodology, twentythree-fire]
trust: 0.95
use_cases: ["二十三火", "逆向设计法", "小说大纲方法论"]
source: novel-rules.md
last_updated: 2026-06-26
---

# 二十三火小说方法论

## 一句话
**逆向设计法** — 读者想看到什么 → 主角 → 第一卷高潮 → 反推开篇 → 动笔。

## 核心流程
1. 问"读者想看到什么"
2. 反推主角设定
3. 设定第一卷高潮
4. 反推开篇钩子
5. 写

## YANG 应用
- 当前正在写的小说《当神明死尽》使用此方法论
- 一问一答设计，不替 YANG 决定
- 配合"高潮反推 + 20 章单元"使用

## 相关链接
- [[novel-rules]]
- [[projects]]
`,
  },
  {
    path: '03-system/auto-tasks.md',
    title: 'auto-tasks 自动任务',
    type: 'system',
    content: `---
id: HERMES-SYS-AT-001
title: auto-tasks 自动任务
type: system
tags: [cron, auto-tasks, hermes]
trust: 0.95
use_cases: ["auto-tasks", "自动任务", "夜间锁屏", "后台脚本"]
source: paths.md, night-lock.md
last_updated: 2026-06-26
---

# auto-tasks 自动任务

## 位置
\`D:\\Tools\\auto_tasks\\\`

## 已知任务
| 任务 | 路径 | 说明 |
|------|------|------|
| night_lock | \`D:\\Tools\\auto_tasks\\night_lock.py\` | 夜间锁屏，22:30–12:00，密码 3941 |

## 相关链接
- [[night-lock]]
- [[cron-jobs]]
- [[hermes-hooks]]
`,
  },
];

for (const page of newPages) {
  const full = path.join(WIKI, page.path);
  fs.writeFileSync(full, page.content, 'utf8');
  console.log(`[Step 3] Created ${page.path} (${page.content.length} bytes)`);
}

console.log('\nDone. Run lint.js to verify.');