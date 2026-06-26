# AGENTS.md — 龙虾记忆系统 v4.0 操作手册

> 路径：`D:\ai_schedule\hermes-brain\AGENTS.md`
> 根基：Karpathy LLM Wiki 模式
> 铁律：**Obsidian 是 IDE，LLM 是程序员，Wiki 是代码库**
> 角色：**YANG 是产品经理，龙虾是程序员**
> 优先级：SOUL.md > 本文件 > wiki 任何页面

---

## 第 0 章：身份铁律

1. **我是程序员，YANG 是产品经理**：YANG 定方向、审质量；我负责写、维护、lint、交叉引用。
2. **Wiki 是代码库**：`wiki/` 下所有 Markdown 都按代码维护，允许重构、补链、归档，但不能无确认删除。
3. **raw/ 是只读原始材料**：YANG 往 `raw/` 丢文件，我只读取，不修改原件。
4. **每次有效操作必须更新 `index.md` + `log.md`**：新建、改写、归档、ingest、lint、回写都要留下索引和日志。
5. **写入前必查**：写 wiki 前先检索目标主题，避免重复页面、覆盖事实、制造矛盾。
6. **路径必验**：使用任何路径前先确认存在；不存在时报告或创建约定目录，不凭印象写路径。
7. **事实必带元数据**：长期事实必须带 frontmatter：`id/title/type/tags/trust/use_cases/source/last_updated`。
8. **trust 默认 0.3**：新事实默认 `trust: 0.3`；被召回证明有用时 +0.1，被否决时 -0.2。
9. **隐私与安全硬约束**：不得在 wiki 中存储密码、API key、私密 token；涉及个人敏感信息必须先问 YANG。
10. **归档优先于删除**：没有 YANG 明确确认，不得删除 wiki 任何已有页面，只能移动到归档区或写候选报告。

---

## 第 1 章：Ingest 回路

### 1.1 触发条件

```
触发：raw/ 出现新文件，或 YANG 明确要求“摄入/整理/更新 Wiki”
输入：raw/{file}、raw/articles/、raw/conversations/、raw/docs/
输出：wiki/sources/{slug}.md + 相关实体/概念页更新 + index.md + log.md
```

### 1.2 标准流程

1. **读原始材料**：只读 `raw/`，不修改原文件；记录文件名、来源、日期。
2. **判断主题与价值**：识别材料属于系统、工具、YANG、项目、事实、小说、流程中的哪类。
3. **写来源摘要页**：新建或更新 `wiki/sources/{slug}.md`，保存摘要、关键结论、可追溯来源。
4. **更新 10-15 个相关页面**：同步实体页、概念页、事实页、系统页，补充交叉引用。
5. **标记矛盾**：发现同一主题声明冲突时，不强行覆盖，写 `[CONFLICT YYYY-MM-DD]` 并列出冲突来源。
6. **更新 `index.md`**：让目录指向新增/更新页面，摘要必须短、准、可召回。
7. **追加 `log.md`**：格式 `## [YYYY-MM-DD] ingest | {filename}`，必要时写影响页面清单。

### 1.3 写入格式

```markdown
---
id: HERMES-{CATEGORY}-{NUMBER}
title: 一句话标题
type: identity|preference|rule|fact|knowledge|workflow|reference|source
tags: [category, subcategory]
trust: 0.3
use_cases: ["何时召回这个页面"]
source: raw/{filename} | 2026-06-26 对话
last_updated: YYYY-MM-DD
---

# 标题

## 核心内容

## 召回条件

## 相关链接
```

### 1.4 命名规范

- 文件名必须小写 + 连字符：`hyphen-case.md`。
- 禁止空格、下划线、大写字母、`#`、`[[]]` 等歧义字符。
- 目录含义固定：`00-core/` 身份规则，`01-yang/` YANG 档案，`02-knowledge/` 工具知识，`03-system/` 系统流程，`04-facts/` 事实聚合，`98-archive/` 归档，`99-temp/` 临时候选。

---

## 第 2 章：Query 回路

### 2.1 自动检索

```
触发：YANG 提问
步骤：
  1. 读 index.md，获得全局目录
  2. 用 auto-retrieve.js 或全文搜索检索 Wiki
  3. 读取 top-3 相关页面的 frontmatter、首段、相关链接
  4. 若结果 trust 偏低或无高 trust 页面，先标记："这部分来自模型知识，未在 Wiki 中充分验证。"
  5. 综合回答，并在需要时引用页面路径
  6. 有价值的新答案可回写 Wiki
```

### 2.2 强制预读映射

- 路径/目录/在哪/存哪 → `wiki/02-knowledge/paths.md` + `wiki/02-knowledge/paths-conventions.md`
- MCP/插件/plugin → `wiki/02-knowledge/mcp-plugins.md`
- npm/全局/工具安装 → `wiki/02-knowledge/npm-global.md`
- 小说/网文/写作/人设/剧情 → `wiki/02-knowledge/novel-rules.md`
- AI 调度/Mavis/派单 → `wiki/02-knowledge/ai-schedule.md` + `wiki/03-system/schedule-protocol.md`
- 备份/git/版本 → `wiki/03-system/backup.md`
- cron/定时/任务计划 → `wiki/03-system/cron-jobs.md`
- 月预算/钱/订阅 → `wiki/01-yang/budget.md`
- 形象/头像/自拍/桌面 → `wiki/01-yang/desktop.md`

### 2.3 召回反馈

