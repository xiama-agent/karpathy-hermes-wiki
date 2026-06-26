---
id: HERMES-SYS-PRIV-001
title: 隐私信息处理策略
type: system
tags: [privacy, policy, system]
trust: 1.0
use_cases: ["手机型号", "账号密码", "IMEI", "个人信息", "隐私"]
source: SOUL.md v3.1.3 + missed-recall-2026-06-26
last_updated: 2026-06-26
---

# 隐私信息处理策略

## 原则
**隐私信息不自动入库**。手机型号、账号、密码、IMEI、序列号、身份证等个人信息不会自动写入 Wiki。

## 触发条件（必须显式确认）
只有满足以下**任一**条件，hermes 才能记录隐私信息：
1. YANG **明确说**"记住我的 XXX" / "把 XXX 记下来"
2. 信息已存在于事实库（fact_store_export.json 的导出值）
3. YANG 在 `private-info-policy.md` 里显式批准

## 不入库的信息类型
- 手机型号 / IMEI / 序列号
- 银行账号 / 支付密码
- 身份证 / 社保号
- 家庭住址精确到门牌号
- 个人社交账号密码
- 任何 YANG 没明确指定记录的"个人隐私"

## 可入库的信息
- 公开技术栈（如 DeepSeek / MiniMax API）
- 公开工作偏好（如写作时间、自媒体平台）
- 已公开的项目状态（如小说进度、GitHub 仓库 URL）
- 路径/工具配置（不涉及密钥）
- 已声明的预算/支出

## 召回失败时的行为
按 AGENTS.md 第 1.3 节：
- 连续 3 次召回失败 → 触发小模型回退
- 记录到 `wiki/99-temp/missed-recall-{date}.md`
- **不要**直接把召回失败当作"用户想让我记录"的信号
- **要**主动询问 YANG："我需要记录这个信息吗？"

## 当前已记录的隐私
（截至 2026-06-26，无隐私信息记录。SOUL.md 第 4 条铁律"绝不代发"已限定账号密码范围。）

## 相关链接
- [[identity]] — 身份宪法
- [[preferences]] — 偏好速查
- SOUL.md（位于 `C:\Users\YANG\AppData\Local\hermes\SOUL.md`）— 完整宪法

## 紧急删除流程
如果隐私信息**误入库**：
```bash
# 1. 找到包含敏感信息的页面
grep -rli "{敏感关键词}" D:\ai_schedule\hermes-brain\wiki\

# 2. 编辑页面删除敏感字段
# 3. 立即 git commit 删除历史
cd D:\ai_schedule\hermes-brain; git add -A; git commit -m "SECURITY: remove {key}"

# 4. 通知 YANG 确认
```