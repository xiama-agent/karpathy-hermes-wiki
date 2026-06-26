---
id: HERMES-SCHED-001
title: 调度协议 v3.0
type: protocol
tags: [system, schedule, protocol]
use_cases: ["怎么派任务给Mavis", "调度协议", "任务模板", "mavis任务格式"]
source: fact_store#181, Mavis task_008
trust: 0.95
last_updated: 2026-06-26
---
# 调度协议 v3.0

## 状态机
```
pending → claimed → in_progress → done / failed / partial / rerouted
```

## 任务文件模板（full格式）
- 基本信息：id/to/type/priority/self_reroute/fallback_chain/timeout_min
- 依赖关系：depends_on / blocks / parallel_with
- 当前状态：已完成的事 + 已知问题
- 任务：按P0/P1/P2/P3分级
- 验证标准：可验证的checklist
- 注意事项：坑/环境变量/不要做的事

## 超时规则
- claimed 后 5 分钟没变 in_progress → 报警
- in_progress 后超时（默认30分钟）→ 标记 failed
- 心跳每 10 分钟丢失 → 报警

## 清理
- done/failed/rerouted 保留 7 天 → 归档
- 归档到 state/archive/YYYY-MM/
- 1 年后删除


## 相关链接（自动补充）

- [[ai-schedule]]
- [[mavis]]
- [[hermes]]
