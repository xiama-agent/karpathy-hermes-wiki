#!/usr/bin/env node
/*
 * add-crossrefs.js — 给孤立页加跨引用（一次性脚本）
 *
 * 链接检测规则（lint.js lintOrphanPages）：
 *   页面只要以 [[basename]] 或 [[相对路径]] 形式出现在任一 wiki 文件 / index.md 即"有入链"。
 *   INDEX 里的 [[wiki/.../page.md]] 格式不算入链——这正是它们孤立的原因。
 *
 * 本脚本用 [[相对路径]] 形式（如 [[02-knowledge/npm-global]]），无歧义且 lint 能识别。
 * 对每个孤立页：
 *   1. 在其 hub 页面追加/补充 ## 相关链接 段落（= 入链）
 *   2. 在孤立页自身追加 ## 相关链接 段落（= 回链）
 * 跳过：日期戳报告/日志、98-archive 存根（不强行关联）。
 */
const fs = require('fs');
const path = require('path');

const ROOT = 'D:\\ai_schedule\\hermes-brain';
const WIKI = path.join(ROOT, 'wiki');

function f(rel) { return path.join(WIKI, rel.replace(/\//g, path.sep) + '.md'); }
function link(rel) { return `[[${rel}]]`; }

// 孤立页 → hub（已确认 hub 本身非孤立、内容确实相关）
const MAP = {
  // 工具总览 hub —— 工具/AI集成
  '02-knowledge/npm-global':                 { hub: '02-knowledge/tools-overview', desc: 'npm 全局工具清单（codegraph/mimo/agent-browser 等）' },
  '02-knowledge/tools-ai-integration-guide': { hub: '02-knowledge/tools-overview', desc: '工具与 AI 模型集成指南' },
  '02-knowledge/hermes-tool-independence':   { hub: '02-knowledge/tools-overview', desc: 'Hermes 工具独立性架构' },
  '02-knowledge/codex-cli-knowledge-base':   { hub: '02-knowledge/tools-overview', desc: 'Codex CLI 知识库与使用指南' },
  '02-knowledge/markitdown':                 { hub: '02-knowledge/tools-overview', desc: 'MarkItDown 文档转换（venv）' },
  '02-knowledge/vision-ocr':                 { hub: '02-knowledge/tools-overview', desc: '视觉与 OCR 能力' },
  '02-knowledge/persistent-memory-tool-selection': { hub: '02-knowledge/tools-overview', desc: '持久化记忆与工具选择指南' },
  '02-knowledge/minimax-m3':                 { hub: '02-knowledge/tools-overview', desc: 'MiniMax M3 集成（外部 AI 服务）' },
  '02-knowledge/model-capabilities-comparison': { hub: '02-knowledge/tools-overview', desc: 'AI 模型能力对比与使用场景' },
  '02-knowledge/zhipu-code-repair-analysis': { hub: '02-knowledge/tools-overview', desc: '智谱 AI 代码修复能力评估' },
  '02-knowledge/system-integration-evaluation': { hub: '02-knowledge/tools-overview', desc: '系统集成评估标准' },

  // 路径/配置 hub —— paths.md
  '02-knowledge/path-validation-iron-rule':  { hub: '02-knowledge/paths', desc: '路径验证铁律（使用前必验）' },
  '02-knowledge/zhipu-api-key-configuration':{ hub: '02-knowledge/paths', desc: '智谱 AI API Key / provider 配置' },
  '02-knowledge/model-json-structure':       { hub: '02-knowledge/paths', desc: 'model.json 配置结构说明' },
  '02-knowledge/aliyun':                     { hub: '02-knowledge/paths', desc: '阿里云服务器 / SSH 路径' },
  '02-knowledge/semantic-memory':            { hub: '02-knowledge/paths', desc: '语义记忆系统（含 DB/脚本路径）' },

  // MCP/插件 hub —— mcp-plugins.md
  '03-system/disk-cleanup':                  { hub: '02-knowledge/mcp-plugins', desc: 'disk-cleanup 插件' },

  // 定时任务 hub —— cron-jobs.md
  '03-system/auto-tasks':                    { hub: '03-system/cron-jobs', desc: 'auto-tasks 自动任务' },
  '03-system/backup':                        { hub: '03-system/cron-jobs', desc: '备份体系（每日自动备份 cron）' },
  '02-knowledge/lint-to-wiki-automation':    { hub: '03-system/cron-jobs', desc: 'Lint 到 Wiki 自动化流程' },

  // 核心规则 hub —— triggers.md
  '00-core/core-iron-laws':                  { hub: '00-core/triggers', desc: '底层铁律与系统边界' },
  '03-system/rsi-ledger':                    { hub: '00-core/triggers', desc: 'RSI 账本（工具失败自我改进）' },
  '03-system/agents-optimization':           { hub: '00-core/triggers', desc: 'AGENTS.md 优化策略' },
  '02-knowledge/framework-design-iron-rules-guide': { hub: '00-core/triggers', desc: '框架设计与铁律创建指南' },
  '02-knowledge/boundary-analysis-checklist':{ hub: '00-core/triggers', desc: '边界分析检查清单' },
  '02-knowledge/topic-gate-block-format':    { hub: '00-core/triggers', desc: 'Topic-Gate Block 格式要求' },
  '02-knowledge/workflow-router-knowledge':  { hub: '00-core/triggers', desc: '工作流路由系统设计' },

  // YANG 偏好 hub —— preferences.md
  '03-system/private-info-policy':           { hub: '01-yang/preferences', desc: '隐私信息处理策略' },

  // 身份/分身 hub —— profile.md
  '02-knowledge/self-media':                 { hub: '01-yang/profile', desc: '自媒体工作流（媒体龙虾分工）' },

  // 事实 hub —— general.md
  '04-facts/compliance-gap-analysis':        { hub: '04-facts/general', desc: '合规性差距分析' },
  '04-facts/fact-error-handling':            { hub: '04-facts/general', desc: '事实错误处理流程' },
  '04-facts/system-performance-gap':         { hub: '04-facts/general', desc: '系统性能差距分析' },
};

const SECTION = '## 相关链接';

function ensureSectionGet(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('\n' + SECTION) && !content.startsWith(SECTION)) {
    if (!content.endsWith('\n')) content += '\n';
    content += '\n' + SECTION + '\n';
    fs.writeFileSync(filePath, content, 'utf8');
  }
  return fs.readFileSync(filePath, 'utf8');
}

function addLinkLine(filePath, line) {
  let content = ensureSectionGet(filePath);
  if (content.includes(line)) return false; // 幂等
  // 在 SECTION 段落末尾追加（下一个 ## 或文件尾）
  const secIdx = content.indexOf(SECTION);
  const afterSec = content.slice(secIdx);
  const nextHeading = afterSec.slice(SECTION.length).search(/\n## /);
  let insertAt;
  if (nextHeading === -1) {
    insertAt = content.length;
  } else {
    insertAt = secIdx + SECTION.length + nextHeading;
  }
  let prefix = content.slice(0, insertAt);
  let suffix = content.slice(insertAt);
  if (!prefix.endsWith('\n')) prefix += '\n';
  content = prefix + line + '\n' + suffix.replace(/^\n+/, '\n');
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

const stats = { hubWrites: 0, backWrites: 0, skippedMissing: [] };
for (const [orphan, { hub, desc }] of Object.entries(MAP)) {
  const orphanPath = f(orphan);
  const hubPath = f(hub);
  if (!fs.existsSync(orphanPath)) { stats.skippedMissing.push(orphan); continue; }
  if (!fs.existsSync(hubPath)) { stats.skippedMissing.push('HUB:' + hub); continue; }

  // 入链：hub → orphan
  if (addLinkLine(hubPath, `- ${link(orphan)} — ${desc}`)) stats.hubWrites++;
  // 回链：orphan → hub
  if (addLinkLine(orphanPath, `- ${link(hub)} — 上级/相关页面`)) stats.backWrites++;
}

console.log('Done.');
console.log('  hub inbound-link writes :', stats.hubWrites);
console.log('  orphan back-link writes :', stats.backWrites);
console.log('  skipped (missing)       :', stats.skippedMissing.length, stats.skippedMissing);
console.log('  pairs processed         :', Object.keys(MAP).length);
