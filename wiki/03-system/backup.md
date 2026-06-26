---
id: HERMES-BAK-001
title: 备份体系
type: config
tags: [system, backup, git]
use_cases: ["数据怎么备份", "备份机制", "恢复方法"]
trust: 0.9
source: AGENTS.md 第 1 章 | 2026-06-26 重构
last_updated: 2026-06-26
---
# 备份体系

## 三副本
| 副本 | 位置 | 更新频率 |
|------|------|---------|
| 主 | `~/.hermes/second-brain/` | 实时 |
| 副1 | `D:\ai_schedule\backups\wiki-YYYYMMDD.tar.gz` | 每日 |
| 副2 | Git（本地仓库） | 每次写入 |

## Git 管理
- Wiki 目录已 git init
- 路径：`~/.hermes/second-brain/.git/`
- 每日 23:00 auto commit

## 写入保护
- 写入前 lint：检查 id 唯一、tag 合法、links 有效、frontmatter YAML 合法
- 补丁模式写入：读旧内容→生成 patch→应用→验证
- 写并发 lock：同一 id 只能一个写者

## 恢复
- git checkout HEAD~1 恢复误删/损坏的文件
- 每日备份保留 30 天滚动



## 相关链接
- [[03-system/cron-jobs]] — 上级/相关页面
