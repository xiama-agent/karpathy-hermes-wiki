---
id: HERMES-SEM-001
title: 语义记忆系统
type: reference
tags: [semantic, memory, embedding]
use_cases: ["语义记忆", "本地嵌入", "向量搜索"]
source: fact_store#149, #150
trust: 0.9
last_updated: 2026-06-26
---
# 语义记忆系统

- **路径**：`C:\Users\YANG\.hermes\semantic_memory.py`
- **模型**：fastembed + BAAI/bge-small-en-v1.5（384维，ONNX离线免费）
- **存储**：sqlite-vec向量库
- **命令**：`python semantic_memory.py <retain|recall|promote|list|stats|check>`
- **首次调用**：自动下载模型（需hf-mirror.com）
- **DB路径**：`~/.hermes/semantic_memory.db`



## 相关链接
- [[02-knowledge/paths]] — 上级/相关页面
- [[02-knowledge/persistent-memory-tool-selection]] — 持久化记忆与工具选择指南
- [[02-knowledge/ai-schedule]] — AI 调度系统
