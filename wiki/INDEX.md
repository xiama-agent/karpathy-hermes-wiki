---
id: HERMES-INDEX
title: Wiki 索引
type: index
tags: ["wiki"]
trust: 0.3
source: lint-fix
last_updated: 2026-06-28
---

# Wiki 索引

卡帕西第二大脑。三层架构：raw → wiki → schema。本索引只列 `wiki/` 下的活跃知识区，`98-archive/` 和内页不列举。

---

## 00-core / 核心规则

大脑运行的核心规则、触发条件、结构定义。

| 页面 | 一句话 |
|------|--------|
| `00-core/triggers.md` | 自动触发规则全集（5+工具调用、改代码、写wiki、工具失败等） |

---

## 01-yang / 你的信息

你的个人配置、设备、偏好等。不自动写入，由你指定。

| 页面 | 一句话 |
|------|--------|
| `01-yang/budget.md` | 预算规则 |
| `01-yang/communication.md` | 沟通偏好 |
| `01-yang/desktop.md` | 桌面环境信息 |
| `01-yang/profile.md` | 个人资料 |
| `01-yang/projects.md` | 项目列表 |

---

## 02-knowledge / 知识库

方法论、技术知识、操作指南。这是最活跃的知识区。

| 页面 | 一句话 |
|------|--------|
|| `02-knowledge/agent-routing.md` | 智能体路由规则与Claude区分 |
|| `02-knowledge/ai-schedule.md` | AI 调度系统和多智能体协议 |
| `02-knowledge/aliyun.md` | 阿里云相关配置 |
| `02-knowledge/apk-build.md` | APK 打包流程 |
| `02-knowledge/bb-browser.md` | bb-browser 使用说明 |
| `02-knowledge/boundary-analysis-checklist.md` | 边界分析清单 |
| `02-knowledge/capability-reference.md` | 龙虾能力参考手册 |
| `02-knowledge/lobang-agent-complete.md` | 龙虾完整能力手册 |
| `02-knowledge/paths.md` | 路径映射（强制引用） |
| `02-knowledge/paths-conventions.md` | 路径命名约定 |
| `02-knowledge/software-dev-closed-loop.md` | 软件开发闭环方法论 |
|| `02-knowledge/tools-overview.md` | 工具总览 |
|| `02-knowledge/vision-ocr.md` | 视觉与OCR能力（MiMo看图、OCR文字提取） |
|| `02-knowledge/writing-plans.md` | 写作计划方法 |

---

## 03-system / 系统配置

系统级配置、日志、监控。

| 页面 | 一句话 |
|------|--------|
| `03-system/config-log.md` | 配置变更日志 |
| `03-system/system-startup.md` | 系统启动流程 |

---

## 04-facts / 事实页

可验证的静态事实，变更时需更新 trust 等级。

| 页面 | 一句话 |
|------|--------|
| `04-facts/` | （7 页，具体内容按需查阅） |

---

## 98-archive / 归档

不再活跃的历史数据。当前包含：
- `session-log/` — 177 个历史会话日志（从 01-yang 迁入，安全保留）
- 其他历史知识页（逐步整理中）

---

## sources / 原始材料

> 当前为空。架构中的 raw 层，用于回溯验证一次提炼前的原始内容。

---

## 99-temp / 临时区

> 当前为空。候选知识/技能萃取的暂存区，lint 后升级或删除。

## 相关链接
- [[wiki/INDEX.md]]
