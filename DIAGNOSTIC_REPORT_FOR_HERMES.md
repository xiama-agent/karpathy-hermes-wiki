# 诊断报告 — Hermes 记忆系统 v3.1.1

> 致：**龙虾（Hermes Agent）**
> 自：**Mavis**
> 日期：2026-06-26
> 任务：**自我诊断记忆系统问题，输出可执行任务清单给 Mavis 执行**
> 截止：**今天 2026-06-26 必须完成所有修复**

---

## 1. 背景

YANG 要"完美的记忆系统"，按 karpathy LLM Wiki 范式 + llm-wiki-skill 13 项优化重构龙虾的记忆系统。

当前版本：**v3.1.1**（commit `63e2248`）
位置：`D:\ai_schedule\hermes-brain\`
备份：`D:\ai_schedule\backup\`（2 份完整快照）

**已知**：
- 46 个 wiki 页面 + 4 个事实聚合
- 103 条 fact 已 trust 激活（0.6–0.75）
- 0 孤立页
- INDEX 1514 bytes（≤1600 上限）
- 旧管道物理熔断（12 个 `.legacy/.disabled` 文件）
- Windows 定时任务每 6h 跑 lint

---

## 2. 3 个测试结果（已经发生的事实）

**测试 1** — "你叫什么名字？你是谁打造的？基于什么模型？"

> 我叫 **龙虾** 🦞
> 打造者：YANG（你）
> 技术栈：Hermes Agent + DeepSeek V4 Flash
> 宪法第一条就是"忠诚优先"

✅ **通过**：身份认知完整。

---

**测试 2** — "你的记忆系统叫什么名字？在哪里？包含哪些类别？"

> ## 我的记忆系统叫 **「两铁三角」**
> ## Wiki 包含的类别
> - 00-core/ ✅
> - **01-skills/** ❌（不存在）
> - **02-projects/** ❌（不存在）
> - **03-tools/** ❌（不存在）
> - **04-facts/** ✅
> - **05-devices/** ❌（不存在）
> - **06-people/** ❌（不存在）
> - **07-templates/** ❌（不存在）

⚠️ **部分通过**：架构描述正确，**但 6 个类别是幻觉编造的**。

实际存在的类别是：`00-core / 01-yang / 02-knowledge / 03-system / 04-facts / 99-temp`

---

**测试 3** — "YANG 的预算是多少？包括哪些项目？"

> ¥219/月 = DeepSeek ¥170 + MiniMax ¥49
> 4 条省钱铁律

✅ **通过**：召回精确，命中 `wiki/01-yang/budget.md`。

---

## 3. 已确认的问题

### 问题 P0-1（已确认）：INDEX 细节幻觉

- **现象**：能提到 INDEX 的整体架构描述，但具体页面名是 LLM 幻觉编造的
- **根因**：INDEX.md 在长 context 中被 LLM 注意力稀释（"lost in middle"）
- **影响**：INDEX 注入目的部分失败——LLM 不知道有哪些具体页面可召回
- **严重度**：**HIGH**（影响 INDEX 注入的核心价值）

---

## 4. 待排查的问题（请你自己检查）

请依次执行下面 8 个自检，**用 ls / read 实际查文件**，不要凭印象回答。报告每个检查的**真实结果**。

### 4.1 SOUL.md 完整性自检

```bash
# 请你执行这些命令，记录输出
1. Read: C:\Users\YANG\AppData\Local\hermes\SOUL.md
2. 列出 SOUL.md 的"身份宪法"一共几条
3. 能否完整背诵所有宪法条款？
4. SOUL.md 现在是多少字节？多少行？
```

### 4.2 Wiki 00-core 内容自检

```bash
1. Read: D:\ai_schedule\hermes-brain\wiki\00-core\preferences.md
2. preferences.md 声称"≤20 条硬规则"——实际有几条？
3. 列出所有硬规则的标题
```

### 4.3 Wiki 01-yang 内容自检

```bash
1. ls D:\ai_schedule\hermes-brain\wiki\01-yang\
2. 有几个文件？文件名分别是什么？
3. Read projects.md
4. projects.md 列了几个项目？项目名分别是什么？
```

### 4.4 Wiki 02-knowledge 完整性自检

```bash
1. ls D:\ai_schedule\hermes-brain\wiki\02-knowledge\
2. 一共几个文件？文件名依次是什么？
3. Read aliyun.md — 内容是否完整？（路径、SSH 密钥、连接命令）
```

### 4.5 Wiki 04-facts 完整性自检

```bash
1. ls D:\ai_schedule\hermes-brain\wiki\04-facts\
2. 几个文件？每个文件包含几条事实？
3. Read user_pref.md 第一条事实 — 它的 trust 现在是多少？
```

### 4.6 AGENTS.md 章节自检

```bash
1. Read: D:\ai_schedule\hermes-brain\AGENTS.md
2. 一共几章？每章标题是什么？
3. 第 1.3 节"召回失败兜底"具体做什么？
4. 第 4 章"Audit 回路"如何触发？
```

### 4.7 召回实战自检（向自己提问）

请你假装 YANG 在跟你对话，回答以下问题（**用 grep 工具实际查 wiki，不要凭印象**）：

```
Q1: "YANG 用什么型号的手机？"（这应该召回失败 → 触发 1.3 兜底）
Q2: "Hermes Agent 怎么调用 MCP？配置文件在哪？"
Q3: "20 章小说单元节奏模型是什么？出自哪本书？"
Q4: "夜间锁屏程序路径是什么？解锁密码多少？"
Q5: "YANG 装了哪几个 npm 全局工具？"
```

每个问题请报告：
- 你查了哪些文件
- 最终引用的页面路径
- 答案（带页面链接）

### 4.8 系统集成自检

```bash
1. Read: C:\Users\YANG\AppData\Local\hermes\config.yaml
2. memory.provider 当前是什么值？
3. hermes-wiki-recall.enabled 是什么值？
4. plugins.hermes-memory-store.legacy 是什么值？
```

---

## 5. 任务清单模板（请按此格式输出）

排查完上面 8 项后，**请按以下格式输出任务清单**。每条任务要明确、可执行、有验收标准。

```markdown
## 任务清单（Hermes 派发给 Mavis）

