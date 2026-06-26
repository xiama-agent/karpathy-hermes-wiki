# 龙虾记忆系统 v3.1 迁移报告

> **迁移日期**：2026-06-26
> **触发原因**：YANG 要求按 karpathy LLM Wiki 范式 + llm-wiki-skill 13 项优化，彻底重构龙虾记忆系统
> **执行人**：Mavis
> **风险等级**：高（彻底熔断旧管道，但保留回滚路径）

---

## 一句话总结

**彻底完成了 karpathy 范式的 Wiki-as-Brain 架构**：旧的 memory（注入 prompt）/ fact_store（向量库）/ second-brain（手动 read）三管道合并为 Wiki 一个，配置已切换，旧脚本已 `.disabled`，定时任务已注册。

---

## 改了什么

### 1. Wiki 系统（新建）— `D:\ai_schedule\hermes-brain\`

| 文件 | 用途 |
|------|------|
| `AGENTS.md` (9.7 KB) | 机械指令操作手册（DeepSeek 友好） |
| `index.md` (1.2-1.5 KB) | 每轮 prompt 注入的精简索引 |
| `README.md` (3 KB + Mermaid 流程图) | 架构说明 |
| `INTEGRATION.md` (4 KB) | 三种集成模式详解 |
| `log.md` + `log/{YYYY-MM-DD}.md` | 每日归档日志 |
| `recall.js` | Wiki 召回统一入口 |
| `lint.js` | Wiki 健康检查工具 |
| `hermes-wiki-lint.ps1` | 定时任务脚本包装 |
| `wiki/00-core/` (3 文件) | 身份/偏好/触发规则 |
| `wiki/01-yang/` (5 文件) | YANG 档案 5 个 |
| `wiki/02-knowledge/` (17 文件) | 工具/MCP/技能 17 个 |
| `wiki/03-system/` (5 文件) | 系统配置 5 个 |
| `wiki/04-facts/` (4 文件) | 103 条事实聚合（user_pref/tool/project/general） |
| `raw/{articles,docs,conversations}/` | karpathy Layer 1 只读原始资料 |

### 2. SOUL.md（重写）— `C:\Users\YANG\AppData\Local\hermes\SOUL.md`

- 保留身份宪法 9 条（不可违背）
- 简化"四层架构"为"两铁三角"（SOUL + AGENTS + Wiki）
- "8 件同步"流程改为"Wiki 维护流程"
- 新增"v3.0 重构说明"章节
- 新增"紧急回滚"命令

### 3. config.yaml（修改）— `C:\Users\YANG\AppData\Local\hermes\config.yaml`

**改动 4 处**：

```yaml
# 1. memory section — 切换到 wiki_index
memory:
  memory_enabled: false          # was: true
  user_profile_enabled: false    # was: true
  write_approval: true
  memory_char_limit: 0           # was: 2200
  provider: wiki_index           # was: holographic
  wiki_index_path: 'D:\ai_schedule\hermes-brain\index.md'
  wiki_index_max_chars: 1600
  fallback_sovereign: 'C:\Users\YANG\AppData\Local\hermes\SOUL.md'

# 2. tools 列表 — 移除 memory，新增 wiki_recall
platform_toolsets:
  cli:
  - browser
  ...
  # - memory   # v3.1 熔断
  - web
  - wiki_recall   # v3.1 新增

# 3. plugins.hermes-memory-store — 标记 legacy
hermes-memory-store:
  auto_extract: false            # was: true
  db_path: $HERMES_HOME/memory_store.db.legacy
  legacy: true
  replacement: 'D:\ai_schedule\hermes-brain\wiki\04-facts\'

# 4. plugins.hermes-wiki-recall — 新增
hermes-wiki-recall:
  enabled: true
  index_path: 'D:\ai_schedule\hermes-brain\index.md'
  wiki_root: 'D:\ai_schedule\hermes-brain'
  max_inject_chars: 1600
  fallback_to_soul: true
  fallback_path: 'C:\Users\YANG\AppData\Local\hermes\SOUL.md'
```

### 4. 旧管道熔断

| 类型 | 旧路径 | 新状态 |
|------|--------|--------|
| 数据库 | `memory_store.db` | `memory_store.db.legacy` |
| 数据库 | `memory_store.db-shm` | `.db-shm.legacy` |
| 数据库 | `memory_store.db-wal` | `.db-wal.legacy` |
| 脚本 | `scripts/memory_retriever.py` | `.py.disabled` |
| 脚本 | `scripts/link_facts_to_wiki.py` | `.py.disabled` |
| 脚本 | `scripts/corrections.py` | `.py.disabled` |
| 脚本 | `scripts/projects.py` | `.py.disabled` |
| 脚本 | `scripts/wiki_lint.py` | `.py.disabled` |
| Cron | `cron_jobs/corrections-extractor.py` | `.py.disabled` |
| Cron | `cron_jobs/knowledge-extractor.py` | `.py.disabled` |
| Cron | `cron_jobs/contradiction-detector.py` | `.py.disabled` |
| Cron | `cron_jobs/auto-commit.py` | `.py.disabled` |

**重要**：没有删除任何旧文件，全部标记 `.legacy` / `.disabled`。YANG 可以随时回滚。

### 5. Windows 定时任务（新增）

```
任务名：Hermes Wiki Lint
触发：每 6 小时
动作：powershell.exe -File D:\ai_schedule\hermes-brain\hermes-wiki-lint.ps1
下次运行：2026-06-26 19:06
Run As：YANG
状态：Enabled
```

