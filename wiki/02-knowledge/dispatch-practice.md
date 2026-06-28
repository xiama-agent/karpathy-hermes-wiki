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

### 已验证的手工操作（替代 dispatch-prep.py）

dispatch-prep.py 已删除（docx 行号不准 + subprocess 权限问题）。使用已验证的手工流程：

1. `read_file` 读取设计文档相关段落
2. 复制原文 → 写入 `.txt` 文件
3. `reasonix run @file.txt`（走终端，不走 subprocess）
4. capture 输出 → 整理 → 作为派单描述

### 各 Agent 的派单模式

| Agent | 派单方式 | 适用场景 |
|-------|---------|---------|
| Mavis | 写任务单到 tasks/mavis/ | 桌面/GUI操作，文件调度 |
| Claude Code | `-p`模式输出文本→龙虾写入 | 长链编码，纯代码生成 |
| Reasonix | `reasonix run` 直接执行 | 诊断/精确拆解/写派单 |

## Claude Code 的 -p 模式限制
`-p` 是非交互模式，无法通过文件写入权限审批。正确用法：
1. `claude -p "生成代码" --bare > claude-output.txt` → capture 输出到文件
2. 提取 HTML 代码块（通用脚本，不用每次写新脚本）：
   ```bash
   python D:/ai_schedule/scripts/extract-claude-output.py claude-output.txt index.html
   ```
   该脚本在 `D:\ai_schedule\scripts\extract-claude-output.py`，支持正则提取 ```html 块和 DOCTYPE 备用提取。
3. **全局验收**（不只检查自己要的那部分）：`grep -c "step\|关键文案" index.html`
4. **检查文件变化总量**：对比写入前后行数/大小，确认没有意外内容
5. 清理临时文件：`rm claude-output.txt`

## 相关链接
- [[02-knowledge/agent-routing]] — 路由规则
- skill: `ai-scheduling` — 完整调度协议
- `D:\ai_schedule\scripts\extract-claude-output.py` — Claude Code 输出提取工具
- `D:\ai_schedule\scripts\dispatch-prep.py` — 已删除（docx解析+subprocess双坑未验）
- SOUL.md 第11条 — 原文优先规则
- [[00-core/zhigen-methodology]] — 治本方法论

---

## 全链路开发方法论（2026-06-28 实战沉淀）

### 核心原则：先验证再组合

dispatch-prep.py 失败的根因：把两个没单独验证的操作串在一起。正确的顺序：

```
① 单独验证 docx 解析 → 确认行号准确
② 单独验证 reasonix subprocess → 确认权限通
③ 确认①②都通 → 再组合成脚本
```

违反这个原则的代价：写了脚本发现跑不通，白费时间。

### Claude Code 的 -p 模式：capture 先行

每次 `-p` 模式生成代码后：
1. 输出到文件：`claude -p "任务" --bare > claude-output.txt`
2. 提取：`python D:/ai_schedule/scripts/extract-claude-output.py claude-output.txt index.html`
3. 全局验收：不只检查自己要的部分——grep 全文件关键内容 + 对比文件大小
4. Claude Code 可能做了比你要求更多的内容（如 Step 2 派单时顺带做了 Step 3+4）

### 验收要全覆盖

每次代码写入后，检查三个层次：
| 层次 | 检查什么 | 方法 |
|------|---------|------|
| 局部 | 我要的功能有没有 | grep 关键词 |
| 全局 | 有没有意外的多出/少了 | 对比文件行数/大小 |
| 视觉 | 页面看起来对不对 | MiMo 看图 |

### Reasonix 冷启动慢的根因

不是模型慢，是 web-access skill 的 description 字段格式问题导致 Reasonix 每次刷 10 遍警告。如果看到 Reasonix 启动慢，先查 warning 日志。