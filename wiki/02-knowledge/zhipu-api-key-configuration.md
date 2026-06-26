---
id: API_KEY_CONFIGURATION_GUIDE_20260626
title: 智谱AI API Key配置指南
type: knowledge
tags: [api, configuration, zhipu-ai, hermes-setup]
trust: 0.3
use_cases: ["配置智谱AI API Key", "Hermes新provider设置", "智谱4.7模型选择"]
source: 回忆录候选 | 2026-06-26
last_updated: 2026-06-26
---

# 智谱AI API Key配置指南

> Auto-extracted by transform hook, awaiting Mavis/knowledge-extractor cron to consolidate.

## 1. 配置要求

**按次收费项目的 API Key** 需要配成 Hermes 的一个新 provider。

## 2. 手动编辑 .env（安全限制，不能用 read_file/patch）

注意：手动修改环境变量文件时需要遵守安全限制。

## 3. 关键问题

需要确认以下关键配置信息：

## 4. API Key位置确认

- 需要知道**按次收费项目的 API Key** 的具体位置
- 如果没有，需要去智谱控制台获取新的API Key

## 5. 智谱4.7模型名称确认

需要确认智谱4.7的正确模型名称：
- 是 `glm-4-plus` 吗？
- 还是其他名称？

## 下一步行动

1. 确认API Key的具体位置或重新获取
2. 确认智谱4.7的正确模型名称
3. 按照 Hermes provider 配置规范进行设置

## 相关链接
- [[02-knowledge/paths]] — 上级/相关页面
