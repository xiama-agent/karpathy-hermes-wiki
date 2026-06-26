# 综合修复执行计划 — v3.1.3

> 生成时间：2026-06-26
> 触发：YANG 要求"把一切问题、隐患、BUG、任务问题都修复"
> 来源：龙虾派发任务 + Mavis 自检 + 用户对话暴露的隐患
> 目标：今晚 23:59 之前完成所有可执行项

---

## 总览：14 个修复项

| # | ID | 类型 | 严重度 | 描述 | 状态 |
|---|----|------|--------|------|------|
| 1 | EXEC | 元 | — | 写本计划 | 🔄 进行中 |
| 2 | BUG-1 | BUG | HIGH | 建 npm-global.md | ⏳ 待执行 |
| 3 | BUG-2 | BUG | HIGH | SOUL.md 加路径召回硬规则 | ⏳ 待执行 |
| 4 | BUG-3 | BUG | HIGH | topic-gate plugin 名字一致性 | ⏳ 待执行 |
| 5 | BUG-4 | BUG | MEDIUM | 加 daily log 自动创建 cron | ⏳ 待执行 |
| 6 | BUG-5 | BUG | MEDIUM | recall.js 中文分词 | ⏳ 待执行 |
| 7 | BUG-6 | BUG | MEDIUM | AGENTS.md 加 wiki 命名规范 | ⏳ 待执行 |
| 8 | BUG-7 | BUG | MEDIUM | missed-recall 自动升级 | ⏳ 待执行 |
| 9 | OPT-1 | OPT | LOW | 清理过时临时脚本 | ⏳ 待执行 |
| 10 | OPT-2 | OPT | LOW | 隐私信息警告页 | ⏳ 待执行 |
| 11 | OPT-3 | OPT | LOW | frontmatter 必填校验 | ⏳ 待执行 |
| 12 | OPT-4 | OPT | LOW | 自动备份脚本 | ⏳ 待执行 |
| 13 | BLOCK | 阻塞 | HIGH | 重启 hermes 验证 INDEX 注入 | 🛑 需 YANG 配合 |
| 14 | COMMIT | 元 | — | v3.1.3 git commit + zip | ⏳ 待执行 |

---

## 详细执行计划

### 🔴 HIGH 优先级（必须完成）

#### BUG-1: 建 npm-global.md
- **位置**: `wiki/02-knowledge/npm-global.md`
- **来源**: 召回失败 Q5（"YANG 装了哪几个 npm 全局工具？"）+ missed-recall-2026-06-26.md
- **内容**: tools-overview.md 里提到的 npm 全局工具集中列出
- **来源数据**: `C:\Users\YANG\AppData\Local\hermes\tools-overview.md` + tools-overview.md
- **验收**: `node recall.js "npm global"` 召回至少 1 个页面

#### BUG-2: SOUL.md 加硬规则
- **改动**: 在 SOUL.md 身份宪法后追加"路径召回规则"
- **建议内容**:
  ```
  ## 路径召回规则（v3.1.3 新增）
  - 任何路径相关问题，必须读 `wiki/02-knowledge/paths.md` 和 `paths-conventions.md`
  - 不得凭印象给出路径，必须基于 wiki 内容
  - 路径不存在时主动说"我需要验证"，不编造
  ```
- **验收**: hermes 回答路径问题时会引用 paths.md

#### BUG-3: topic-gate plugin 名字一致性
- **问题**: config.yaml `disabled: [topic-gate]` 但 `enabled: [topic_gate, ...]`，带连字符 vs 下划线
- **修复**: 查 hermes 实际识别的 plugin 名字，统一
- **路径**: `C:\Users\YANG\AppData\Local\hermes\config.yaml`
- **验收**: schtasks / plugin loader 不报 plugin 名冲突

---

### 🟡 MEDIUM 优先级（应该完成）

#### BUG-4: daily log 自动创建 cron
- **脚本**: `hermes-wiki-logrotate.ps1`
- **功能**: 每天 00:00 创建 `log/{YYYY-MM-DD}.md`（如果不存在）
- **注册**: schtasks /Create /TN "Hermes Wiki Log Init" /SC DAILY /ST 00:00:00
- **验收**: cron 日志显示每天 00:00 success

#### BUG-5: recall.js 中文双字词分词
- **问题**: 中文短查询"D 盘路径"召回失败（单字符匹配问题）
- **修复**: 把查询字符串切成 2-字 bigram 集合，每个 bigram 都尝试匹配
- **代码**: 修改 `recall.js` 的 `searchInFile` 函数
- **验收**: `node recall.js "D 盘路径"` 召回至少 1 个页面

