---
id: HERMES-FACT-GENERAL-001
title: 通用核心事实 (64 条)
type: fact-collection
tags: [facts, general]
trust: 0.5
use_cases: ["查询 general 类事实", "YANG 提到 general 相关"]
source: fact_store_export.json
last_updated: 2026-06-26
---

# 通用核心事实

> 来自 fact_store 全量导出，共 64 条。按 fact_id 排序。

---

## HERMES-FACT-015 (trust: 0.5)

[参考] Hindsight不适合本地方案(需Docker+PG+API Key)，已切Holographic纯本地SQLite轻量方案为二级记忆。

- **fact_id**: 15
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-15 05:57:02
- **updated**: 2026-06-15 08:39:17

---

## HERMES-FACT-018 (trust: 0.5)

[核心] 自动学习闭环：复杂任务(5+工具)后自我评估→有纠正/坑/新知识则分三类写入(fact_store/memory/patch skill)。日常不触发。手动更新优先。

- **fact_id**: 18
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-15 06:19:55
- **updated**: 2026-06-15 08:39:06

---

## HERMES-FACT-021 (trust: 0.5)

[核心] 龙虾身份定义在SOUL.md(C:\Users\YANG\AppData\Local\hermes\SOUL.md)。更新必须四件同步：SOUL.md+记忆+skills+fact_store。

- **fact_id**: 21
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-15 07:34:18
- **updated**: 2026-06-15 08:39:36

---

## HERMES-FACT-022 (trust: 0.5)

[工具] 视觉状态：DeepSeek Flash不支持图片。MiMo Code CLI已通(API Key在.env)，看图用MIMO_API_KEY=xxx npx @mimo-ai/cli run "描述" -f <路径>。OCR脚本(D:\Tools\HermesScripts\ocr.py)提取文字备用。EasyOCR冲突待修，Tesseract没装。

- **fact_id**: 22
- **category**: general
- **tags**: second-brain/03-knowledge/vision-ocr
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-15 07:34:35
- **updated**: 2026-06-15 08:52:37

---

## HERMES-FACT-023 (trust: 0.5)

[路径] 关键路径：SOUL.md C:\Users\YANG\AppData\Local\hermes\SOUL.md。Obsidian D:\文档\数据库总文件夹\obsidian\ MCP 127.0.0.1:27124(已连接)。桌面D:\Users\YANG\Desktop只留.lnk。软件D:\Tools\。TEMP D:\Temp。阿里云8.163.23.217。

- **fact_id**: 23
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-15 07:34:36
- **updated**: 2026-06-15 08:38:53

---

## HERMES-FACT-029 (trust: 0.5)

[工具] 工具分工：CodeGraph分析项目结构/代码图谱。Tokscale查token消耗。repomix打包代码给AI分析。ddgs搜索。rtk压缩终端输出省token(配合caveman skill)。Reasonix复杂编码。MiMo CLI看图+代码审查。OCR文字提取。

- **fact_id**: 29
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-15 08:13:47
- **updated**: 2026-06-15 08:39:04

---

## HERMES-FACT-030 (trust: 0.5)

[核心] 路径使用铁律：任何路径不管来自记忆还是fact_store，使用前必须ls/stat确认。不存在则搜全盘找真实路径并更新fact_store。绝不信未确认路径。

- **fact_id**: 30
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-15 08:25:41
- **updated**: 2026-06-15 08:39:07

---

## HERMES-FACT-032 (trust: 0.5)

[路径] 路径分布：Hermes本体C:\Users\YANG\AppData\Local\hermes\，venv在\.venv\非venv。技能分两处：AppData\Local\hermes\skills\(默认扫) + ~\.hermes\skills\(9自定义需config指定)。工具D:\Tools\。桌D:\Users\YANG\Desktop\。

- **fact_id**: 32
- **category**: general
- **tags**: paths,config,second-brain/01-yang/desktop,second-brain/03-knowledge/tools-overview
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-15 08:38:12
- **updated**: 2026-06-15 08:38:54

---

## HERMES-FACT-043 (trust: 0.5)

自动学习激活：每次用户纠正我后，必须立即记一条永久规则到memory/skill。不得口头承认但不落笔。

- **fact_id**: 43
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-16 11:32:02
- **updated**: 2026-06-16 11:32:02

---

## HERMES-FACT-044 (trust: 0.5)

