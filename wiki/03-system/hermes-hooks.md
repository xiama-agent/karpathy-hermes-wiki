---
id: HERMES-HOOK-001
title: Hermes Hook 系统
type: system
tags: [hermes, hooks, plugin]
created: 2026-06-25
use_cases:
  - "Hermes 有哪些 hook"
  - "怎么用 hook 实现 topic-gate"
  - "plugin 怎么写"
trust: 0.95
last_updated: 2026-06-26
---
# Hermes Hook 系统

## 3 大类 Hook 系统
- Gateway Hooks: HOOK.yaml + handler.py, 仅 Gateway 跑
- Plugin Hooks: ctx.register_hook(), CLI + Gateway 都跑 (推荐)
- Shell Hooks: config.yaml hooks 块, CLI + Gateway 都跑

## 24 个有效 Event (从 hermes hooks test 实测)
- 会话生命周期: on_session_start / on_session_end / on_session_finalize / on_session_reset
- LLM 调用: pre_llm_call / post_llm_call / transform_llm_output / api_request_error
- 工具调用: pre_tool_call / post_tool_call / transform_tool_result / transform_terminal_output
- Gateway: pre_gateway_dispatch / pre_approval_request / post_approval_response
- 子 agent: subagent_start / subagent_stop
- Kanban: kanban_task_blocked / kanban_task_claimed / kanban_task_completed

## 关键能力边界
| Hook | 注入 context | 改输出 | block 操作 |
|---|---|---|---|
| pre_llm_call | ✅ | ❌ | ❌ |
| pre_tool_call | ❌ | ❌ | ✅ |
| transform_llm_output | ❌ | ✅ | ❌ |

## Plugin 编写流程
1. mkdir ~/.hermes/plugins/<name>
2. 写 plugin.yaml + handler.py
3. handler.py 暴露 register(ctx) 函数
4. hermes plugins install + enable

## 失败兜底
- Hook 抛异常 → catch + log, 不让 agent 崩
- 第一次 shell hook 跑 → 弹窗请求一次性授权


## 相关链接（自动补充）

- [[cron-jobs]]
- [[plugins]]
- [[topic-gate]]
