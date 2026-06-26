# AGENTS.md — 龙虾记忆系统操作手册（机械指令版）

> 路径：`D:\ai_schedule\hermes-brain\AGENTS.md`
> 读者：龙虾（DeepSeek V4 Flash）
> 风格：机械指令，每条规则回答"做 X→触发 Y→写入 Z"，不抽象、不哲学
> 优先级：SOUL.md > 本文件 > wiki 任何页面

---

## 第 0 章：必读铁律（任何操作前先读这 6 条）

1. **本文件所有命令必须执行**，不能"理解后变通"。DeepSeek 容易把硬指令软化，本文件就是反软化的。
2. **写入前必查**：每次写 wiki 前先 grep 目标目录，避免重复页面、覆盖现有事实。
3. **路径必验**：使用任何路径前先 `ls/stat` 确认存在，不存在的路径不写。
4. **事实必带元数据**：每条事实必须带 frontmatter（id/tags/trust/use_cases/source）。
5. **trust 默认 0.3**：新写入的事实 trust=0.3，被证明有用 +0.1，被否决 -0.2。
6. **宪法 > 本文件 > 任何 wiki**：SOUL.md 优先级最高，冲突时按 SOUL.md 执行。

---

## 第 1 章：召回回路（每次对话开始时执行）

### 1.1 INDEX 注入（每轮 prompt 必须）

```
操作：读 D:\ai_schedule\hermes-brain\index.md
目的：获得当前可用 wiki 类目的指针
约束：注入版 ≤800 字，超过则报错（说明需要瘦身）
```

### 1.2 按类召回（不要全局 top-k）

```
触发：YANG 提问
步骤：
  1. 读 1.1 注入的 INDEX
  2. 判断问题所属类别（user_pref / project / tool / knowledge / general）
  3. 读 wiki/{category}/INDEX.md（如存在）
  4. grep 类别目录找出最相关 1-3 个页面
  5. 读这些页面的 frontmatter 和首段
  6. 仅在上述召回不足时，才用 fact_store 兜底
```

### 1.3 召回失败兜底（小模型回退开关）

```
触发：连续 3 次 grep/recall 都没命中关键事实
动作：
  1. 自动读 SOUL.md 中"硬编码核心偏好 7 条"段
  2. 用这 7 条兜底回答
  3. 把"失败的事实关键词"记到 wiki/99-temp/missed-recall-{date}.md
  4. 下次 Lint 时检查是否需要新建对应页面
```

### 1.4 召回成功后必须 fact_feedback

```
触发：1.2 召回了某条事实，且确实对回答有帮助
动作：
  1. 找到该事实所在页面（wiki/04-facts/{category}.md）
  2. 更新该条 frontmatter：trust += 0.1，retrieval_count += 1
  3. 不跳过不拖，这是 trust 系统运转的最小闭环
```

---

## 第 2 章：写入回路（什么时候写、写到哪）

### 2.1 三道关卡（先判断是否值得写）

```
关卡 1：是否值得写？
  - ✅ YANG 明确说"记住/记下/更新龙虾" → 直接写，跳过关卡 2/3
  - ✅ YANG 纠正了我 → 直接写，跳过关卡 2/3
  - ✅ 同一件事出现 ≥3 次（30 天内）→ 直接写，跳过关卡 2/3
  - ❌ 随口说的 / 一次性指令 / 我的猜测 / 临时状态 → 跳过，不写

关卡 2：写入隔离期
  - 通过关卡 1 但未满足以上三条 → 先写 wiki/99-temp/candidate-{date}.md
  - 隔离 14 天，期间 INDEX 不指向它

关卡 3：自动升级
  - 14 天内被再次提起 → 从 99-temp 升级到对应分类目录
  - 升级时检查：同 topic 无矛盾 → 确定目标 → 更新 INDEX → 通知 YANG
  - 14 天内未被提起 → Lint 时删除 candidate 文件
```

### 2.2 写入目标分类（按内容决定放哪）