自省：OpenCode装后发现是编译二进制而非源码，白费功夫。以后分析npm包先ls看目录结构再承诺"分析源码"，避免浪费用户时间。

- **fact_id**: 44
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-16 11:32:03
- **updated**: 2026-06-16 11:32:03

---

## HERMES-FACT-048 (trust: 0.5)

[生态认知] OpenClaw（14万星开源AI Agent，中文称"小龙虾"）≠ 龙虾。Hermes编码优先，OpenClaw个人助手优先。源码50万行可下但只需架构级精读3-5个核心模块。

- **fact_id**: 48
- **category**: general
- **tags**: ecosystem,openclaw
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-16 11:42:21
- **updated**: 2026-06-16 11:42:21

---

## HERMES-FACT-049 (trust: 0.5)

[蜂群评估 2026-06-16] 分身（复制全能Agent）价值低。蜂群（专业Agent+总管调度）有价值但用户当前无并行需求，本地暂缓云端已否决。触发条件：用户同时做两件独立事（小说+编码/本地+微信）时再考虑。

- **fact_id**: 49
- **category**: general
- **tags**: architecture,multi-agent,evaluation
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-16 11:42:22
- **updated**: 2026-06-16 11:42:22

---

## HERMES-FACT-051 (trust: 0.5)

[学习路径优先级 2026-06-16] P0=用户纠正→我永久记住。P1=读文档/文章/最佳实践。P2=Self-Evolution跑一轮(需用户同意,$2-10)。P3=亲身体验工具。不搞：下载别人源码分析。实战自我迭代最有价值。

- **fact_id**: 51
- **category**: general
- **tags**: learning,priority,self-improvement
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-16 11:42:24
- **updated**: 2026-06-16 11:42:24

---

## HERMES-FACT-053 (trust: 0.5)

小说规则：所有小说内容（设定/世界观/章纲/设计决策）只存Obsidian不存memory。设计时引用Wiki教学帖方法论。具体规则→查fact_store(tag=novel)。⚠️ 小说记忆禁止写入内置记忆层！

- **fact_id**: 53
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-16 11:42:59
- **updated**: 2026-06-16 11:42:59

---

## HERMES-FACT-057 (trust: 0.5)

Hermes skills目录: C:\Users\YANG\.hermes\skills\（config.yaml指定位置）

- **fact_id**: 57
- **category**: general
- **tags**: paths,skills,second-brain/01-yang/desktop
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-17 06:23:32
- **updated**: 2026-06-17 06:23:32

---

## HERMES-FACT-058 (trust: 0.5)

Hermes桌面版: D:\hermes\Hermes.exe | 辅助脚本: D:\Tools\hermes\ | HERMES_HOME: C:\Users\YANG\AppData\Local\hermes\ | config: C:\Users\YANG\AppData\Local\hermes\config.yaml | env: C:\Users\YANG\AppData\Local\hermes\.env

- **fact_id**: 58
- **category**: general
- **tags**: paths,hermes,second-brain/01-yang/desktop,second-brain/03-knowledge/tools-overview
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-17 06:23:33
- **updated**: 2026-06-17 06:23:33

---

## HERMES-FACT-059 (trust: 0.5)

Hermes venv实际路径: C:\Users\YANG\AppData\Local\hermes\hermes-agent\venv\（非.venv，which指向的激活venv）

- **fact_id**: 59
- **category**: general
- **tags**: paths,hermes,second-brain/01-yang/desktop
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-17 06:28:29
- **updated**: 2026-06-17 06:28:29

---

## HERMES-FACT-061 (trust: 0.5)

ffmpeg路径: D:\Tools\ffmpeg_ok.exe | ffprobe: D:\Tools\ffprobe_ok.exe | 提取视频音频后用faster-whisper转文字 | 调用方式: subprocess.run('D:\\Tools\\ffmpeg_ok.exe -i input.mp4 -vn -ar 16000 output.wav') → faster_whisper转文字

- **fact_id**: 61
- **category**: general
- **tags**: paths,tool,video,second-brain/03-knowledge/tools-overview
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-17 06:53:30
- **updated**: 2026-06-17 06:53:30

---

## HERMES-FACT-062 (trust: 0.5)

夜间锁屏程序：tkinter全屏锁，22:30~12:00锁屏，等10分钟输密码3941解锁，含紧急关机。路径/详情→查fact_store(tag=night-lock)。

