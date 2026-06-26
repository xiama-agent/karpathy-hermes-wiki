# Wiki Index — 每轮注入版

> ≤1600 bytes / ≤800 字。每轮 prompt 注入。详细规则：AGENTS.md 第 1.1 节。
> 最后更新：2026-06-26

## 召回指南

按类别召回，不要全局 top-k。问什么先判类别，再 grep。

| 类别 | 子目录 | 召回时机 |
|------|--------|---------|
| 00-core | `wiki/00-core/` | 身份/偏好/触发 |
| 01-yang | `wiki/01-yang/` | YANG 档案/项目/路径 |
| 02-knowledge | `wiki/02-knowledge/` | 工具/MCP/技能 |
| 03-system | `wiki/03-system/` | 配置/cron/hook |
| 04-facts | `wiki/04-facts/` | 单条事实查询 |

## 分类速查

### 00-core
- [[identity]] 核心身份
- [[preferences]] YANG 核心偏好
- [[triggers]] 自动触发规则

### 01-yang
- [[profile]] [[budget]] [[communication]] [[projects]] [[desktop]]

### 02-knowledge
- [[ai-schedule]] [[aliyun]] [[apk-build]] [[bb-browser]]
- [[image-gen]] [[markitdown]] [[mcp-plugins]] [[minimax-m3]]
- [[night-lock]] [[novel-rules]] [[paths]] [[paths-conventions]]
- [[reasonix]] [[self-media]] [[semantic-memory]] [[tools-overview]] [[vision-ocr]]

### 03-system
- [[backup]] [[cron-jobs]] [[hermes-hooks]] [[rsi-ledger]] [[schedule-protocol]]

### 04-facts（按 category 聚合）
- `wiki/04-facts/user_pref.md` (7 条)
- `wiki/04-facts/tool.md` (26 条)
- `wiki/04-facts/project.md` (6 条)
- `wiki/04-facts/general.md` (64 条)

## 紧急回退

连续 3 次召回失败 → 读 SOUL.md"硬编码核心偏好 7 条"兜底 + 记 `wiki/99-temp/missed-recall-{date}.md`。