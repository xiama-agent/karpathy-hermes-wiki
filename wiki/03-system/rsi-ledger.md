---
id: HERMES-RSI-001
title: RSI 账本 (Root-cause Self-Improvement)
type: fact-collection
tags: [system, rsi, learning]
use_cases: ["查询历史 RSI", "错误追踪", "自我改进记录", "方案 B 是否曾生效"]
trust: 0.95
last_updated: 2026-06-26
---

# RSI 账本

> 记录工具调用失败和用户纠正，用于自我改进。
> **v3.1.4 迁移（2026-06-26）**：原方案 B（fact_store tag=rsi_ledger）已确认 **从未生效**——legacy 库中 0 条记录，迁移到 Wiki 数据页。

---

## 📋 方案 B 调查结论（2026-06-26 v3.1.4 修复时执行）

**调查方式**：Node `node:sqlite` 直接读 `memory_store.db.legacy`（1.2 MB，6/25 备份）：

```sql
SELECT COUNT(*) FROM facts WHERE tags LIKE '%rsi_ledger%'
-- 结果: 0
```

**结论**：
- ✅ fact_store 有 120 条 facts（identity/core/windows/config/server 等），数据写入正常
- ❌ 但 `rsi_ledger` tag 写入路径**从未生效**——0 条记录
- ⚠️ 推测原因：SOUL.md 规则 36 写"RSI 自动追踪+晋升"，但实际写入 fact_store 的代码路径未实现（规则在前，代码未跟上）
- 🎯 **方案 A（迁 Wiki）正式生效**：本页面即为此目的

**YANG 决策**：采纳方案 A，方案 B 标记为"未生效废弃"。

---

## 📊 历史 RSI 条目（v3.1.4 重构期间手动迁移）

> 以下为 2026-06-24 ~ 06-26 记忆系统重构期间已发生的 RSI 模式汇总，从对话日志/任务报告回填。

### 2026-06-26 {path-mismatch-hermes-home}

- **error**: `~/.hermes/` 路径错误，实际应在 `C:\Users\YANG\AppData\Local\hermes\`
- **root-cause**: SOUL.md/v3.1.0 写"~/.hermes/"是 Unix 习惯残留，Windows 系统实际无此路径。task_010 派单时未做路径验证
- **fix**: task_022 路径统一——所有文档改为 `AppData\Local\hermes\`；SOUL.md 安装前路径验证清单加入 `lobang-agent-complete`
- **status**: resolved | **recurrence**: 一次性（路径统一后无再发）

### 2026-06-26 {topic-gate-cache-deadlock}

- **error**: topic-gate plugin hook 在缓存命中时报错 "cache id deadlock"
- **root-cause**: 缓存 ID 生成逻辑与会话 ID 耦合，跨会话命中时死锁
- **fix**: task_019 修复——缓存 key 改为基于 topic 而非 session；task_020 进一步加 plugin 自豁免
- **status**: resolved | **recurrence**: 已彻底根除

### 2026-06-26 {session-id-mismatch}

- **error**: topic-gate session_id 在 plugin 与 Hermes 核心间不一致
- **root-cause**: plugin 用自己的 session id，核心用 `current_session`，两者未对齐
- **fix**: task_021 修复——统一从 Hermes 核心获取 session_id，去除 plugin 自维护
- **status**: resolved | **recurrence**: 无

### 2026-06-25 {index-detail-hallucination}

- **error**: INDEX 注入 800 字 → 龙虾注意力稀释 → 编造不存在的页面名（如"算法工具/"）
- **root-cause**: 固定 800 字限制 + LLM 注意力衰减；DKN/DeepSeek 在低注意力下倾向幻觉
- **fix**: INDEX 视觉警告框（"必须逐字复述禁止编造"）+ 字数提至 1600（B4 修复中）+ topic-detection 块强制（SOUL.md 规则 14-16）
- **status**: resolved | **recurrence**: 无（加视觉框后测试通过）

### 2026-06-24 {memory-pipeline-meltdown}

- **error**: 旧 4 层记忆系统（memory/skills/Harness/fact_store）写入冲突、检索互相覆盖
- **root-cause**: 4 个写入路径无锁，并发时丢更新；fact_store 与 second-brain read 路径并存导致事实分歧
- **fix**: v3.0 重组——memory→Wiki INDEX, fact_store→04-facts, second-brain→Wiki 主体；三轨合一
- **status**: resolved | **recurrence**: 无（熔断完成，3 个 .legacy 保留作历史兜底）

---

### 2026-06-26 {recall-missed-2026-06-26}

- **error**: Wiki 召回失败,query 无对应页面（样例: `xyznonexistent_query_for_test_987654`）
- **root-cause**: Wiki 知识缺口 — 现有页面无法覆盖用户查询
- **fix**: review `wiki/99-temp/missed-recall-2026-06-26.md` 看当天所有 query,如反复出现同样 query 集群 → 新建对应 wiki 页面
- **status**: monitoring
- **recurrence**: 见 missed-recall 文件计数


### 2026-06-26 {tool-failure-2026-06-26-193759}

- **error**: 测试错误信息
- **root-cause**: 测试根因分析
- **fix**: 测试修复方案
- **status**: monitoring
- **source**: rsi-log.js 自动记录


## 🔧 自动处理规则（v3.1.4 修正版）

**原 SOUL.md 规则 36 "RSI 自动追踪+晋升"** —— 已确认代码路径未实现，规则保留但**实际追踪**改为：

- **手动**：每次修复 BUG 后，开发者（Mavis/龙虾）在本页追加一条 `## YYYY-MM-DD {pattern-key}`
- **自动触发**：lint.js 扫 Wiki 时，如发现同一 `{pattern-key}` 出现 3 次/30 天 → 在 `99-temp/rsi-promotion-{date}.md` 写晋升建议
- **永久化**：人工 review 后，写入 SOUL.md 宪法规则（已生效）或 frontmatter trust 调整（已生效）

---

## 📐 字段约定

每条 RSI 条目统一格式：

```markdown
### YYYY-MM-DD {pattern-key}

- **error**: 错误描述（症状）
- **root-cause**: 根因（不是表面症状，是机制层）
- **fix**: 修复方式（命令/代码/决策）
- **status**: resolved | monitoring | wontfix
- **recurrence**: 一次性 | 频率 X/周 | 无（已根除）
```

可选字段（视情况加）：`prevention-rule`、`related-tasks`、`commit-hash`。

## 相关链接
- [[00-core/triggers]] — 上级/相关页面