#### BUG-6: AGENTS.md 加 wiki 命名规范
- **位置**: AGENTS.md 新增"第 9 章: Wiki 命名规范"
- **内容**:
  - 文件名小写 + 连字符（例：`night-lock.md`）
  - 类别前缀：00/01/02/03/04/99
  - 严禁名字带 `[[]]` 这种歧义字符
  - `wiki-link` 这类名字是反例
- **验收**: AGENTS.md 包含命名规范章节

#### BUG-7: missed-recall 自动升级机制
- **机制**: 在 lint.js 加一个检查
- **逻辑**: 如果 `wiki/99-temp/missed-recall-*.md` 文件存在超过 14 天且同月内被引用 3+ 次 → 在 lint 报告里建议升级
- **验收**: lint.js 输出包含"missed-recall 升级建议"

---

### 🟢 LOW 优先级（有时间就做）

#### OPT-1: 清理过时临时脚本
- **文件**: 
  - `wiki-link-builder.js`（已废弃，孤立页已修）
  - `fix-orphans.js`（已废弃）
  - `fix-trust.js`（已废弃，user_pref.md 已重新生成）
  - `regenerate-user-pref.js`（一次性脚本）
  - `activate-trust.js`（一次性脚本）
- **保留理由**: 作为 wiki 维护历史
- **建议**: 移到 `scripts/archive/`
- **⚠️ 需 YANG 同意**

#### OPT-2: 隐私信息警告页
- **位置**: `wiki/03-system/private-info-policy.md`
- **内容**: 手机型号/账号/密码/IMEI 等隐私信息不自动入库；需要 YANG 明确确认
- **验收**: SOUL.md 或 AGENTS.md 引用此页

#### OPT-3: frontmatter 必填校验
- **脚本**: 在 lint.js 加 frontmatter 检查
- **必填字段**: id, title, type, tags, trust, last_updated
- **验收**: lint.js 报告缺失 frontmatter 的文件

#### OPT-4: 自动备份脚本
- **脚本**: `hermes-wiki-backup.ps1`
- **功能**: 每周日 23:00 跑 `git bundle create` 到 `D:\ai_schedule\backup\hermes-wiki-{date}.bundle`
- **注册**: schtasks /Create /TN "Hermes Wiki Backup" /SC WEEKLY /D SUN /ST 23:00:00
- **验收**: 周日 cron 自动生成 bundle

---

### 🛑 阻塞项（需要 YANG 配合）

#### BLOCK: 重启 hermes 验证 INDEX 注入 + 跑 5 轮对话

1. **YANG 重启 hermes**
2. **重启后立刻问 5 个测试问题**：
   - "你的记忆系统包含哪些分类？"（验证 INDEX）
   - "YANG 的预算是多少？"（验证召回）
   - "YANG 的所有 npm 全局工具有哪些？"（验证 npm-global.md）
   - "Hermes Agent 怎么调用 MCP？"（验证 mcp-plugins.md）
   - "夜间锁屏的解锁密码是多少？"（验证 night-lock.md）
3. **把每个问题的 hermes 回复转给 Mavis**
4. **Mavis 根据回复判断**：
   - 如果还有 INDEX 幻觉 → 报告 + 建议更深修复
   - 如果 trust 系统需要养 → 触发自动 fact_feedback +0.1
   - 如果还有召回失败 → 补页面

---

## 执行顺序

```
Step 1: 完成 EXEC（写本计划）— 当前
Step 2: BUG-1 → BUG-2 → BUG-3（HIGH，必须）
Step 3: BUG-4 → BUG-5 → BUG-6 → BUG-7（MEDIUM，应该）
Step 4: OPT-1（需 YANG 同意）→ OPT-2 → OPT-3 → OPT-4（LOW）
Step 5: COMMIT（git commit + 打包）
Step 6: BLOCK（YANG 重启 hermes + 5 轮对话）
Step 7: 根据 BLOCK 结果再迭代
```

---

## 风险控制

- 每完成一个 BUG → git commit 一次（保证可回滚）
- 任何"删除"操作 → 先标记 `.deprecated`，不真删
- 改动 SOUL.md → 同步更新 MIGRATION_REPORT.md
- 改动 config.yaml → 备份原文件到 `D:\ai_schedule\backup\`

---

**执行时间预估**：
- HIGH (3 项): 30 分钟
- MEDIUM (4 项): 45 分钟
- LOW (4 项): 30 分钟
- COMMIT (1 项): 5 分钟
- **总计**: ~2 小时可完成

**BLOCK（YANG 配合）**: 不确定时长，看 hermes 重启和对话验证结果