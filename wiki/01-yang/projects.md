---
id: HERMES-YANG-004
title: YANG 项目清单
type: project
tags: [yang, projects]
trust: 0.9
use_cases: ["YANG 在做什么项目", "当前项目", "诸天聊天群", "神明死尽"]
source: 01-yang/projects.md + fact_store
last_updated: 2026-06-26
---

# YANG 项目清单

## 1. 诸天聊天群 → AI 智能体社区 App
- **形态**：Android App，纯文本聊天
- **技术栈**：Vite + React + TS + Capacitor
- **AI**：群聊串行，智能体有性格差异
- **状态**：设计讨论中

## 2. 小说《当神明死尽》（暂名）
- **平台**：番茄
- **类型**：末日异能高武混搭风
- **风格**：主角大二白板工具人底色、不圣母、有仇必报
- **协作方式**：一问一答设计，不替他决定
- **存储**：所有设定/大纲在 Obsidian，不存 memory
- **方法论**：高潮反推 + 20 章单元 + 期待感衔接

## 3. 龙的天空教学帖归档
- 从 lkong.com 抓取网文教学帖
- 存 Obsidian 按作者分文件夹
- 已抓 96 篇
- 筛选排除：吹水/收入/闲聊帖
- 完整性要求：原文一字不漏

## 4. 英语题库 App（已完成）
- Capacitor 8 Android 打包
- 四步流程：tsc → vite build → cap sync → gradle assembleRelease

## 5. AI 调度系统 ai-schedule（进行中）
- 多 AI 协作：龙虾（管家）+ Mavis（执行手）
- 路径：`D:\ai_schedule\`
- 当前重构中

## 6. Hermes 记忆系统重建（当前）
- 把四层系统（SOUL/memory/skills/Harness）整合为 Wiki 唯一记忆后端
- 路径：`D:\ai_schedule\hermes-brain\`

## 相关链接
- [[profile]] — 身份
- [[apk-build]] — APK 打包流程
- [[novel-rules]] — 小说创作规则
- [[ai-schedule]] — AI 调度系统