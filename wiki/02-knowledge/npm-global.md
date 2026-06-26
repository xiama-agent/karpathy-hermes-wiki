---
id: HERMES-TOOLS-NPM-001
title: npm 全局工具清单
type: reference
tags: [tools, npm, paths, global-install]
trust: 0.95
use_cases: ["npm 全局工具", "D:\\Tools\\npm-global\\", "已装工具"]
source: tools-overview.md + fact_store
last_updated: 2026-06-26
---

# npm 全局工具清单

## 安装位置
`D:\Tools\npm-global\`（YANG 的 npm prefix 配置路径）

## 已装工具（截至 2026-06-26）

| 工具 | 用途 | 验证方式 |
|------|------|---------|
| **codegraph** | 代码图谱分析 | `codegraph --help` |
| **mimo-cli** | 看图 / 代码审查 | `mimo --help` |
| **agent-browser** | 浏览器自动化 | `agent-browser --help` |
| **reasonix** | 双通道推理 CLI | `reasonix --help` |
| **repomix** | 打包代码给 AI 分析 | `repomix --help` |
| **tokscale** | token 消耗监控 | `tokscale --help` |
| **bb-browser** | 登录态浏览器 | `bb-browser --help` |

## 已知未装但常用
- `qmd`（karpathy 推荐的本地 Markdown 搜索引擎）— 30+ 页规模暂不需要
- `cognee`（自托管知识图谱引擎）— 见 wiki 计划
- `karpathy-llm-wiki-vault` — 见 wiki 计划

## 重新安装命令
```bash
# 全部重装（如系统重装后）
npm install -g codegraph @mimo-ai/cli agent-browser reasonix repomix tokscale bb-browser
```

## 验证脚本
```bash
# 看哪些 npm 全局工具已装
npm list -g --depth=0
```

## 相关链接
- [[tools-overview]] — 工具总览
- [[paths]] — 路径速查
- [[bb-browser]] — bb-browser 详细文档
- [[reasonix]] — Reasonix 详细文档
- [[image-gen]] — mimo-cli 用于看图