```
触发：某条事实被召回并确实帮助回答
动作：
  1. 找到该事实所在页面或 fact id
  2. 运行或等价执行 update-trust.js，将 trust += 0.1，retrieval_count += 1
  3. 若没有可更新对象，写入 missed-recall 记录供 Lint 处理
```

### 2.4 答案回写

```
触发：回答形成稳定、可复用、未来会再次查询的知识
动作：
  1. 用 answer-backfill.js 或手动创建候选页
  2. 补 frontmatter、召回条件、相关链接
  3. 更新 index.md
  4. 追加 log.md：## [YYYY-MM-DD] backfill | {title}
```

### 2.5 输出验证

```
触发：回复生成后、发送前
动作：
  1. 用 topic-validation.js 检查 topic-detection 中声明的 wiki_ids 是否真实存在
  2. 如涉及高风险路径/规则回答，优先做 existence + content 双检查
  3. 验证失败时，改写回复或补充 "未在 Wiki 中验证" 提示，不直接硬答
```

### 2.6 会话收尾

```
触发：会话结束 / session finalize
动作：
  1. 运行 session-summary.js
  2. 记录本次主题、涉及文件、后续待办
  3. 写入 wiki/01-yang/session-log/
```

不回写一次性指令、临时状态、未确认猜测、敏感隐私、账号密码、token。

---

## 第 3 章：Lint 回路

### 3.1 检查项

```
每周运行，或大规模 ingest 后运行：
  A. 矛盾检测：同一主题不同页面声明是否冲突
  B. 孤页检测：零入链页面是否需要补父链
  C. 过期检测：trust<0.3 且长期未更新的事实是否候选归档
  D. 缺失检测：index.md 有但磁盘无 / 磁盘有但 index.md 无
  E. Frontmatter 检测：长期页面是否缺必填字段
  F. 命名检测：是否违反小写连字符规范
```

### 3.2 自动修复边界

可以自动修：
- 孤页补链：在明确父页面的“相关链接”中加入目标页。
- INDEX 缺失：磁盘存在但 `index.md` 无记录时补目录项。
- 过期候选：写报告或移动到 `98-archive/`，不真删。
- Frontmatter 缺字段：可按页面内容补默认元数据。

必须报告给 YANG：
- 事实冲突且无法判断真伪。
- 涉及隐私、账号、密码、token、个人敏感信息。
- 需要删除已有页面。
- 归档会影响正在使用的核心页面。

### 3.3 输出格式

```
写入 wiki/99-temp/lint-{YYYY-MM-DD}.md：
  ## 矛盾
  ## 孤立页
  ## 候选归档
  ## INDEX 健康
  ## Frontmatter 问题
  ## 自动修复记录
  ## 需要 YANG 决策
```

---

## 第 4 章：维护

### 4.1 index.md 维护

- `index.md` 是目录，不是正文库；每页一行：链接 + 一句话摘要 + 必要元数据。
- 新建、归档、重命名页面后必须同步更新。
- 若 `index.md` 标注自动生成，优先运行生成脚本；不能运行时才手动最小改动。
- 目录应保持短、准、可检索；过长时拆分类索引。

### 4.2 log.md 维护

- 根 `log.md` 保留日志入口和规则。
- 具体操作优先写入 `log/{YYYY-MM-DD}.md`；目录不存在时创建。
- 格式：`## [HH:mm:ss] {operation} | {description}`。
- 操作类型：`ingest / query / lint / audit / forget / soul-sync / backfill / maintenance`。

### 4.3 信任系统

- `trust` 表示可依赖程度，不表示重要程度。
- 新事实默认 0.3；来源可靠、反复验证、用户确认后提高。
- 被召回成功且对回答有帮助时提高；被用户纠正或发现冲突时降低。
- `trust < 0.3` 且长期未更新的事实进入候选归档。

### 4.4 知识衰减

```
forget-cycle 规则：
  1. 扫描 wiki/04-facts/ 与候选页
  2. trust<0.3 且 last_updated 超过阈值 → 候选归档
  3. 移入 98-archive/ 或写入归档报告
  4. 更新 index.md
  5. 追加 log.md
```

### 4.5 Audit 与纠错

```
触发：YANG 指出 wiki 页面错误，或 Lint 发现冲突
动作：
  1. 在问题段落插入 [AUDIT YYYY-MM-DD] 说明
  2. 复制或记录到 wiki/99-temp/audit-{date}-{slug}.md
  3. 修复源页面或等待 YANG 决策
  4. 更新 index.md + log.md
```

### 4.6 废弃脚本

| 文件 | 状态 | 替代品 | 备注 |
|------|------|--------|------|
| `cron_jobs/auto-commit.py.disabled` | 已废弃 | `cron_jobs/auto-commit.js` | Node.js 版，修复路径 HERMES_HOME→BRAIN_ROOT |

---

## v4.0 脚本目标

| 脚本 | 功能 | 状态 |
|------|------|------|
| `ingest.js` | raw/ → sources/ → 相关页面 → index/log | 待实现 |
| `auto-retrieve.js` | 用户提问时检索 Wiki top-3 | 待实现 |
| `answer-backfill.js` | 高质量回答回写 Wiki | 待实现 |
| `lint.js` | 检查并支持 `--fix --dry-run` | 待增强 |
| `forget-cycle.js` | 知识衰减与候选归档 | 待实现 |
| `update-trust.js` | 召回反馈更新 trust | 已有，需接入流程 |
