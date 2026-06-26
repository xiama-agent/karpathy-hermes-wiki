---
id: HERMES-VIS-001
title: 视觉与OCR能力
type: capability
tags: [vision, ocr, mimo]
use_cases: ["看图", "OCR", "图片内容提取"]
source: fact_store#22, #70, #69
related_skill: software-development/hermes-vision-capabilities
trust: 0.95
last_updated: 2026-06-26
---
# 视觉与OCR

## 看图（MiMo CLI）
`npx @mimo-ai/cli run "描述" -f <路径>`
- MIMO_API_KEY 在 .env
- DeepSeek Flash 不支持图片输入

## OCR 文字提取
- PaddleOCR（优先，已装）
- OCR脚本：`python D:\Tools\HermesScripts\ocr.py`
- EasyOCR 有冲突待修，Tesseract 未装

## 文档图片
- MarkItDown 支持图片OCR转文字
- 在 Hermes venv 中可用



## 相关链接
- [[02-knowledge/tools-overview]] — 上级/相关页面