- **fact_id**: 62
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-17 07:12:35
- **updated**: 2026-06-17 07:12:35

---

## HERMES-FACT-067 (trust: 0.5)

小说《当神明死尽》所有设定/剧情/人物/规则统一存储在 Obsidian 笔记库 D:\文档\数据库总文件夹\obsidian\大纲设计\。不存任何具体小说内容到内置记忆。每次会话前优先读取笔记库最新内容。

- **fact_id**: 67
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-18 12:13:47
- **updated**: 2026-06-18 12:13:47

---

## HERMES-FACT-071 (trust: 0.5)

英语题库 Capacitor app 构建环境：JDK 17（C:\Program Files\Java\jdk-17），Gradle 8.14.3（D:\Android\gradle-8.14.3），Android SDK（D:\Android）。Gradle wrapper已改为在线下载地址，Java兼容性已改为VERSION_17。英语题库capacitor打包路径：gradle-wrapper.properties已改在线下载，Java兼容性改为17。

- **fact_id**: 71
- **category**: general
- **tags**: second-brain/03-knowledge/apk-build
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-19 12:57:29
- **updated**: 2026-06-19 12:57:29

---

## HERMES-FACT-077 (trust: 0.5)

Harness引擎已启用：复杂任务(5+调用/改代码/跨会话)→加载skill:harness→执行INIT→SCOPE→EXECUTE→VERIFY→RECORD→HANDOFF。进度文件~/.hermes/harness/current.json。代码改后必须实际跑编译+测试+lint才算完成。简单/创作任务跳过。curator清30d+旧记录。

- **fact_id**: 77
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-19 16:03:11
- **updated**: 2026-06-19 16:03:11

---

## HERMES-FACT-078 (trust: 0.5)

[核心] Harness引擎已集成到龙虾体系。四层一体化：①SOUL.md(宪法定义Harness原则+铁律)→②memory(指针→查fact_store)→③skill:harness(执行规范, system/harness/SKILL.md, 0t加载)→④~/.hermes/harness/(运行时数据, current.json任务状态+history/历史)。代码验证铁律：改代码后必须实际跑编译+测试+lint才算完成。复杂任务(5+调用/跨会话/改代码)启用，简单/创作跳过。curator清30d+旧history文件。2026-06-19启用。

- **fact_id**: 78
- **category**: general
- **tags**: harness,core,second-brain/02-me/harness,second-brain/04-system/hermes-hooks
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-19 16:03:12
- **updated**: 2026-06-19 16:04:53

---

## HERMES-FACT-080 (trust: 0.5)

[学习] Karpathy四条行为铁律已融入SOUL.md编程规则：先思考、简单优先、手术级修改、目标驱动。来源multica-ai/andrej-karpathy-skills(179K⭐)。2026-06-20纳入。

- **fact_id**: 80
- **category**: general
- **tags**: learning,coding,karpathy
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-19 16:30:09
- **updated**: 2026-06-19 16:30:09

---

## HERMES-FACT-094 (trust: 0.5)

[方法] 工具版本检测机制:不再硬编码版本号到记忆/SOUL.md。需要调用时用npx自动使用已装版本。工具启动异常时先`工具 --version`检查实际版本,与预期不符则更新记忆。2026-06-20确立。

- **fact_id**: 94
- **category**: general
- **tags**: core,method,tooling
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-19 17:54:51
- **updated**: 2026-06-19 17:54:51

---

## HERMES-FACT-095 (trust: 0.5)

[规则] 工具调用运行时验证:调用任何外部工具前不预检版本(太贵)。改为:①工具调用失败/异常→自动检查该工具的`--version`和是否在PATH ②发现实际版本与记忆不一致→更新fact_store ③发现工具不存在→标记为不可用并报告 ④成功调用不额外检查。这样只在异常时花token,正常时零开销。

- **fact_id**: 95
- **category**: general
- **tags**: core,rule,tooling
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-19 17:55:25
- **updated**: 2026-06-19 17:55:25

---

## HERMES-FACT-096 (trust: 0.5)

[规则] 并行function calling:当需要多个工具调用且互不依赖时(如同时读多个独立文件、同时搜索多个源),一并发出请求而非串行。减少往返次数和省token。依赖前序结果时串行。2026-06-20确立。

- **fact_id**: 96
- **category**: general
- **tags**: core,rule,performance
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-19 17:56:30
- **updated**: 2026-06-19 17:56:30

