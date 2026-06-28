---
id: HERMES-ROUTE-001
title: 智能体路由与Claude区分
type: reference
tags: [routing, dispatch, claude, claude-code, mavis, reasonix]
use_cases: ["分清Claude Code和中转站Claude", "路由决策"]
source: 2026-06-28 YANG确立
trust: 0.95
last_updated: 2026-06-28
---

# 智能体路由与Claude区分

## 两个"Claude"的彻底区分

| 名称 | 本质 | 模型后端 | 成本 | 用途 |
|------|------|---------|------|------|
| **Claude Code** | CLI 编码工具（npm 包 `@anthropic-ai/claude-code`） | MiniMax M3（通过 Anthropic API 兼容层） | ¥0（含在 M3 年付 ¥49/月） | 长链编码、多文件重构、自主调试循环 |
| **中转站 Claude** | 通过中转站调用的 Anthropic 原生 Claude 模型 API | 真正的 Anthropic Claude（Opus/Sonnet） | 按量计费，贵 | 最难的问题才用，三 Agent 都失败后的兜底 |

**永远不要混淆这两个。** Claude Code 是日常编码工具，中转站 Claude 是最后手段。

## 路由总表

| 难度 | 派给谁 | 模型 | 成本 |
|:-----|:-------|:-----|:-----|
| 🟢 常规（文件调度） | Mavis | MiniMax M3 原生 API | ¥0 |
| 🟢 常规（CLI编码） | Claude Code | MiniMax M3 Anthropic API | ¥0 |
| 🟡 中等 | Reasonix | DeepSeek V4 Pro | ¥3-6/百万token |
| 🔴 硬骨头 | 中转站 Claude 或 GPT-5.4 | 真 Claude / GPT-5.4 | $30/天上限 |

## 升级路径

- **普通开发**: Mavis → Claude Code → Reasonix → 中转站Claude/GPT
- **Bug修复**: Mavis → Reasonix(诊断) → Claude Code(测试) → 中转站Claude/GPT
- **长链开发**: Mavis → Claude Code → Reasonix(推理瓶颈) → 中转站Claude/GPT

## 派单写作分工

- **简单任务**: 龙虾直接写（复制原文，不概括）
- **复杂任务**: 龙虾写框架 → Reasonix(V4 Pro)精确拆解 → 龙虾派发

## 相关链接
- [[02-knowledge/ai-schedule]] — AI调度系统
- skill: `ai-scheduling` — 完整调度协议
- `ai-scheduling/references/hermes-agent-routing.md` — 路由规则原文
- `ai-scheduling/references/claude-code-setup.md` — Claude Code 安装记录
