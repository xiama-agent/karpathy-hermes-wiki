---
id: HERMES-YANG-005
title: 桌面与文件管理
type: preference
tags: [yang, paths, files]
trust: 1.0
use_cases: ["桌面路径", "文件放哪", "D 盘", "工作目录"]
source: 01-yang/desktop.md
last_updated: 2026-06-26
---

# 桌面与文件管理

## 核心路径

| 用途 | 路径 |
|------|------|
| 桌面 | `D:\Users\YANG\Desktop\` |
| 文档库 | `D:\文档\数据库总文件夹\` |
| 软件 | `D:\Tools\` |
| TEMP | `D:\Temp\`（用户级） |
| AI 调度 | `D:\ai_schedule\` |
| 大脑（新） | `D:\ai_schedule\hermes-brain\` |

## 桌面规则

- 桌面只留 `.lnk` 快捷方式
- 其他文件**不放桌面**（保持桌面干净）
- 实际文件归 `D:\文档\` 或 `D:\Tools\`

## 文档库结构

```
D:\文档\数据库总文件夹\
├── obsidian\              ← Obsidian 库（小说/自媒体/笔记）
├── 项目工作区\            ← 项目文件
│   └── {项目名}\
└── 自媒体\                ← 自媒体相关
```

> 注：Obsidian 库**不是大脑本身**，是"大脑内的记忆"（如小说素材、自媒体草稿）。大脑本身在 `D:\ai_schedule\hermes-brain\`。

## 工作盘约定

- **D 盘是工作盘**，不放到 C 盘
- 大文件/开发项目/AI 配置全部放 D 盘
- C 盘只装系统

## 相关链接
- [[profile]] — 身份
- [[paths]] — 路径速查完整版
- [[paths-conventions]] — 路径书写规范