---

## HERMES-FACT-108 (trust: 0.5)

[学习] 2026-06-20从Claude Code(Boris Cherny 13 tips)吸收: ①编码后自动格式化 ②改代码结束直接给验证命令而非说"完成了"。两条已写入SOUL.md自动触发规则。来源: shanraisshan/claude-code-best-practice(58.3K⭐)。

- **fact_id**: 108
- **category**: general
- **tags**: learning,claude-code,absorbed
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-19 19:29:30
- **updated**: 2026-06-19 19:29:30

---

## HERMES-FACT-110 (trust: 0.5)

吸收+互补范式：新skill/概念/工具→提取行为核心写入自身+分析自身不足+吸收对方优点互补缺陷。不只是"复制"，而是"吸收+融合"。路径/配置存fact_store，步骤复杂才保留skill文件。

- **fact_id**: 110
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-19 19:38:58
- **updated**: 2026-06-19 19:38:58

---

## HERMES-FACT-128 (trust: 0.5)

Reasonix升级了。现在是双通道：CLI版（npm i -g reasonix@next, v1.10.0-rc.1）写代码用 `reasonix run "..."`；GUI桌面版（D:\Tools\Reasonix.exe\reasonix.exe）手动双击用。SOUL.md已改，reasonix-coder skill已重写。

- **fact_id**: 128
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-20 13:55:09
- **updated**: 2026-06-20 13:55:09

---

## HERMES-FACT-131 (trust: 0.5)

已吸收HTML报告规则：当用户要求生成报告/分析/结果展示时，自动询问是否需要以HTML方式做图文并茂的报告。已写入SOUL.md自动触发规则表。

- **fact_id**: 131
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-20 14:01:55
- **updated**: 2026-06-20 14:01:55

---

## HERMES-FACT-136 (trust: 0.5)

记忆手动写入：只有你说"记住/记下/更新龙虾"时才写memory/fact_store。日常不自动记任何东西，不反思不自省。

- **fact_id**: 136
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-20 14:13:50
- **updated**: 2026-06-20 14:13:50

---

## HERMES-FACT-138 (trust: 0.5)

RSI自改进追踪：工具失败/用户纠正自动记fact_store(tag=rsi_ledger)，追失败原因+修复方案。同Pattern-Key出现3次/30天内自动晋升为memory永久规则

- **fact_id**: 138
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-20 16:35:35
- **updated**: 2026-06-20 16:35:35

---

## HERMES-FACT-139 (trust: 0.5)

三重记忆检索：fact_store(实体类别优先)+session_search(FTS5)+实体关系图(RFF融合)。入度高的fact受保护免淘汰。召回时按类枚举再图扩展

- **fact_id**: 139
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-20 16:35:35
- **updated**: 2026-06-20 16:35:35

---

## HERMES-FACT-140 (trust: 0.5)

上下文分级压缩：复杂会话接近阈值时自动摘要(后台65%/同步90%)，永久会话不清零。对话40+轮觉得慢就主动压缩

- **fact_id**: 140
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-20 16:35:35
- **updated**: 2026-06-20 16:35:35

---

## HERMES-FACT-141 (trust: 0.5)

规范驱动编码：动手前写spec+验收标准到进度文件，验收标准逐条确认才标记done。来源：GitHub Spec Kit+OpenCrabs RSI

- **fact_id**: 141
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-20 16:35:35
- **updated**: 2026-06-20 16:35:35

---

## HERMES-FACT-142 (trust: 0.5)

GitHub学习模式已掌握：browser_navigate→curl raw README→web_search兜底→提取核心理念→吸收到对应层

- **fact_id**: 142
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-20 16:35:35
- **updated**: 2026-06-20 16:35:35

---

## HERMES-FACT-146 (trust: 0.5)

[参考] GitHub项目吸收记录2026-06-21。OpenCrabs(adolfousier/opencrabs,Rust,801⭐)→RSI自改进+上下文压缩+Fallback链+多Agent编排+3层记忆。AgentMemory(rohitg00/agentmemory,23.5K⭐)→三段检索(BM25+向量+知识图)+Raw→Semantic压缩+12自动钩子+零外部依赖。SelfImprovingAgent(peterskoett/self-improving-agent,665⭐)→结构化日志(LRN/ERR/FEAT)+Pattern-Key重复检测(3次/30天晋升)+Skill自动提取。GitHub Spec Kit(github/spec-kit,106K⭐)→规范驱动开发。CLI-Anything(lzy-hhhh/CLI-Anything,21K⭐)→GUI→CLI harness给Agent用。OpenHuman(tinyhumansai/openhuman)→Rust本地AI助手。所有项目已提取行为核心写入了memory。完整分析→查skill:harness-continuous-learning的references

