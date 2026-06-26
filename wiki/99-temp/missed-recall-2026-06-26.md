---
id: HERMES-TEMP-MISSED-20260626
title: 召回失败记录 — 2026-06-26
type: missed-recall
tags: [recall-fail, gap, audit-needed]
trust: 1.0
use_cases: ["发现 wiki 内容缺口", "决定是否新建页面"]
source: hermes 自检 (DIAGNOSTIC_REPORT)
last_updated: 2026-06-26
---

# 召回失败记录 — 2026-06-26

> 8 项自检过程中发现的 wiki 内容缺口。
> 按 AGENTS.md 1.3：连续 3 次召回失败 → 记 `missed-recall-{date}.md` → Lint 检查 → 决定是否新建页面。

---

## ❌ Q1: YANG 手机型号

- **问题**: 问 "YANG 用什么型号的手机？" 召回失败
- **原因**: wiki 全库无任何手机型号信息
- **决定**: ⏸ **暂时不建页**。原因：
  - 个人信息可能涉及隐私（手机 IMEI / 序列号）
  - 当前 SOUL.md 第 4 条铁律"绝不代发"已限定账号密码范围，但手机型号未限定
  - 如果 YANG 想让 hermes 记住手机型号，请明确告知
- **行动**: 等 YANG 确认是否记录
- **状态**: 待 YANG 决定

---

## ❌ Q2: 召回失败 — npm 全局工具

- **问题**: 问 "YANG 装了哪几个 npm 全局工具？" 召回失败
- **原因**: wiki 全库无 npm 全局工具的集中列表
  - `02-knowledge/tools-overview.md` 提到 npm 全局但只是简介
  - 没有专门列出哪些工具已 npm install -g
- **影响**: 召回时无法回答具体工具清单
- **决定**: ✅ **需要新建页面** `wiki/02-knowledge/npm-global.md`
- **行动**: 已记入任务清单，待 Mavis 创建
- **状态**: 待 Mavis 执行

---

## 附加建议

如果未来再发生召回失败：

1. **优先检查** `wiki/02-knowledge/tools-overview.md` 是否需要更新
2. **个人信息**（手机/账号/密码）单独建页面并加 `private` tag，不放通用知识区
3. **通用工具**优先放 `02-knowledge/`，便于所有 AI 召回

---

**本文件由 hermes 自检过程自动生成。下次 Lint 时检查状态。**