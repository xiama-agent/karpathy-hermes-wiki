---
id: HERMES-AI-SCHED-001
title: 多 AI 协作调度系统
type: knowledge
tags: [ai-schedule, architecture]
created: 2026-06-25
use_cases:
  - "ai-schedule 是什么"
  - "Mavis 和龙虾怎么协作"
  - "任务单流程"
related_skill: system/ai-scheduling
trust: 0.9
source: AGENTS.md 第 1 章 | 2026-06-26 重构
last_updated: 2026-06-26
---
# 多 AI 协作调度系统 (ai-schedule)

## 项目位置
- 调度目录: D:\ai_schedule\
- 任务单: D:\ai_schedule\tasks\mavis\
- 状态: D:\ai_schedule\state\tasks_state.json
- 结果: D:\ai_schedule\results\mavis\
- 对话日志: D:\ai_schedule\dialogue\
- 发现: D:\ai_schedule\discovery\
- 脚本: D:\ai_schedule\scripts\

## 核心流程
1. 龙虾 (管家) 写任务单到 tasks/mavis/
2. Mavis 接单 (claim) → 执行 → 写结果 → 完成 (complete) → 通知 YANG
3. watchdog 每 10 分钟扫一次状态, 检测超时
4. notify.py 触发 Windows 桌面通知

## 关键规则
- 任务完成后 1 小时自动清理
- YANG 可以直接找 Mavis, 不必经龙虾
- Mavis 可自路由 (最多跳 1 次)
- discovery 双向同步: 所有 AI 共享

## 历史任务
- task_001 ~ task_006: 诸天聊天群 Flutter App
- task_007: 第二阶段计划系统参考 (记忆系统设计)
- task_008: 记忆系统升维 + 调度协议升级
- task_009: Hermes Pre-Response Hook 机制调研 (7 道防线设计)
- task_010: 7 道防线实施 (topic-gate plugin + scripts)


## 相关链接

- [[schedule-protocol]]  # 调度协议