- **fact_id**: 146
- **category**: general
- **tags**: github,learning,reference,2026-06-21
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-20 16:35:52
- **updated**: 2026-06-20 16:35:52

---

## HERMES-FACT-158 (trust: 0.5)

MCP能力：我可以安装MCP服务器来扩展工具能力。`hermes mcp catalog`看目录，`hermes mcp install <name>`一键装。已装n8n MCP桥。MCP工具前缀mcp__<server>__<tool>

- **fact_id**: 158
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-21 14:21:56
- **updated**: 2026-06-21 14:21:56

---

## HERMES-FACT-159 (trust: 0.5)

插件已启用：disk-cleanup（自动清理临时文件）+ web-ddgs（DuckDuckGo搜索）。更多插件用`hermes plugins list`查看

- **fact_id**: 159
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-21 14:21:56
- **updated**: 2026-06-21 14:21:56

---

## HERMES-FACT-161 (trust: 0.5)

四层更新完成（2026-06-21自学升级）：①SOUL.md新增MCP+插件扩展能力行 ②memory记录MCP命令和插件信息 ③lobang-agent-complete skill新增disk-cleanup+web-ddgs已启用插件记录，capability-reference保留完整MCP参考 ④fact_store存MCP、n8n、插件、agentskills.io知识。插件已启用：disk-cleanup（自动清临时文件）、web-ddgs（DuckDuckGo搜索）。MCP已装：n8n桥待n8n实例。下次联网自学优先探索MCP目录安装有用工具。

- **fact_id**: 161
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-21 14:25:27
- **updated**: 2026-06-21 14:25:27

---

## HERMES-FACT-162 (trust: 0.5)

MCP+插件：`hermes mcp catalog`看目录安装新工具。已装n8n MCP桥。已启用插件disk-cleanup（自动清临时文件）+web-ddgs（搜索）。`hermes plugins list`查看更多插件

- **fact_id**: 162
- **category**: general
- **tags**: second-brain/03-knowledge/mcp-plugins
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-21 14:25:33
- **updated**: 2026-06-21 14:25:33

---

## HERMES-FACT-163 (trust: 0.5)

自媒体能力→default粗略覆盖(SOUL.md已加一行能力总览)，精细版切self-media配置。核心流程：60s API扫热点→bb-browser扒评论区→按观点分类→素材包，绝不代发。已从GitHub吸收ContentResearchWriter模式(调研→大纲→钩子→引用→反馈)和Newsletter结构化内容组织模式。

- **fact_id**: 163
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-22 11:06:18
- **updated**: 2026-06-22 11:06:18

---

## HERMES-FACT-164 (trust: 0.5)

自媒体能力→default粗略覆盖(SOUL.md能力总览已加)，精细版切self-media配置。工作流:60s API扫热点→bb-browser扒评论区→按观点分类→素材包。已吸收ContentResearchWriter模式(调研→大纲→钩子→引用)。搜热点先确认原话语境。绝不代发。YANG做观点号，不劝退帮他拆障碍。

- **fact_id**: 164
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-22 11:06:24
- **updated**: 2026-06-22 11:06:24

---

## HERMES-FACT-165 (trust: 0.5)

[吸收] ContentResearchWriter模式(ComposioHQ/awesome-claude-skills 65.5K⭐): 内容创作四步法——调研(搜资料+加引用)→大纲(协作式结构梳理)→钩子(开头抓注意力)→反馈(逐段审阅)。适用场景:观点号脚本大纲、热点分析内容创作。核心思想:AI做协作伙伴不代写。

- **fact_id**: 165
- **category**: general
- **tags**: absorbed,content-writing,self-media
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-22 11:06:34
- **updated**: 2026-06-22 11:06:34

---

## HERMES-FACT-166 (trust: 0.5)

[吸收] Newsletter结构化内容组织(internal-comms/awesome-claude-skills): 多段式内容结构(通知类/进展类/领导类/社交类分段)。适用:观点视频脚本结构、素材整理分类格式。核心:按"信息类型"自然分段而非流水账。

