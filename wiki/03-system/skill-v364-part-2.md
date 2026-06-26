---
id: HERMES-03-SYSTEM-skill-v364-part-2
title: skill-v364 Part 2
type: workflow
tags: ["03-system", "ingest"]
trust: 0.3
use_cases: ["从 raw 材料快速召回结论"]
source: raw/skill-v364.txt
last_updated: 2026-06-27
---

# skill-v364 Part 2

## 核心内容

只读取 Step 1 中 `new_vs_existing.updates` 列出的已有页面；如果某页超过 2000 字，只读取 frontmatter + 需要更新的章节 - 输出：所有需要创建或更新的 wiki 页面内容 - Step 2 负责完成原流程中的素材摘要、实体页、主题页、index、log 更新 7. **容错回退**： - 如果 Step 1 不是有效 JSON，或者缺少 ...

## 召回条件

- 当问题直接涉及该材料结论、路径约定、系统流程或事实摘要时召回。

## 相关链接

- [[wiki/sources/skill-v364.md]]
