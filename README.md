# Hermes Brain — 第二大脑架构说明

> 路径：`D:\ai_schedule\hermes-brain\`
> 宪法：`C:\Users\YANG\AppData\Local\hermes\SOUL.md`
> 操作手册：`AGENTS.md`（同目录，必须照做）
> 备份：`D:\ai_schedule\backup\`
> 版本：v2.0（2026-06-26 重建）

---

## 一句话定位

**这是一个由 LLM 持续维护、互相链接、不断编译的 Markdown Wiki，是龙虾唯一的记忆后端。**

不是 Notion 的 AI 插件，不是向量数据库的另一种包装。是一种**复利式**的知识积累范式——你往里投一份资料、提一个好问题，整个知识库都会变得稍微更聪明一点。

---

## 三层架构（karpathy 范式）

```
Layer 1: raw/        只读原始资料，你放进去，AI 只读不改
Layer 2: wiki/       AI 维护的页面（摘要/实体/概念/对比），互相 [[wiki-link]]
Layer 3: schema/     AGENTS.md，告诉 AI 怎么干活（机械指令，不要哲学）
```

每一层职责严格分离。raw 是只读真相源，wiki 是 LLM 的产物，AGENTS.md 是规则集。

---

## 五大核心操作（机械指令详见 AGENTS.md）

| 操作 | 触发 | 写入 | 何时用 |
|------|------|------|--------|
| **Ingest** | 新资料放进 raw/ | 在 wiki/ 新建/更新相关页面，更新 index.md，追加 log.md | 你丢了一份新资料 |
| **Query** | 你提问 | 读 wiki + 回答（必要时把好答案写回 wiki 作为新页） | 你问任何问题 |
| **Lint** | 每周一次（cron 自动跑） | 检查矛盾/孤立页/缺失引用，写入 `wiki/99-temp/lint-{date}.md` | 周末体检 |
| **Audit** | 你读 wiki 时发现错误 | 在 `wiki/99-temp/audit-{date}.md` 写纠错记录，下次 Ingest 时处理 | 你看到错的页面 |
| **Forget** | Lint 发现过期事实（>14天未用 + trust<0.3） | 移入 `wiki/99-temp/archived-{date}.md`，不删除 | 自动维护 |

---

## 数据流（取代旧三管道）

```
旧:  memory（注入 prompt） ←→ fact_store（向量） ←→ second-brain（手动）
新:  Wiki INDEX（注入 prompt ≤800字） → 召回具体页面 → 写回页面
```

**单一来源**：Wiki 是唯一真相。memory 缩成一个 INDEX 指针（指向 wiki 分类），fact_store 实体化到 `wiki/04-facts/`。

---

## 与 SOUL.md 的关系

- **SOUL.md 是宪法**：身份、管家担当、绝不代发、预算敏感等不可变规则
- **AGENTS.md 是操作手册**：怎么读写 wiki 的具体流程
- **wiki 是大脑**：所有事实/偏好/路径/规则的可维护知识
- 三者铁三角：宪法定义边界，操作手册定义流程，wiki 装具体内容

**修改优先级**：SOUL.md > AGENTS.md > wiki 任何页面
**写入优先级**：你手动说 > 宪法级自动 > 日常对话

---

## 回滚

如果新系统出问题：
```powershell
# 完全回滚到 Wiki 重建前的状态
Copy-Item "D:\ai_schedule\backup\hermes-pre-wiki-rebuild-20260626-124508\live-hermes\*" "C:\Users\YANG\AppData\Local\hermes\" -Recurse -Force
```

3 天灰度期内如果命中率 < 80%，自动回滚（cron 监控）。