- **fact_id**: 166
- **category**: general
- **tags**: absorbed,content-structure,self-media
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-22 11:06:35
- **updated**: 2026-06-22 11:06:35

---

## HERMES-FACT-168 (trust: 0.5)

[参考] reddit-fetch(ykdojo/claude-code-tips): Reddit内容抓取skill，当WebFetch被阻时的备选方案。原理通过Gemini CLI中转。借鉴思路:爬取受阻时找备选CLI工具中转而非硬爬。

- **fact_id**: 168
- **category**: general
- **tags**: reference,scraping,fallback
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-22 11:06:37
- **updated**: 2026-06-22 11:06:37

---

## HERMES-FACT-172 (trust: 0.5)

分身架构：主龙虾（default）统领所有分身，知道所有分身的位置和能力。分身不知道彼此存在。媒体龙虾（self-media）做内容创作（自媒体+小说大纲）。编程龙虾和大纲龙虾待创建。主龙虾遇到深度需求时告诉用户切到对应分身。

- **fact_id**: 172
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-24 06:10:03
- **updated**: 2026-06-24 06:10:03

---

## HERMES-FACT-173 (trust: 0.5)

[profile] 媒体龙虾 = self-media配置，路径: C:\Users\YANG\AppData\Local\hermes\profiles\self-media\。模型: DeepSeek V4 Flash。做内容创作（自媒体+小说大纲），不碰编程。

- **fact_id**: 173
- **category**: general
- **tags**: profile,self-media,paths,second-brain/01-yang/desktop
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-24 06:10:07
- **updated**: 2026-06-24 06:10:07

---

## HERMES-FACT-174 (trust: 0.5)

[profile] 编程龙虾 = 待创建。模型: MiniMax M3。专注编程、APK打包、代码重构。

- **fact_id**: 174
- **category**: general
- **tags**: profile,programming,second-brain/03-knowledge/minimax-m3
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-24 06:10:08
- **updated**: 2026-06-24 06:10:08

---

## HERMES-FACT-182 (trust: 0.5)

Mavis能力参考：原生MiniMax M3，屏幕视觉(GUI操作/看桌面)，装软件/填表单/拖文件，原生编程闭环(写+跑+调试一条龙)。不能：持久记忆(会话级)，无cron，无技能库。与协作相关时走D:\ai_schedule\目录协议。

- **fact_id**: 182
- **category**: general
- **tags**: ai_schedule,mavis,capabilities,second-brain/02-me/capabilities
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-24 10:22:42
- **updated**: 2026-06-24 10:22:42

---

## HERMES-FACT-183 (trust: 0.5)

记忆系统改进计划（YANG和Mavis商议中）：①回答前自动扫fact_store ②临时记忆库(tag=temporary) ③写入审批规则更严格。已记入SOUL.md自动触发规则。长远：如果Mavis不能实现全自动，考虑自建Windows computer_use（Hermes已有ComputerUseBackend接口，依赖uiautomation+pyautogui已装，工作2-3周）。

- **fact_id**: 183
- **category**: general
- **tags**: ai_schedule,future,memory_improvement,computer_use
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-24 10:22:46
- **updated**: 2026-06-24 10:22:46

---

## HERMES-FACT-184 (trust: 0.5)

2026年6月25日四层系统优化：OpenViking文件系统范式→强化一体化铁律为可导航四层追溯；GBrain自接线记忆→添加主动关联扩展机制；DeerFlow超Agent Harness→添加检查点恢复机制；SDD规范驱动开发→添加范围定义模板；新增自动触发规则：会话涉及已知主题时自动probe fact_store

- **fact_id**: 184
- **category**: general
- **tags**: 四层优化,2026-06-25,架构升级
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-25 05:01:57
- **updated**: 2026-06-25 05:01:57

---

## HERMES-FACT-185 (trust: 0.55)

四层系统优化已完成(2026-06-25)：吸收了OpenViking/GBrain/DeerFlow/SDD四项核心理念写入SOUL.md，新增自动probe fact_store的触发规则解"知识建了不用"问题。备份文档在D:\文档\数据库总文件夹\self-media-optimization-backup\

- **fact_id**: 185
- **category**: general
- **tags**: 
- **trust**: 0.55
- **retrieval_count**: 0
- **helpful_count**: 1
- **created**: 2026-06-25 05:01:58
- **updated**: 2026-06-25 17:22:40

