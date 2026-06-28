---
title: 已知缺陷 — v4.0 Karpathy 记忆系统
type: reference
tags: [缺陷, self-awareness, architecture, limits]
trust: 0.95
last_updated: 2026-06-28
---

# 记忆系统已知缺陷

> 系统的自我认知应当写入系统本身。
> 每次新会话查这篇，就不用凭训练数据瞎答"哪里不完美"了。

---

## 🔴 架构级（不可修复）

| 缺陷 | 描述 |
|------|------|
| **依赖自觉** | Topic-Gate 规则写在 SOUL.md，但没有系统级强制。新会话第一轮可能忘查 Wiki |
| **计时器 Bug** | `pre_tool_call` 在 `transform_llm_output` 之前触发，topic-detection 格式错误不可恢复 |
| **训练数据污染不可区分** | 我无法准确区分回答中哪部分来自 Wiki、哪部分来自训练参数 |
| **上下文窗口挤压** | INDEX + 加载页 + 对话上下文争抢 token 配给 |
| **跨会话断层** | Wiki 存知识不存上下文，`session_search` 是 FTS5 非语义，相隔 3 个月的同一问题可能发现不了关联 |

## 🟡 可改善但未根治

| 缺陷 | 对应工具 | 现状 |
|------|---------|------|
| **来源标注自报** | `source` 字段 + `topic-validation.js` | 我自填，无后续校验 |
| **记忆无温度** | `age-track.js` | 只报告不出力，不改变检索权重 |
| **99-temp 候选腐烂** | `consolidate.js` + `candidate-report.js` + cron | 管道完整但缺第一次闭环经验 |
| **Cron 断裂脆弱** | 多 cron 已设 | TUI 下 `execute_code` 禁止 + 无回传通道 |

## 🟢 做得好的（但不完美）

- 三层架构方向对（SOUL.md → AGENTS.md → Wiki）
- Topic-Gate 输出报告 + recall-log 追踪
- Consolidation 管道（发现→候选→晋升）
- "说出来"行为协议（查 Wiki 变习惯）
- Git 版本控制 + lint 健康检查

---

## 评分

| 维度 | 分 | 说明 |
|------|----|------|
| 设计理念 | 85 | Karpathy 模式 + 三层，方向正 |
| 实际执行 | 40 | 依赖我记规则，新会话常忘 |
| 系统强制力 | 20 | 无架构级保障 |

*最后更新: 2026-06-28*
