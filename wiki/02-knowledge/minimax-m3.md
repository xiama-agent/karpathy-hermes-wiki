---
id: HERMES-M3-001
title: MiniMax M3 集成
type: reference
tags: [minimax, m3, api, coding]
use_cases: ["怎么调MiniMax", "MiniMax M3怎么用", "编程调用"]
source: fact_store#65, #179, #177
trust: 0.95
last_updated: 2026-06-26
---
# MiniMax M3 集成

## 调用方式
- **API**：`curl https://api.minimax.chat/v1/chat/completions`
- **模型**：`MiniMax-M3`
- **Key**：从 `C:\Users\YANG\AppData\Roaming\reasonix\.env` 读 `MINIMAX_API_KEY`
- **加载key**：`source /c/Users/YANG/AppData/Roaming/reasonix/.env`

## 用途
编程写脚本/重构/抓数据/修Bug。我不直接写代码，只统筹，调M3执行。

## 预算
- MiniMax Token Plan Plus ¥49/月
- 日均可调1000+次

## 注意
- mmx-cli(1.0.16) 区域验证失败不可用
- 只用 curl 直连
- 支持 web_search 参数（联网搜索）



## 相关链接
- [[02-knowledge/tools-overview]] — 上级/相关页面
- [[02-knowledge/model-capabilities-comparison]] — AI 模型能力对比
- [[02-knowledge/model-json-structure]] — model.json 配置结构说明
- [[02-knowledge/reasonix]] — Reasonix 桌面客户端
