# Sample Ingest 演示 — 完整的 Wiki 维护流程

> 这是 karpathy 五操作（Compile/Ingest/Query/Lint/Audit）的实际跑法演示。
> 你按这个走一遍就能看到整个流程怎么工作。

---

## 场景：你想让 Wiki 记住一篇你刚读完的文章

假设你刚读完一篇关于 MiniMax M3 的 X 推文，链接：`https://x.com/someone/status/1234567890`，关键观点是"M3 的真正杀手锏是跨会话状态保持"。

### Step 1: 放原始资料到 raw/

```bash
# 把链接/截图/笔记放进 raw/articles/ 或 raw/docs/
# 最佳实践：建一个以日期+主题命名的文件夹
mkdir D:\ai_schedule\hermes-brain\raw\articles\2026-06-26-m3-key-feature\
# 把链接存为 .md 或 .txt
echo "https://x.com/someone/status/1234567890" > D:\ai_schedule\hermes-brain\raw\articles\2026-06-26-m3-key-feature\link.txt
# 如果有截图，放 .png
copy screenshot.png D:\ai_schedule\hermes-brain\raw\articles\2026-06-26-m3-key-feature\
```

### Step 2: 触发 Ingest（手动 / 让龙虾做）

你跟龙虾说：

> "把 raw/articles/2026-06-26-m3-key-feature/ 的内容 ingest 到 Wiki。"

龙虾按 AGENTS.md 第 2 章执行：

1. **读 raw 文件**（只读，不改）
2. **判断类别** → 02-knowledge（因为是关于 M3 工具）
3. **更新已有页面** `wiki/02-knowledge/minimax-m3.md`：
   - 添加新事实"M3 的核心特征：跨会话状态保持"
   - 更新 last_updated 日期
   - 更新 frontmatter trust
4. **写新页面**（如果是新概念）`wiki/02-knowledge/m3-state-persistence.md`
5. **更新 INDEX.md** 加新行
6. **追加 log/2026-06-26.md**：
   ```
   ## [HH:mm:ss] ingest | m3-state-persistence | 新建页面
   ```

### Step 3: 验证 Ingest 成功

```bash
# 看新页面是否被创建
ls D:\ai_schedule\hermes-brain\wiki\02-knowledge\m3-state-persistence.md

# 看 INDEX 是否更新
cat D:\ai_schedule\hermes-brain\index.md | grep "m3-state"

# 看日志是否记录
cat D:\ai_schedule\hermes-brain\log\2026-06-26.md | tail -5

# 看 trust 是否变化
cat D:\ai_schedule\hermes-brain\wiki\02-knowledge\minimax-m3.md | head -5
```

### Step 4: 触发 Query（提问）

你问龙虾：

> "M3 跟其他模型比有什么独特之处？"

龙虾按 AGENTS.md 第 1.2 节召回：

1. 读 INDEX.md（1514 bytes）
2. 类别 = knowledge → 读 `wiki/02-knowledge/`
3. grep "M3" → 找到 `minimax-m3.md` + `m3-state-persistence.md`
4. 读这两个页面
5. 综合回答（带引用）

### Step 5: 自动 fact_feedback（trust 激活）

召回成功后，按 AGENTS.md 第 1.4 节：

```bash
# 更新 minimax-m3.md 的 trust
node -e "const fs=require('fs');const p='D:/ai_schedule/hermes-brain/wiki/02-knowledge/minimax-m3.md';let c=fs.readFileSync(p,'utf8');c=c.replace(/^trust:\s*([\d.]+)/m,(_,t)=>'trust: '+Math.min(1,parseFloat(t)+0.1).toFixed(2));fs.writeFileSync(p,c);"
# 现在 trust 是 0.65 + 0.1 = 0.75
```

### Step 6: 跑 Lint（自动 cron）

每 6 小时自动跑 `node lint.js`，生成报告到 `wiki/99-temp/lint-{date}.md`。

你现在可以手动跑一次看效果：

```bash
cd D:\ai_schedule\hermes-brain
node lint.js
# 输出 wiki/99-temp/lint-{today}.md
```

### Step 7: 如果发现错误，触发 Audit

你在 `minimax-m3.md` 里看到一句话写错了：

```markdown
# 在错的内容下加一行
[AUDIT 2026-06-26] 这段有问题：事实错误，M3 没有 X 功能
```

然后跟龙虾说：

> "处理 wiki/99-temp/audit-2026-06-26-*.md 里的纠错。"

龙虾按 AGENTS.md 第 4 章执行：
1. 读 audit 文件
2. 找到原页面，改内容
3. 把 audit 文件移入 `resolved/`
4. 追加 log

---

## 完整流程时间线

```
T0  你放资料到 raw/
       ↓
T+5s 你跟龙虾说"ingest 这个"
       ↓
T+30s 龙虾读完 raw，更新了 2 个 wiki 页面，INDEX 更新，log 追加
       ↓
T+任意 你问龙虾问题
       ↓
T+任意+1s 龙虾召回 wiki 2 个页面，综合回答
       ↓
T+任意+5s 自动 fact_feedback 更新 trust
       ↓
T+6h  cron 自动跑 lint.js
       ↓
T+任意 你发现错误，加 [AUDIT] 标记，让龙虾处理
```

整个流程是**复利式**的：每加一份资料，每问一个问题，每修一个错误，Wiki 都会变得更聪明一点。

---

## 验证 INDEX 注入（最关键的测试）

下面是你判断 Wiki INDEX 是否真的被注入到龙虾对话的 3 个方法：

### 方法 1: 看对话开头

重启 hermes 后跟龙虾说"你好"，看回复开头是否包含：
```
Wiki Index — 每轮注入版
召回指南
| 类别 | 子目录 | ...
```

如果出现 → INDEX 注入成功 ✅
如果没出现 → 注入失败，需要查 config.yaml 和 hermes plugin loader

### 方法 2: 直接问"你的记忆系统是什么"

龙虾应该回答指向 `D:\ai_schedule\hermes-brain\`，而不是"我的四层架构"。

### 方法 3: 看 cron 日志

今天 19:06 之后看：

```bash
cat D:\ai_schedule\hermes-brain\wiki\99-temp\lint-cron.log
```

如果每 6h 一条 success 记录 → 系统在跑。

---

## 完整自检命令清单

```bash
# 1. Wiki 文件数
ls D:\ai_schedule\hermes-brain\wiki -Recurse -Filter *.md | Measure-Object | Select-Object Count

# 2. INDEX 大小（必须 < 1600 bytes）
(Get-Item D:\ai_schedule\hermes-brain\index.md).Length

# 3. 跑 lint 看孤立页
cd D:\ai_schedule\hermes-brain; node lint.js

# 4. 跑 recall 测试
cd D:\ai_schedule\hermes-brain; node recall.js "M3"

# 5. 查 cron 任务
schtasks /Query /TN "Hermes Wiki Lint" /V /FO LIST

# 6. 看今天日志
cat D:\ai_schedule\hermes-brain\log\2026-06-26.md

# 7. 验证旧管道是否熔断
ls C:\Users\YANG\AppData\Local\hermes\memory_store.db*.legacy
ls C:\Users\YANG\AppData\Local\hermes\scripts\*.disabled
```