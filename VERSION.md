# 龙虾记忆系统 v1.0

> 发布日：2026-06-27
> 架构：Karpathy LLM Wiki（SOUL.md → AGENTS.md → Wiki）
> 引擎：Hermes Agent + DeepSeek V4 Flash
> 平台：Windows 10

---

## 架构概览

```
hermes-brain/                      ← 大脑根目录
├── SOUL.md                        ← 宪法（身份定义 + 硬规则）
├── AGENTS.md                      ← 操作手册（Ingest/Recall/Lint 流程）
├── IRON_RULES.md + RUNTIME.md     ← 运行时铁律
├── index.md                       ← 自动注入目录
├── VERSION.md                     ← 本文件
│
├── wiki/                          ← 知识本体
│   ├── 00-core/    宪法层         ← 铁律、身份、偏好、触发规则
│   ├── 01-yang/    用户层         ← 用户档案、项目、预算、分身
│   ├── 02-knowledge/ 知识层       ← 33 页领域知识
│   ├── 03-system/  系统层         ← 架构审计、定时任务、运维
│   ├── 04-facts/   事实层         ← 精炼事实索引
│   └── 98-archive/ 归档层         ← 历史记录
│
├── schema/         约束层         ← 信任分标准
├── raw/            原始材料层     ← .processed 原始输入
├── log/            运行日志       ← 每日操作日志
└── tools/          工具集         ← 辅助脚本
```

## 核心特性

| 特性 | 说明 |
|:----|:-----|
| **宪法驱动** | SOUL.md 定义不可违背的 9 条身份宪法 + 8 条操作铁律 |
| **三层记忆** | Raw（原始）→ Wiki（可维护知识）→ Schema（结构化约束） |
| **Topic-Gate** | 每次回复声明引用的 Wiki 页面，防止幻觉 |
| **信任分系统** | 每页 frontmatter 的 trust 值决定回答可信度 |
| **自助运维** | 23 个 Node.js 脚本覆盖 Ingest/Recall/Lint/Backup/RSI 全链路 |
| **Git 版本控制** | 每次修改先 commit，确保可回滚 |
| **多 AI 调度** | 龙虾（管家）+ Mavis（执行手）协议协作 |

## 运维脚本一览

| 脚本 | 作用 |
|:----|:-----|
| `ingest.js` | 摄入原始材料 → Wiki 页面 |
| `recall.js` | 语义召回 |
| `lint.js` | 全量检查：死链、孤儿页、信任分覆盖率 |
| `forget-cycle.js` | 遗忘周期：清理过期内容 |
| `update-trust.js` | 更新页面信任分 |
| `rsi-log.js` | 记录工具失败根因 |
| `session-summary.js` | 会话结束写摘要 |
| `backup-verify.js` | 验证备份完整性 |
| `fix-dead-links.js` | 修复死链接 |
| `fix-orphans.js` | 修复孤儿页 |

## 信任分统计（发布时）

| 层级 | 覆盖率 |
|:----|:------:|
| 00-core | 100% |
| 01-yang | 100% |
| 02-knowledge | 100% |
| 03-system | 100% |
| 04-facts | 100% |
| **总计** | **92%+** |

## 变更历史

### v1.0 (2026-06-27)
- 首次发布
- Karpathy 三层架构（raw/wiki/schema）全面运行
- 8 条操作铁律定稿
- 43 个 99-temp 候选清理完毕
- 64 条旧 fact_store 事实提纯归档
- core-iron-laws.md 从占位草稿重构为正式铁律页
