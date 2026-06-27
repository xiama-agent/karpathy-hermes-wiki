---
id: HERMES-PATH-CONV-001
title: 路径约定
type: knowledge
tags: [hermes, paths, conventions, system]
created: 2026-06-26
use_cases:
  - "新脚本怎么写路径"
  - "HERMES_HOME 到底是哪个目录"
  - "为什么 ~/.hermes/ 还有东西"
  - "路径出错了怎么排查"
trust: 1
source: AGENTS.md 第 1 章 | 2026-06-26 重构
last_updated: 2026-06-26
---
# 路径约定

## 一句话

> **HERMES_HOME = `%LOCALAPPDATA%/hermes/`** (即 `C:\Users\<用户>\AppData\Local\hermes\`)
>
> 所有运行时文件、脚本、cron、数据库、plugin 都在这里。
> `~/.hermes/` **不是** HERMES_HOME，只放遗留系统。

---

## 目录结构

```text
%LOCALAPPDATA%/hermes/                  ← HERMES_HOME (运行根目录)
├── logs/                                ← 日志
├── plugins/                             ← Hermes 插件
│   └── topic-gate/
├── skills/                              ← Hermes skill
├── profiles/                            ← 分身配置
├── state.db                             ← 会话数据库
└── SOUL.md                              ← 龙虾宪法
(注: v3.1.5 后 memory_store.db.legacy 已删除, 04-facts 接管语义记忆)

D:\ai_schedule\hermes-brain\             ← BRAIN_ROOT (大脑本体)
├── index.md                             ← 注入索引（每轮注入）
├── AGENTS.md                            ← 操作手册
├── recall.js                            ← 召回入口
├── lint.js                              ← 健康检查
├── fix-dead-links.js                    ← 死链修复
├── fix-orphans.js                       ← 孤立页修复
├── fix-trust.js                         ← trust 修复
├── activate-trust.js                    ← trust 激活
├── regenerate-user-pref.js              ← 用户偏好重建
├── wiki-link-builder.js                 ← 链接构建
├── log.md                               ← 操作日志
├── wiki/                                ← Wiki 主区
│   ├── 00-core/                         ← 核心（身份/偏好/触发）
│   ├── 01-yang/                         ← 关于 YANG
│   ├── 02-knowledge/                    ← 工具/MCP/技能
│   ├── 03-system/                       ← 系统配置/cron
│   ├── 04-facts/                        ← 事实聚合
│   └── 99-temp/                         ← 临时/审计/隔离
└── raw/                                 ← 原始资料
```

---

## 脚本路径书写规范

### 推荐：引用 `hermes_constants.py`

```python
from hermes_constants import HERMES_HOME, WIKI_DIR, CRON_JOBS_DIR
```

适合所有 `scripts/` `cron_jobs/` `tests/` 下的脚本。

### 备选：动态推导（单文件时用）

```python
from pathlib import Path
HERMES_HOME = Path(__file__).resolve().parent.parent
```

前提：脚本在 `scripts/` 或 `cron_jobs/` 或 `tests/` 内。
`.parent.parent` = 脚本所在目录的父目录的父目录 = HERMES_HOME。

### 硬编码绝对路径（❌ 禁止）

```python
# ❌ 禁止 — 不同用户路径不同，改一次全崩
HERMES_HOME = Path(r"C:\Users\YANG\AppData\Local\hermes")
```

### 例外：Windows 定时任务 (.bat / .ps1)

schtasks 注册 cron 必须用绝对路径（Windows 限制），这些文件允许保留绝对路径。
每行加注释 `# schtasks requires absolute path` 做标记。

---

## 遗留系统: ~/.hermes/

`~/.hermes/` **不是**运行根目录，仅保留以下三类文件：

| 路径 | 内容 | 说明 |
|---|---|---|
| `~/.hermes/semantic_memory.py` | vec0 语义记忆系统 | 旧的语义检索，不迁移 |
| `~/.hermes/semantic_memory.db` | vec0 数据库 | 同上 |
| `~/.hermes/desktop-attachments/` | 用户桌面附件 | 用户数据，不动 |
| `~/.hermes/.archive/` | 历史备份 | 已归档的老版本 cron_jobs/scripts/tests |

**规则**: 新脚本不读不写 `~/.hermes/` 下的路径。需要引用 vec0 时，通过配置传参。

---

## 排查路径问题

1. `python -c "from pathlib import Path; print(Path.home())"` → 确认用户目录
2. `python -c "from hermes_constants import HERMES_HOME; print(HERMES_HOME)"` → 确认 HERMES_HOME
3. 路径出错的脚本 → 检查是 `Path(__file__)` 推导还是硬编码
4. grep 全局搜硬编码: `grep -rn "C:.*Users.*hermes" scripts/ cron_jobs/ tests/` → 标记可改的



## 相关链接
- [[02-knowledge/paths|paths]] — 关键路径速查
- [[02-knowledge/path-validation-iron-rule|path-validation-iron-rule]] — 路径验证铁律
