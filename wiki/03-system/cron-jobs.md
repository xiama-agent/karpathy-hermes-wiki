---
id: HERMES-CRON-001
title: 定时任务清单
type: config
tags: [system, cron, schedule]
use_cases: ["有哪些定时任务", "cronjob", "自动任务"]
source: SOUL.md 自动化条目
trust: 0.95
last_updated: 2026-06-26
---
# 定时任务清单

## 每日任务
| 时间 | 任务 | 说明 |
|------|------|------|
| 22:29 | 关程序 | — |
| 22:30 | 关机 | — |
| 08:00 | RSS扫描 | 当前为 paused 状态 |
| 23:00 | Wiki 自动备份 | git commit + 三副本 |

## 高频任务（每10分钟）
- ai-schedule-watchdog：扫描超时任务

## 每小时任务
- ai-schedule-cleanup：删除已完成超1小时的任务文件

## 月度任务
- 记忆系统体检：扫描死链/重复/过期/矛盾


## 相关链接（自动补充）

- [[hermes-hooks]]
- [[auto-tasks]]
- [[backup]]

- [[rsi-ledger]]  # RSI 失败追踪
