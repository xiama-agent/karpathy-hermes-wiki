---
id: PRAC-DISPATCH-001
title: 派单实践与两层失真
type: practice
tags: [dispatch, practice, lesson]
use_cases: ["精确派单", "两层失真", "Claude Code派单"]
source: 2026-06-28全链路测试
trust: 0.9
last_updated: 2026-06-28
---

# 派单实践：两层失真问题

## 问题定义

龙虾从设计文档到任务派单的过程中存在「两层失真」：

```
设计文档（精确原文）
  → ① 龙虾概括（第一层失真）
    → 派单描述（已偏离原文）
      → ② 编码 Agent 二次创作（第二层失真）
        → 最终产出（不可控）
```

## 根因

龙虾总觉得自己「理解」了就可以概括，但概括必然丢信息。不是推理能力问题，是行为习惯问题。

## 已验证的解决方案

### 原文优先（宪法第11条）
派单时涉及布局、文案、规则的内容必须直接复制原文，禁止概括转述。

### Reasonix 介入拆解
复杂任务先派 Reasonix（V4 Pro）做精确拆解。Reasonix 的特点是机械地展开原文，不会「创造」新内容，产出的派单总与原文一致。

已验证链路：
```
设计文档原文 → 龙虾写框架
  → Reasonix run 精确拆解（¥0.05/次）
    → 精确派单描述
      → Claude Code -p 生成代码（capture输出）
        → 龙虾 write_file 写入
          → MiMo 看图验收
```

### dispatch-prep.py 脚本
自动提取设计文档指定行号的原文，拼接成框架后送 Reasonix 拆解。

## 各 Agent 的派单模式

| Agent | 派单方式 | 适用场景 |
|-------|---------|---------|
| Mavis | 写任务单到 tasks/mavis/ | 桌面/GUI操作，文件调度 |
| Claude Code | `-p`模式输出文本→龙虾写入 | 长链编码，纯代码生成 |
| Reasonix | `reasonix run` 直接执行 | 诊断/精确拆解/写派单 |

## Claude Code 的 -p 模式限制
`-p` 是非交互模式，无法通过文件写入权限审批。正确用法：
1. `claude -p "生成代码"` → capture 输出文本
2. 检查代码质量
3. `write_file` 写入文件

## 相关链接
- [[02-knowledge/agent-routing]] — 路由规则
- skill: `ai-scheduling` — 完整调度协议
- `D:\ai_schedule\scripts\dispatch-prep.py` — 派单辅助脚本
- SOUL.md 第11条 — 原文优先规则
