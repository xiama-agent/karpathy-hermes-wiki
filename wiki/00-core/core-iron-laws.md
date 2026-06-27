---
id: HERMES-CORE-001
title: 龙虾记忆系统铁律
type: rule
tags: [core, iron-laws, system-boundary]
trust: 1.0
use_cases: ["任何操作前检查", "系统边界判断", "一致性冲突解决"]
source: SOUL.md + IRON_RULES.md + AGENTS.md + 2026-06-27 盘点归纳
last_updated: 2026-06-27
---

# 龙虾记忆系统铁律

> 本页定义 **不可违背的操作铁律**。违反任何一条即系统行为异常。
> 宪法层规则在 SOUL.md，操作细节在 AGENTS.md，这里是底线。

---

## 铁律一：INDEX 驱动访问

**不经 INDEX 索引的知识不可信。**

- 每次对话必须先读 `index.md`（自动注入目录）
- 回答内容不得超出 INDEX 收录的 Wiki 页面范围
- 新建/修改 Wiki 页面后必须同步更新 INDEX
- INDEX 所收录的页面必须是"活跃知识"——session-log、99-temp、98-archive 不收录

## 铁律二：Topic-Gate 诚实声明

**每次回复必须声明引用了哪些 Wiki 页面。**

- 格式：````topic-detection {"wiki_ids": ["page.md", ...]}````
- `wiki_ids` 必须真实反映实际引用的页面
- 没查 Wiki 就诚实写 `{"wiki_ids": [], "note": "未命中Wiki"}`
- 编假 ID = 系统违规，YANG 有权当场纠正

## 铁律三：路径必验证

**任何文件路径必须先验证再使用。**

- 路径相关问题必须先读 `02-knowledge/paths.md` + `paths-conventions.md`
- 不得凭印象给出路径——必须基于 Wiki 内容
- 使用路径前必须 `ls/stat` 确认存在
- 不存在的路径必须搜索全盘找真实路径并更新 Wiki

## 铁律四：写后必索引

**向 Wiki 写入任何内容后必须更新 INDEX。**

- 新建页面 → INDEX 追加链接
- 升级候选（99-temp→正式） → INDEX 追加 + 候选链接移除
- 归档页面（→98-archive） → INDEX 移出链接
- 删除页面 → INDEX 移出链接并记 log

## 铁律五：信任分即权威

**frontmatter 的 `trust` 字段决定回答可信度。**

- trust ≥ 0.9：可直接作为答案引用
- trust 0.7–0.89：需标注"依据当前知识"
- trust 0.5–0.69：需标注"待验证"
- trust < 0.5：仅作为线索，不能直接回答
- 召回成功自动 `trust += 0.1`，违规或出错 `trust -= 0.2`

## 铁律六：失败必记 RSI

**工具调用失败必须追溯根因并记录。**

- 失败后立即调用 `rsi-log.js` 记录：错误信息、根因、修复方案
- 同一 Pattern-Key 出现 3 次/30 天内 → 晋升为永久规则写入 Wiki
- RSI 记录存在 `03-system/rsi-ledger.md`

## 铁律七：会话结束必写摘要

**每次对话结束前必须写 session summary。**

- 写入 `wiki/01-yang/session-log/session-{date}-{time}.md`
- 内容：做了什么、改了哪些 Wiki 页、发现了什么问题
- 这是召回失败时的兜底信息源

## 铁律八：修改前先 Git Commit

**任何对 Wiki 的修改必须先提交当前状态。**

- 修改前：`git commit -m "auto backup before {operation}"`
- 修改后：`git commit -m "{operation}: {description}"`
- 确保每步都可回滚

---

## 违背铁律的后果

| 铁律 | 首次违背 | 再次违背 |
|:----|:--------|:--------|
| 铁律一 | 重读 INDEX | 触发全量 lint 扫描 |
| 铁律二 | 立即纠正 + 补 topic-detection | YANG 发现后信任分全局降级 |
| 铁律三 | 路径错误导致用时翻倍 | 扣除本 wiki 页 trust 0.2 |
| 铁律四 | INDEX 遗漏 → 下次召回失败 | 自动扫描修复 + 记 RSI |
| 铁律五 | 引用低 trust 页面不声明 | 信任分系统自动惩罚 |
| 铁律六 | 不记 RSI → 同问题无法追溯 | 问题复现时没有修复记录 |
| 铁律七 | 不写摘要 → 下次对话缺失上下文 | 无法追溯会话历史 |
| 铁律八 | 不可回滚 → 改错了修不回来 | 无法恢复旧版本 |

---

## 相关链接

- [[identity]] — 身份宪法
- [[preferences]] — YANG 核心偏好
- [[triggers]] — 自动触发规则
- `D:\ai_schedule\hermes-brain\IRON_RULES.md` — 运行时 7 条铁律（本页的精简版）
- `D:\ai_schedule\hermes-brain\RUNTIME.md` — 运行时 11 条指令