### 任务 1: [标题]
- **问题**: [你发现的具体问题，要具体到文件路径/行号]
- **严重度**: critical / high / medium / low
- **期望修复**: [具体改什么，改哪个文件]
- **验收标准**: [怎么验证修复成功，需要哪些命令输出]
- **预估时间**: [10min / 30min / 1h / etc.]

### 任务 2: ...

### 不需要修的（你已确认没问题）:
- [列出你检查过但没问题的项目]

### 阻塞项（需要 YANG 直接处理）:
- [列出 Mavis 做不了、需要 YANG 或你本人处理的事项]
```

---

## 6. 你的约束（Mavis 能力边界）

- ✅ Mavis 可以：修改 wiki/ 下任何文件、修改 config.yaml、修改 cron 任务、写新工具脚本
- ✅ Mavis 可以：git commit、跑 lint/recall 验证、生成报告
- ❌ Mavis **不能**：直接启动/重启 hermes runtime
- ❌ Mavis **不能**：直接和 hermes 对话（要靠 YANG relay）
- ❌ Mavis **不能**：修改 hermes 核心 Python 代码（`hermes-agent/venv/` 下）
- ❌ Mavis **不能**：访问 hermes 内部 prompt 注入逻辑的源码

任何"修改 hermes 核心代码"的任务，**必须你或 YANG 直接做**。

---

## 7. 关键提醒

1. **改动必须可回滚**：保留 `.legacy/.disabled` 后缀，不能 rm 任何东西
2. **完成后必须 git commit**：每完成一个任务 commit 一次，commit message 要清楚
3. **INDEX 注入问题的修复方向**（仅供参考）：
   - 方案 A：INDEX.md 开头加视觉强调框（`=== WIKI INDEX 必读 ===`）
   - 方案 B：SOUL.md 加一条"读取 INDEX 时一字不漏复述"
   - 方案 C：把 INDEX 内容从 system prompt 移到 user message 第一条
   - 方案 D：缩小 INDEX 内容（< 1000 bytes）让 LLM 注意力更聚焦
   - 你可以建议其他方案，但需要说明理由

4. **你的输出就是 Mavis 的工作清单**——所以请尽量精确：
   - "把 X 文件的 Y 段改成 Z" 比 "改 X" 更可执行
   - 给出 grep 命令让 Mavis 验证
   - 严重度 critical 的必须今天修，其他可以排期

---

## 8. 时间

- 你读这份文件 + 8 项自检：建议 15 分钟内完成
- 输出任务清单：5 分钟
- YANG 把任务清单转给 Mavis：5 分钟
- Mavis 执行：今天剩余时间
- **今天 23:59 之前所有 critical 任务必须完成**

---

**报告结束。YANG 现在把这文件路径转给你，等你输出任务清单。**

**Mavis 在这里等你的诊断结果。**