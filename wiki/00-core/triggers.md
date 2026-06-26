---
id: HERMES-CORE-003
title: 自动触发规则（什么时候自动干什么）
type: rule
tags: [core, triggers, automation]
trust: 1.0
use_cases: ["判断是否需要自动加载能力", "判断任务复杂度"]
source: SOUL.md 自动触发规则段
last_updated: 2026-06-26
---

# 自动触发规则

## 自动加载

| 条件 | 自动做的事 |
|------|-----------|
| 任务涉及 5+ 次工具调用 | 加载 Harness，走 INIT→SCOPE→EXECUTE→VERIFY→RECORD→HANDOFF |
| 修改代码文件 | 执行验证门：编译→测试→lint，不通过不算完 |
| 开始任何编码任务前 | 先对齐需求：明确范围、预期输出、验收标准 |
| 跨多轮/多会话的任务 | 写 `wiki/03-system/harness-checkpoints/{task_id}.md` |
| 一句话问答 / 修 typo / 查资料 / 写作创作 | 什么都不做，跳过 |
| 需要登录态的网页（飞书/GitHub/知乎等） | 自动用 bb-browser 而非 agent-browser |
| 要求润色中文写作 | 加载 [[tools-overview#humanizer-zh]] |
| 要画图/出图/生成图片 | 自动调用 image_generate（Kolors 默认） |
| 要求生成报告/分析展示 | 主动询问是否需要 HTML 版图文报告 |
| 工具报错或 skill 步骤失败 | 触发 RSI 追踪，记 `wiki/03-system/rsi-ledger.md` |
| 完成代码修改后 | 自动跑三层验证：lint→格式化→测试/build |
| 对话接近 40+ 轮感觉变慢 | 触发上下文自动压缩（65%软 / 90%硬） |

## 复杂任务附加行为

| 任务复杂度 | 自动附加的行为 |
|-----------|--------------|
| 5+ 工具调用 | 完成后做结构化后评估（做得好 × 改进点 × 可复用模式） |
| 10+ 工具调用或跨多步 | 先完整规划再执行，步骤间持久化进度，失败从计划恢复 |
| 代码架构评估 | 检查四维度：深接口小行为 × 可测试接缝 × 术语一致性 × 不必要抽象 |

## 写 wiki 时的自动触发

| 条件 | 自动做的事 |
|------|-----------|
| 新建 wiki 页面 | 检查能否和已有笔记做 wiki 交叉引用 |
| YANG 纠正了我 | 自动走"三道关卡"（AGENTS.md 第 2.1 节） |
| 工具连续失败 ≥ 2 次 | 触发 RSI，记 `wiki/03-system/rsi-ledger.md` |
| 周日 22:00 | 自动跑 Lint，写 `wiki/99-temp/lint-{date}.md` |

## 相关链接
- [[identity]] — 核心身份
- [[preferences]] — YANG 偏好
- 完整规则：`C:\Users\YANG\AppData\Local\hermes\SOUL.md`