---
id: HERMES-IMG-001
title: 文生图能力
type: capability
tags: [image, gen, siliconflow]
use_cases: ["文生图怎么用", "画图", "图片生成"]
source: fact_store#118
trust: 0.95
last_updated: 2026-06-26
---
# 文生图能力

**调用方式**：直接在对话中说需求，我自动调 image_generate 工具

## 配置
- Provider：siliconflow
- 插件路径：C:\Users\YANG\AppData\Local\hermes\plugins\image_gen\siliconflow\
- API：https://api.siliconflow.cn/v1/images/generations
- 认证：GLM_API_KEY

## 支持模型
- **Kolors**（默认）
- Z-Image-Turbo
- ERNIE-Image-Turbo
- Qwen-Image

## 图片保存
`$HERMES_HOME/cache/images/`