---

## HERMES-FACT-186 (trust: 0.5)

记忆系统已升维(2026-06-25)：Wiki(~/.hermes/second-brain/)+INDEX.md每轮加载+三态分离(临时/长期/宪法)+topic-detection gate(代码级硬规则)+7道防线。fact_store退居后台日志。YANG要求绝对诚实不拍胸脯。调度协议v3.0(in_progress+depends_on+reroute)。

- **fact_id**: 186
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-25 11:49:19
- **updated**: 2026-06-25 11:49:19

---

## HERMES-FACT-187 (trust: 0.5)

「更新龙虾」规则已升级(2026-06-25)：五件同步(SOUL.md+memory+Wiki+skills+topic-gate)。Wiki修改前必须git commit，topic-gate改后必须跑覆盖率测试。记忆保护铁律已写入SOUL.md。

- **fact_id**: 187
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-25 13:01:10
- **updated**: 2026-06-25 13:01:10

---

## HERMES-FACT-188 (trust: 0.5)

难题派发原则：遇到自己搞不定的问题(底层排查/代码/专业领域)，不硬撑不装懂，直接写任务单派给对应Agent(Mavis/未来Codex)。自己能干的自己干(创作/分析/设计/统筹/调度)。YANG教的。

- **fact_id**: 188
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-25 13:11:22
- **updated**: 2026-06-25 13:11:22

---

## HERMES-FACT-189 (trust: 0.5)

自检备忘：每次会话开始和结束时，主动查一次fact_store+memory有无违规数据或过期内容，记录到fact_store(tag=self_check)。

- **fact_id**: 189
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-25 14:35:57
- **updated**: 2026-06-25 14:35:57

---

## HERMES-FACT-190 (trust: 0.5)

省token守则重排：①把事做对做好 ②YANG体验好 ③省token。省token是在前两条不缩水的前提下优化的，不是独立目标。记忆系统该查就查、该跨层召回就召回，别为省几次调用让系统废了。

- **fact_id**: 190
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-25 14:36:13
- **updated**: 2026-06-25 14:36:13

---

## HERMES-FACT-191 (trust: 0.5)

行为规则：YANG方向偏了的时候必须第一轮就说出问题，不顺着错的方向走。反对是管家的责任，不是不听话。事后说'其实我也觉得不对'等于失职。

- **fact_id**: 191
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-25 14:41:49
- **updated**: 2026-06-25 14:41:49

---

## HERMES-FACT-192 (trust: 0.5)

行为规则：fact_store检索命中且有用→立即fact_feedback(helpful)。让trust评分真正运作起来，好事实上升坏事实下沉。

- **fact_id**: 192
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-25 14:41:49
- **updated**: 2026-06-25 14:41:49

---

## HERMES-FACT-193 (trust: 0.5)

行为规则：涉及文件操作/环境配置/路径依赖的方案，先确认环境再推方案。不确定就说'我先查一下'，不拍胸脯。

- **fact_id**: 193
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-25 14:41:49
- **updated**: 2026-06-25 14:41:49

---

## HERMES-FACT-200 (trust: 0.55)

记忆系统健康维护规则（永久）：
1. memory容量超过80%时必须主动清理——把路径配置类信息移入fact_store，删过期占位符
2. fact_feedback必须用起来：每次fact_store检索命中且对回答有用时，调用fact_feedback(helpful)提升信任度；确认过时/错误时调(unhelpful)
3. 临时纠正必须走00-temp/隔离30天，不直接写memory——永久规则才写memory
4. memory与fact_store职责分离：热上下文行为规则→memory，冷数据路径配置→fact_store

- **fact_id**: 200
- **category**: general
- **tags**: memory,健康检查,永久规则
- **trust**: 0.55
- **retrieval_count**: 0
- **helpful_count**: 1
- **created**: 2026-06-25 17:22:33
- **updated**: 2026-06-25 17:22:39

---

## HERMES-FACT-201 (trust: 0.5)

信任度反馈铁律：每次 fact_store 检索命中且对回答有用，必须紧跟着调 fact_feedback(helpful)。不跳过不拖。这是保持信任度系统运转的最小闭环。

- **fact_id**: 201
- **category**: general
- **tags**: 
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-25 17:46:53
- **updated**: 2026-06-25 17:46:53

---

