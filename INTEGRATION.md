# Hermes Wiki 集成指南（如何把 Wiki 接进 Hermes 启动回路）

> 这是"熔断旧管道"步骤的具体实施指南。需要 YANG 授权后才能动 hermes 启动配置。
> 不改也可以：Wiki 系统已可独立运行（recall.js + lint.js + AGENTS.md 机械指令），3 天灰度期后再决定是否要熔断旧管道。

---

## 现状

- **Wiki 系统**：独立可运行，路径 `D:\ai_schedule\hermes-brain\`
- **旧管道**：在 `C:\Users\YANG\AppData\Local\hermes\` 下，依赖：
  - `memory_store.db`（fact_store 数据库）
  - `SOUL.md`（已重写 v3.0）
  - `config.yaml`（可能包含 memory 注入配置）
  - `scripts/memory_retriever.py`（旧 memory 召回脚本）
  - `cron_jobs/`（旧定时任务）

---

## 三种集成模式（YANG 选）

### 模式 A：最小改动（推荐灰度期）

**做法**：不改 hermes 配置，只让龙虾每轮对话开始时**手动**读 `D:\ai_schedule\hermes-brain\index.md`。

**实现**：
- 在 SOUL.md 加一条："每轮对话开始时，先读 `D:\ai_schedule\hermes-brain\index.md`（≤800 字）"
- 这样龙虾每轮自动注入 INDEX（不需要改 hermes 代码）
- fact_store 数据库保持不动，作为兜底

**优点**：零风险，纯文字层改动
**缺点**：每次注入依赖龙虾自觉，不强制

**适用**：3 天灰度期

---

### 模式 B：替换 prompt 注入

**做法**：改 hermes 启动配置，把原来的 memory 注入逻辑换成读 Wiki INDEX。

**实现**：
1. 修改 `C:\Users\YANG\AppData\Local\hermes\config.yaml`：
   ```yaml
   memory:
     source: file
     path: D:\ai_schedule\hermes-brain\index.md
     max_chars: 1600
   ```
2. 备份旧的 `memory_store.db`，标记为 `memory_store.db.legacy`
3. 重启 hermes，观察日志

**优点**：强制注入 Wiki INDEX，旧 memory 不再被读
**缺点**：如果 hermes 启动逻辑不认这种格式，会报错

**适用**：灰度期通过后，正式切换

---

### 模式 C：彻底熔断（YANG 选的"彻底"）

**做法**：模式 B + 物理删除旧 memory/fact_store 注入代码。

**实现**：
1. 执行模式 B
2. 删除 `scripts/memory_retriever.py`（或重命名 .disabled）
3. 删除 `memory_store.db`（已备份）
4. 在 SOUL.md 删除所有"8 件同步"的旧流程
5. 在 cron_jobs/ 删除 `corrections-extractor.py`、`knowledge-extractor.py` 等（改为新 Wiki 的 Lint 任务）

**优点**：彻底切换，没有冗余
**缺点**：回滚困难，必须用 `D:\ai_schedule\backup\` 的备份恢复

**适用**：灰度期结束 + YANG 明确批准"彻底"

---

## 推荐节奏

```
Day 1-3 (灰度期)
  └── 模式 A：让龙虾手动读 Wiki INDEX，旧管道仍工作
       监控指标：召回命中率、对话流畅度、有无 SOUL.md 反复触发

Day 4 (评估)
  └── 检查 Lint 报告（node lint.js）和用户反馈
       命中率 ≥ 80% → 进模式 B
       命中率 < 80% → 调优 Wiki 内容，回退模式 A 继续观察

Day 5-7 (切换)
  └── 模式 B：替换 prompt 注入
       监控 3 天无异常

Day 8 (熔断)
  └── 模式 C：彻底熔断
       仅在 Day 5-7 完全无异常时执行
```

---

## 召回监控指标

| 指标 | 怎么算 | 健康阈值 |
|------|--------|----------|
| 召回命中率 | 用户提问后召回的相关页面数 / 应召回数 | ≥ 80% |
| INDEX 大小 | `index.md` 的字节数 | ≤ 1600 bytes |
| 召回失败记录 | `wiki/99-temp/missed-recall-*.md` 文件数 | ≤ 5/天 |
| SOUL 反复触发 | 同一规则一天被触发的次数 | ≤ 3 次 |
| trust 系统活跃 | 至少 1 条事实 trust ≥ 0.5 | 是 |

每 6 小时自动跑一次 `node lint.js`，结果写 `wiki/99-temp/lint-{date}.md`。

---

## 回滚命令（任何时候）

```powershell
# 完全回滚到 Wiki 重建前
Copy-Item "D:\ai_schedule\backup\hermes-pre-wiki-rebuild-20260626-124508\live-hermes\*" "C:\Users\YANG\AppData\Local\hermes\" -Recurse -Force

# 删 Wiki（如果想完全放弃新系统）
Remove-Item "D:\ai_schedule\hermes-brain" -Recurse -Force
```

---

**待 YANG 拍板**：选择模式 A / B / C，还是继续当前"双系统"跑法？