| 内容类型 | 目标路径 | 命名规则 |
|---------|---------|---------|
| YANG 个人偏好（长期稳定） | `wiki/00-core/preferences.md` | 一个偏好一段，带 trust |
| YANG 档案/路径/预算 | `wiki/01-yang/{topic}.md` | 按 topic 拆文件 |
| 工具/MCP/skill 操作流程 | `wiki/02-knowledge/{tool}.md` | 一个工具一页 |
| 系统配置/cron/hook | `wiki/03-system/{system}.md` | 一个系统一页 |
| 单条事实（路径/项目/参考） | `wiki/04-facts/{category}.md` | 按 user_pref/project/tool/general 分类聚合 |
| 临时/未验证 | `wiki/99-temp/{purpose}-{date}.md` | 14 天后清理或升级 |

### 2.3 写入格式（强制）

每个 .md 文件必须包含：

```markdown
---
id: HERMES-{CATEGORY}-{NUMBER}    ← 例：HERMES-FACT-001
title: 一句话标题
type: identity|preference|rule|fact|knowledge
tags: [category, subcategory]
trust: 0.3                          ← 默认 0.3，召回成功 +0.1
use_cases: ["何时召回这个页面"]
source: SOUL.md L7 | fact_store#12 | 2026-06-26 对话
last_updated: 2026-06-26
---

# 标题

## 核心内容
（实际知识，简洁直接，不要客套）

## 召回条件
（什么情况下这个页面该被召回）

## 相关链接
（[[wiki/01-yang/profile]] [[wiki/02-knowledge/paths]]）
```

### 2.4 写入后必须更新 INDEX

```
每次新建/升级/归档 wiki 页面后：
  1. 读 D:\ai_schedule\hermes-brain\index.md
  2. 找到对应分类，更新该行（带链接 + 一句话摘要）
  3. 检查总字数 > 800 → 精简或拆分类
  4. 追加 log.md 一行：## [YYYY-MM-DD] ingest | {filename}
```

---

## 第 3 章：Lint 回路（每周日 22:00 cron 自动跑）

### 3.1 Lint 检查项

```
A. 矛盾检查：grep wiki 内所有"X 是 Y"声明，找冲突对，写入 lint-{date}.md
B. 孤立页检查：每个 wiki 页面至少有 1 个入链，孤儿页记入 lint-{date}.md
C. 过期检查：wiki/04-facts/ 下 trust<0.3 且 last_updated > 30 天的条目 → 候选归档
D. INDEX 健康：检查 index.md 长度、有无死链、分类是否均衡
E. 漏检：wiki/99-temp/missed-recall-*.md 有内容 → 提示新建对应页面
```

### 3.2 Lint 输出

```
写入 wiki/99-temp/lint-{YYYY-MM-DD}.md，格式：
  ## 矛盾 (3 处)
  - wiki/04-facts/user-pref.md L12 说"X"
    wiki/02-knowledge/paths.md L5 说"Y"
    冲突 → 需要 YANG 确认
  ## 孤立页 (2 个)
  - wiki/02-knowledge/old-tool.md
  ## 候选归档 (5 个)
  - HERMES-FACT-089 ...
  ## INDEX 长度: 720 字 (健康)
```

---

## 第 4 章：Audit 回路（YANG 阅读时纠错）

### 4.1 触发条件

```
YANG 在 wiki 任一页面读到了错误或过期内容
```

### 4.2 操作

```
1. 在该页面的"问题内容"段插入：
   [AUDIT YYYY-MM-DD] 这段有问题：{原因}
2. 复制整页到 wiki/99-temp/audit-{date}-{slug}.md
3. 写入 log.md：## [YYYY-MM-DD] audit | {page} | {slug}
4. 下次 Ingest 时优先处理 audit 文件夹的内容
```

---

## 第 5 章：Forget 回路（自动过期）

### 5.1 触发条件（同时满足）

```
- 事实来自 wiki/04-facts/（或 wiki/99-temp/candidate-*.md）
- trust < 0.3
- last_updated > 14 天
```

### 5.2 动作

```
1. 移入 wiki/99-temp/archived-{YYYY-MM-DD}.md
2. 从对应 INDEX 行删除
3. 写入 log.md：## [YYYY-MM-DD] forget | {fact-id}
4. 不真删，保留 90 天兜底
```

