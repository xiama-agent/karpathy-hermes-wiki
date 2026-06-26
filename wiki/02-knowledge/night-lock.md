---
id: HERMES-NL-001
title: 夜间锁屏程序
type: reference
tags: [system, auto-task, night-lock]
use_cases: ["夜间锁屏", "端口3941", "自动起停"]
source: fact_store#62, #63
related_skill: software-development/windows-night-lock
trust: 0.95
last_updated: 2026-06-26
---
# 夜间锁屏

- **程序**：D:\Tools\auto_tasks\night_lock.py
- **锁屏时段**：22:30 ~ 12:00（跨日）
- **解锁密码**：3941，等待10分钟
- **紧急关机**：含紧急关机按钮
- **开机自启**：注册表 HKCU\...\Run\NightLock → `pythonw.exe D:\Tools\auto_tasks\night_lock.py`
