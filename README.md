# 🦞 龙虾 · AI 智能体记忆系统

**一个完整个体级 AI 智能体的"大脑"——宪法、知识、操作手册三位一体。**

这不是一套提示词模板，不是一条 API 包装，而是一个**完整可运行的 AI 智能体记忆架构**，基于 Karpathy LLM Wiki 范式 + Hermes Agent 引擎。

---

## 它能做什么？

| 场景 | 说明 |
|:----|:-----|
| ✅ **你的专属 AI 管家** | 一个知道你偏好、项目、路径的 AI——不每次推倒重来 |
| ✅ **多 AI 调度** | 龙虾（管家）+ Mavis（执行手）分工协作 |
| ✅ **知识自动运维** | 写 → 查 → 检查 → 遗忘，全自动闭环 |
| ✅ **开源生态兼容** | 运行在 Hermes Agent 上，可安装 94,000+ 社区技能 |
| ✅ **出口即内容** | 搭建过程本身就是 AI 赛道的高价值内容素材 |

---

## 快速开始

```bash
# 1. 克隆
git clone https://github.com/YOUR_USERNAME/hermes-brain.git

# 2. 放到 Hermes Agent 的 SOUL.md 旁
# 本仓库就是 C:\Users\YANG\AppData\Local\hermes\ 的邻居

# 3. 配好 AGENTS.md 中的关键路径

# 4. 首次初始化
node lint.js          # 全量检查
node ingest.js        # 摄入材料
node update-trust.js  # 初始化信任分
```

> 完整搭建教程见 [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)（待创建）

---

## 项目结构

```
hermes-brain/
├── SOUL.md               ← 宪法：AI 的身份定义 + 9 条硬规则
├── AGENTS.md             ← 操作手册：怎么读、写、维护 Wiki
├── IRON_RULES.md         ← 7 条运行时铁律
├── RUNTIME.md            ← 11 条运行时指令
├── VERSION.md            ← 版本声明
├── index.md              ← 自动注入目录（每轮对话读这个）
│
├── wiki/                 ← 知识本体（1.1M）
│   ├── 00-core/          ← 宪法层：铁律、身份、偏好、触发规则
│   ├── 01-yang/          ← 用户层：档案、项目、预算
│   ├── 02-knowledge/     ← 知识层：33 页领域知识
│   ├── 03-system/        ← 系统层：架构审计、定时任务、运维
│   ├── 04-facts/         ← 事实层：精炼事实索引
│   └── 98-archive/       ← 归档
│
├── schema/               ← 约束层：信任分规范
├── raw/                  ← 原始材料
├── log/                  ← 运行日志
├── tools/                ← 辅助脚本
│
├── ingest.js             ← 材料摄入
├── recall.js             ← 语义召回
├── lint.js               ← 全量检查
├── forget-cycle.js       ← 遗忘周期
└── ...（共 23 个运维脚本）
```

---

## 核心架构：Karpathy 三层

```
Raw Layer（原始）          Schema Layer（约束）
    │                           │
    ├──→ Ingest ←──────────────┤
    │                           │
    ▼                           ▼
Wiki Layer（可维护知识）
    │
    ├── 00-core   宪法层（不可变）
    ├── 01-yang   用户层（半可变）
    ├── 02-knowledge 知识层（可变）
    ├── 03-system 系统层（运维状态）
    ├── 04-facts  事实层（快照）
    └── 98-archive 归档层
```

---

## 许可证

本项目采用 [AGPL v3](LICENSE) 许可证。个人使用免费，商业使用请联系作者。

---

## 关于作者

龙虾（Lobster）是 YANG 的 AI 管家，这个仓库是它的"大脑"。
