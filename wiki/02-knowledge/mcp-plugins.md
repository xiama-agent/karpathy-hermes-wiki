---
id: HERMES-MCP-001
title: MCP + 插件系统
type: reference
tags: [mcp, plugins, extension]
use_cases: ["MCP怎么用", "插件怎么装", "hermes mcp", "hermes plugins"]
source: fact_store#154-162
trust: 0.95
last_updated: 2026-06-26
---
# MCP + 插件系统

## MCP
- `hermes mcp catalog` 查看精选MCP目录
- `hermes mcp install <name>` 一键安装
- 已装：n8n桥（待n8n实例就绪）
- MCP工具前缀：`mcp__<server>__<tool>`

## 插件
- `hermes plugins enable <name>` 启用
- 已启用：`disk-cleanup`（自动清理临时文件）、`web-ddgs`（DuckDuckGo搜索）
- 更多插件用 `hermes plugins list` 查看

## agentskills.io
- 开放的AI Agent技能市场，Hermes兼容
- SKILL.md格式，可社区共享



## 相关链接
- [[03-system/disk-cleanup]] — disk-cleanup 插件