---

## 第 6 章：与 SOUL.md 的协作

### 6.1 SOUL.md 不可写（本文件权限之外）

```
只有"更新龙虾"指令可改 SOUL.md
AGENTS.md 不能反向修改 SOUL.md
```

### 6.2 SOUL.md 修改后必须同步

```
"更新龙虾"指令触发的 SOUL.md 修改：
  1. 读 SOUL.md 新版本
  2. 检查 AGENTS.md 是否需要同步（如新加了规则）
  3. 检查 wiki 是否有页面引用旧规则（grep SOUL.md 旧版关键词）
  4. 更新 wiki 相关页面
  5. 跑 Lint（手动）确认无矛盾
  6. 写入 log.md：## [YYYY-MM-DD] soul-sync | {changes}
```

---

## 第 7 章：错误处理

### 7.1 召回回路故障

```
- INDEX.md 不存在 → 报"系统未初始化"给 YANG，停止对话
- INDEX.md > 800 字 → 自动精简（合并相似分类，删除冷门）
- grep 失败 → 用 PowerShell Select-String（Windows）替代
```

### 7.2 写入回路故障

```
- 目标目录不存在 → mkdir -p 后再写，不覆盖现有文件
- 同名页面已存在 → 先 diff，决定合并还是版本号（v2 后缀）
- frontmatter 缺失 → 自动补全，不阻断
```

### 7.3 cron 失败

```
- wiki-lint 周跑失败 → 重试 3 次，再失败则把错误写入 wiki/99-temp/lint-error-{date}.md
- 不阻塞对话，YANG 下次会话开始时会看到错误报告
```

---

## 第 8 章：硬约束清单（违反任何一条立即停止 + 报 YANG）

1. 不得删除 SOUL.md 任何内容
2. 不得删除 AGENTS.md 任何章节
3. 不得在 wiki 中存储密码、API key、私密 token
4. 不得在没有 YANG 确认的情况下删除 wiki 任何已有页面（只能归档）
5. 不得修改 fact_store 数据库 schema（写入受信任，但表结构只读）
6. 不得在 git 未提交的情况下关闭终端（必须先 commit）

---

## 附录 A：核心路径速查

| 用途 | 路径 |
|------|------|
| 大脑根目录 | `D:\ai_schedule\hermes-brain\` |
| 操作手册（本文件） | `D:\ai_schedule\hermes-brain\AGENTS.md` |
| 注入索引（每轮读） | `D:\ai_schedule\hermes-brain\index.md` |
| 操作日志 | `D:\ai_schedule\hermes-brain\log.md` |
| 原始资料 | `D:\ai_schedule\hermes-brain\raw\` |
| Wiki 主区 | `D:\ai_schedule\hermes-brain\wiki\` |
| 临时隔离区 | `D:\ai_schedule\hermes-brain\wiki\99-temp\` |
| 备份根 | `D:\ai_schedule\backup\` |
| 宪法（不可改） | `C:\Users\YANG\AppData\Local\hermes\SOUL.md` |
| 旧 fact_store（只读兜底） | `C:\Users\YANG\AppData\Local\hermes\memory_store.db` |

---

## 附录 B：写入示例

```markdown
---
id: HERMES-FACT-001
title: YANG 桌面是 D 盘不是 C 盘
type: fact
tags: [user_pref, paths]
trust: 0.5
use_cases: ["YANG 提到桌面路径", "需要写到桌面的文件操作"]
source: fact_store#7
last_updated: 2026-06-26
---

# YANG 桌面是 D 盘

## 核心内容
- 桌面路径：`D:\Users\YANG\Desktop\`（不是 C 盘）
- 桌面只放 `.lnk` 快捷方式，不放实际文件
- 文档归 `D:\` 下

## 召回条件
- YANG 说"桌面"或"快捷方式"
- 任何文件操作需要确认桌面路径

## 相关链接
- [[wiki/01-yang/desktop]]
- [[wiki/02-knowledge/paths]]
```

---

**文档结束。本文件优先级仅次于 SOUL.md，任何 wiki 操作前必须读完。**