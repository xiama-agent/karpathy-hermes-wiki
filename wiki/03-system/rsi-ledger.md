---
id: HERMES-RSI-001
title: RSI 账本
type: config
tags: [system, rsi, learning]
use_cases: ["RSI账本在哪", "错误追踪", "自我改进记录"]
trust: 0.95
last_updated: 2026-06-26
---
# RSI 账本

RSI（Root-cause Self-Improvement）账本记录工具调用失败和用户纠正，用于自我改进。

**存储位置**：fact_store tag=rsi_ledger
**不迁移到 Wiki**：RSI 账本是机器数据，不需要人读，保留在 fact_store 后台。

## 数据格式 (task_015 P2 ④ 补充)

```sql
SELECT fact_id, content, tags, retrieval_count
FROM facts
WHERE tags LIKE '%rsi_ledger%'
ORDER BY fact_id DESC
LIMIT 20
```

## 典型条目示例

- `tags=rsi_ledger,path-bug,user-correction`
- `tags=rsi_ledger,tool-fail,timeout`
- `tags=rsi_ledger,hermes-hook,session-id-mismatch`

## 自动处理规则 (引自 SOUL.md)

- 同一 Pattern-Key 出现 3 次/30天 → 自动晋升到 fact_store `tags=memory` 备用规则
- 跨会话/跨任务时 SOUL.md+记忆+skills+fact_store 四件同步更新, 避免漏归档

## 恢复方法

- 历史 RSI 数据靠 git 跟踪 (fact_store 是 SQLite, 但每条 fact 写入即 commit)
- 删除单条用 `DELETE FROM facts WHERE fact_id=?` (不推荐, 失去学习样本)


## 相关链接（自动补充）

- [[failure-tracking]]
- [[auto-learning]]
- [[cron]]
