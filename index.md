# Wiki Index — 每轮注入版（≤800 字）

> 这是注入到每轮 prompt 的精简索引。完整版见各分类子 INDEX。
> 维护规则：见 AGENTS.md 第 2.4 节。每次写入后必须更新本文件。
> 最后更新：2026-06-26

---

## 召回指南

YANG 提问时，先判断类别，再读对应分类子 INDEX，最后 grep 找具体页面。不要全局 top-k。

| 类别 | 子目录 | 何时召回 |
|------|--------|---------|
| **00-core** | `wiki/00-core/` | 涉及身份/偏好/触发规则 |
| **01-yang** | `wiki/01-yang/` | 涉及 YANG 档案/路径/预算/项目 |
| **02-knowledge** | `wiki/02-knowledge/` | 涉及具体工具/MCP/技能 |
| **03-system** | `wiki/03-system/` | 涉及系统配置/cron/hook |
| **04-facts** | `wiki/04-facts/` | 涉及单条事实查询 |
| **99-temp** | `wiki/99-temp/` | 临时隔离区，INDEX 不指向 |

---

## 分类索引（每类一行）

### 00-core 身份/核心
- [[identity]] — 我是谁（核心身份定义）
- [[preferences]] — YANG 核心偏好（≤20 条硬规则）
- [[triggers]] — 自动触发规则（什么时候自动干什么）

### 01-yang YANG 档案
- [[profile]] — 姓名/角色/AI 工具栈
- [[budget]] — 预算 + token 敏感度
- [[communication]] — 沟通偏好（直来直去/讨厌客套）
- [[projects]] — 当前在做的项目
- [[desktop]] — D 盘工作盘 + 目录约定

### 02-knowledge 工具/技能
- [[ai-schedule]] / [[aliyun]] / [[apk-build]] / [[bb-browser]]
- [[image-gen]] / [[markitdown]] / [[mcp-plugins]] / [[minimax-m3]]
- [[night-lock]] / [[novel-rules]] / [[paths]] / [[paths-conventions]]
- [[reasonix]] / [[self-media]] / [[semantic-memory]]
- [[tools-overview]] / [[vision-ocr]]

### 03-system 系统配置
- [[backup]] / [[cron-jobs]] / [[hermes-hooks]] / [[rsi-ledger]] / [[schedule-protocol]]

### 04-facts 实体事实
- 路径类：`wiki/04-facts/tool.md`（路径/API/工具位置）
- 偏好类：`wiki/04-facts/user-pref.md`（YANG 偏好事实）
- 项目类：`wiki/04-facts/project.md`（龙空/小说/AI变现）
- 参考类：`wiki/04-facts/knowledge.md`（技术坑/参考信息）

---

## 紧急回退

如果连续 3 次召回都失败 → 自动读 SOUL.md 中"硬编码核心偏好 7 条"兜底，并把失败关键词记入 `wiki/99-temp/missed-recall-{date}.md`。