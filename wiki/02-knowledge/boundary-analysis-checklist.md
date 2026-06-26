---
id: BOUNDARY_ANALYSIS_GUIDE_20260626
title: 边界分析检查清单
type: workflow
tags: [boundary-analysis, system-design, consistency-check, governance]
trust: 0.3
use_cases: ["系统边界检查", "规则冲突检测", "流程一致性验证", "新规则引入前评估"]
source: 回忆录候选 | 2026-06-26
last_updated: 2026-06-26
---

# 边界分析检查清单

> Auto-extracted by transform hook, awaiting Mavis/knowledge-extractor cron to consolidate.

## 边界分析检查清单

当定义新边界或修改现有规则时，需要检查以下两个方面：

### 1. 新问题冒出来没

在边界明确之后，需要检查：

#### SOUL.md 和 AGENTS.md 矛盾点
- 检查核心身份(SOUL.md)与代理行为指南(AGENTS.md)之间是否存在新矛盾
- 确保新增的边界与现有定义一致

#### 铁律与流程冲突检查
- 铁律立了之后，需要检查是否与现有流程有冲突
- 特别关注跨功能流程中的边界交互
- 验证新规则是否会导致执行路径中断

### 2. 一致性验证

#### 文档一致性
- [ ] SOUL.md 核心规则无冲突
- [ ] AGENTS.md 行为指南与边界兼容
- [ ] 所有工作流程尊重新边界
- [ ] 权限分配符合边界定义

#### 执行一致性
- [ ] 现有任务是否受新边界影响
- [ ] 哪些流程需要调整
- [ ] 是否需要引入新的例外处理机制

### 3. 风险评估

#### 潜在冲突
- 功能重叠区域
- 权限模糊地带
- 用户期望vs系统限制

#### 缓解措施
- 明确例外处理流程
- 建立边界冲突报告机制
- 设置定期边界评审

## 使用场景

- 系统升级前检查
- 新功能引入评估
- 用户反馈处理
- 系统架构变更

## 相关链接
- [[00-core/triggers]] — 上级/相关页面
