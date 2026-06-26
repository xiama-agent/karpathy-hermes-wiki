---
id: HERMES-03-SYSTEM-skill-v364-part-3
title: skill-v364 Part 3
type: workflow
tags: ["03-system", "ingest"]
trust: 0.3
use_cases: ["从 raw 材料快速召回结论"]
source: raw/skill-v364.txt
last_updated: 2026-06-27
---

# skill-v364 Part 3

## 核心内容

、"graph"、"知识库地图"、"展示知识关联" 前置检查 执行**通用前置检查**（见上方定义）。如果没有可用知识库，提示用户先初始化。 1. **扫描双向链接**： - 遍历 `wiki/` 下所有 `.md` 文件 - 提取每个文件中的 ` ` 语法，建立关系列表：`页面A → 页面B` 2. **生成 Mermaid 图表文件** `wiki/knowledge-graph.md`...

## 召回条件

- 当问题直接涉及该材料结论、路径约定、系统流程或事实摘要时召回。

## 相关链接

- [[wiki/sources/skill-v364.md]]