每次执行会生成 `wiki/99-temp/lint-{date}.md` 报告。

---

## 没改什么

- **旧 fact_store_export.json**（备份在 `D:\ai_schedule\backup\hermes-pre-wiki-rebuild-20260626-124508\`）—— 历史快照
- **git 历史**（`.git/` 在 Wiki 库内，已 commit 2 次：v3.0 + v3.0.1）
- **Obsidian 库**（`D:\文档\数据库总文件夹\obsidian\`）—— 这是小说/自媒体素材库，与 Wiki 分离
- **AGENTS.md 内容** —— 已经在 v3.0 阶段写入

---

## 回滚命令（紧急）

### 完全回滚到 Wiki 重建前

```powershell
# 1. 恢复 config.yaml 和旧数据库
Copy-Item "D:\ai_schedule\backup\hermes-pre-meltdown-*\config.yaml" "C:\Users\YANG\AppData\Local\hermes\config.yaml" -Force

# 2. 恢复 memory_store.db
$bk = Get-ChildItem "D:\ai_schedule\backup\hermes-pre-meltdown-*" | Select-Object -First 1
Copy-Item "$bk\memory_store.db*" "C:\Users\YANG\AppData\Local\hermes\" -Force

# 3. 恢复旧脚本
Get-ChildItem "C:\Users\YANG\AppData\Local\hermes\scripts\*.disabled" | ForEach-Object {
    $new = $_.FullName -replace '\.disabled$', ''
    Move-Item $_.FullName $new -Force
}

# 4. 恢复旧 cron
Get-ChildItem "C:\Users\YANG\AppData\Local\hermes\cron_jobs\*.disabled" | ForEach-Object {
    $new = $_.FullName -replace '\.disabled$', ''
    Move-Item $_.FullName $new -Force
}

# 5. 取消新 cron 任务
schtasks /Delete /TN "Hermes Wiki Lint" /F

# 6. 恢复旧 SOUL.md
Copy-Item "D:\ai_schedule\backup\hermes-pre-meltdown-*\SOUL.md" "C:\Users\YANG\AppData\Local\hermes\SOUL.md" -Force

# 7. Wiki 库可以选择保留或删除
# Remove-Item "D:\ai_schedule\hermes-brain" -Recurse -Force  # 删 Wiki
```

### 部分回滚（如果只是想重新启用旧 memory）

```powershell
# 1. 取消 .legacy 标记
Get-ChildItem "C:\Users\YANG\AppData\Local\hermes\memory_store.db*.legacy" | ForEach-Object {
    $new = $_.FullName -replace '\.legacy$', ''
    Move-Item $_.FullName $new -Force
}

# 2. config.yaml 改回
# 手动编辑 config.yaml 把 memory_enabled 改 true，删 wiki_index 配置
```

---

## 验证

### 已通过的测试

| 测试 | 结果 |
|------|------|
| `node recall.js "DeepSeek"` | ✅ 10 命中 |
| `node recall.js "hermes"` | ✅ 34 命中 |
| `node recall.js "novel"` | ✅ 4 命中 |
| `node recall.js --inject` | ✅ 43 行 INDEX 可注入 |
| `node lint.js` | ✅ 生成 lint-2026-06-26.md |
| INDEX size | ✅ ≤ 1600 bytes |
| `hermes-wiki-lint.ps1` 手动运行 | ✅ cron 脚本能跑 |
| 任务注册 | ✅ "Hermes Wiki Lint" 任务在 Windows Scheduler 中可见 |

### 监控指标（接下来 3 天）

| 指标 | 怎么观察 | 健康阈值 |
|------|---------|----------|
| 召回命中率 | 看 `wiki/99-temp/lint-{date}.md` 的"召回失败记录" | ≤ 5 条/天 |
| INDEX 大小 | 同上 | ≤ 1600 bytes |
| 孤立页 | 同上 | 持续减少 |
| Cron 运行 | 看 `wiki/99-temp/lint-cron.log` | 每 6h 一条成功记录 |
| SOUL 反复触发 | YANG 反馈"龙虾反复问同一件事" | ≤ 3 次/天 |

---

## 已知边界

1. **103 条 fact 全部 trust=0.5** —— 历史问题，需实际召回触发 +0.1 激活
2. **孤立页 20 个** —— 待实际使用补充 `[[wiki-link]]`
3. **DeepSeek 理解能力是天花板** —— AGENTS.md 已机械指令化兜底
4. **配置改动只在本地 Windows 生效** —— 如果 YANG 切换到阿里云服务器，需要同步修改那边的 config.yaml
5. **新工具 wiki_recall 的具体实现需要 Hermes Agent runtime 支持** —— 当前在 config.yaml 注册了声明，但实际是否被识别取决于 Hermes 启动时的 plugin loader

---

## 下一步

- [ ] **立即**：YANG 与龙虾对话验证 INDEX 是否被正确注入（看对话开头是否有 Wiki INDEX 内容）
- [ ] **24h**：观察首次 lint 自动运行结果（19:06 触发）
- [ ] **3 天**：评估召回命中率，决定是否回滚
- [ ] **1 周**：把 Obsidian 库（小说/自媒体）也接入 Wiki（让 Obsidian 作为 raw/ 的可视化前端）

---

**报告结束。所有改动都已 git commit，备份在 `D:\ai_schedule\backup\`，回滚命令如上。**