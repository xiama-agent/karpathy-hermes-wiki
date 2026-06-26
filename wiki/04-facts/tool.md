---
id: HERMES-FACT-TOOL-001
title: 工具配置与路径 (26 条)
type: fact-collection
tags: [facts, tool]
trust: 0.65
use_cases: ["查询 tool 类事实", "YANG 提到 tool 相关"]
source: fact_store_export.json
last_updated: 2026-06-26
---

# 工具配置与路径

> 来自 fact_store 全量导出，共 26 条。按 fact_id 排序。

---

## HERMES-FACT-003 (trust: 0.65)

[参考] Windows技术坑：API密钥在AppData/Local/Hermes/私密池独立于config.yaml。MCP启动时加载重启才生效。YAML args必须列表非字符串。TEMP/TMP已改D:\Temp(用户级)。

- **fact_id**: 3
- **category**: tool
- **tags**: windows,config
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-15 05:55:19
- **updated**: 2026-06-15 08:39:14

---

## HERMES-FACT-005 (trust: 0.65)

[参考] 阿里云8.163.23.217：运行Hermes+DeepSeek V4 Flash+WeChat(ilink)。DNS fixed。Gateway通过nohup启动。QR auth需指定headers。

[SSH细节] 用户root, 密钥~/.ssh/id_ed25519_mimo。连接: ssh -i ~/.ssh/id_ed25519_mimo root@8.163.23.217。Tailscale IP:100.66.248.108。限制: 无VNC/RDP, 不支持桌面画面查看。

- **fact_id**: 5
- **category**: tool
- **tags**: server,aliyun,wechat,aliyun-ssh,connection,second-brain/03-knowledge/aliyun
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-15 05:55:21
- **updated**: 2026-06-15 08:39:15

---

## HERMES-FACT-006 (trust: 0.65)

[路径] Obsidian笔记库：D:\文档\数据库总文件夹\obsidian\。MCP 127.0.0.1:27124。功能：读/搜/写/改/每日笔记/反向链接/标签查询。

- **fact_id**: 6
- **category**: tool
- **tags**: obsidian,notes
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-15 05:55:22
- **updated**: 2026-06-15 08:39:33

---

## HERMES-FACT-042 (trust: 0.65)

Hermes Desktop GUI (Electron) 更新时需设置 ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ 环境变量，否则 Electron 二进制在国内下不动

- **fact_id**: 42
- **category**: tool
- **tags**: hermes, update, electron, mirror
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-16 04:38:43
- **updated**: 2026-06-16 04:38:43

---

## HERMES-FACT-045 (trust: 0.65)

[规则] RSS定时任务(8edf356115bd)当前为paused状态。在声称"RSS能自动推送"之前必须先检查cron状态。blogwatcher-cli工具本身能用，但定时推送未恢复。

- **fact_id**: 45
- **category**: tool
- **tags**: rss,cron,self-correction
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-16 11:32:04
- **updated**: 2026-06-16 11:32:04

---

## HERMES-FACT-050 (trust: 0.65)

[工具] OpenCode v1.17.7：npm i -g opencode-ai装的是~155MB编译二进制(非可读源码)。Windows推荐WSL。有ACP协议(子Agent集成)+MCP+Session导出/导入。检测npm包是否二进制：查package.json的optionalDependencies有无平台名(如opencode-windows-x64)。

- **fact_id**: 50
- **category**: tool
- **tags**: tool,opencode,coding-agent,second-brain/03-knowledge/reasonix
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-16 11:42:23
- **updated**: 2026-06-16 11:42:23

---

## HERMES-FACT-052 (trust: 0.65)

[路径详情] SOUL.md=C:\Users\YANG\AppData\Local\hermes\SOUL.md。Obsidian=D:\文档\数据库总文件夹\obsidian\，MCP=127.0.0.1:27124(重启生效)。桌面=D:\Users\YANG\Desktop(只留.lnk)。软件安装=D:\Tools\。TEMP/TMP=D:\Temp。npm全局=D:\Tools\npm-global\。阿里云=8.163.23.217。OCR脚本=D:\Tools\HermesScripts\ocr.py。MIMO_API_KEY在.env(看图用xiaomi/mimo-v2-omni)。

- **fact_id**: 52
- **category**: tool
- **tags**: paths,configuration,second-brain/01-yang/desktop,second-brain/03-knowledge/tools-overview
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-16 11:42:25
- **updated**: 2026-06-16 11:42:25

---

## HERMES-FACT-063 (trust: 0.65)

自动任务程序统一存放目录: D:\Tools\auto_tasks\。当前任务清单: [夜间锁屏] night_lock.py, 密码3941, 等待10分钟, 锁屏时间段22:30~12:00(跨日), 开机自启注册表 HKCU\...\Run\NightLock→pythonw.exe D:\Tools\auto_tasks\night_lock.py, 含紧急关机按钮。新增自动任务时按此格式追加。

- **fact_id**: 63
- **category**: tool
- **tags**: auto-tasks, paths, tool,second-brain/03-knowledge/tools-overview
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-17 07:15:59
- **updated**: 2026-06-17 07:15:59

---

## HERMES-FACT-065 (trust: 0.65)

MiniMax M3集成：通过curl直连api.minimax.chat/v1调MiniMax-M3，从Reasonix的.env读MINIMAX_API_KEY。不写代码只统筹。mmx-cli(1.0.16)区域验证失败不可用。¥49/月Token Plan套餐。编程任务走M3直联。

- **fact_id**: 65
- **category**: tool
- **tags**: reasonix, integration, paths,second-brain/03-knowledge/minimax-m3
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-18 11:52:22
- **updated**: 2026-06-24 08:35:20

---

## HERMES-FACT-069 (trust: 0.65)

[工具已装] Agent-Reach(Hermes venv内) + PaddleOCR已装 + agent-reach skill已装。Jina Reader(https://r.jina.ai/URL)可用。agent-reach doctor可查渠道状态。

- **fact_id**: 69
- **category**: tool
- **tags**: tool,agent-reach,ocr,paddleocr,second-brain/03-knowledge/ai-schedule
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-18 12:19:08
- **updated**: 2026-06-18 12:19:08

---

## HERMES-FACT-070 (trust: 0.65)

[视觉分析] DeepSeek Flash不支持图片输入。看图走MiMo CLI(mimo code analyze-image/path)，提取文字走OCR脚本(D:\Tools\HermesScripts\ocr.py)。PaddleOCR已装作为优先方案。

- **fact_id**: 70
- **category**: tool
- **tags**: tool,vision,ocr,paths,second-brain/03-knowledge/vision-ocr,second-brain/03-knowledge/paths
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-18 12:21:38
- **updated**: 2026-06-18 12:21:38

---

## HERMES-FACT-086 (trust: 0.65)

[工具] bb-browser v0.14.2 npm全局已装。复用Chrome登录态访问36平台103命令。调用:bb-browser site <平台>/<命令>。MCP模式:npx bb-browser --mcp。SOUL.md自动触发规则已更新(需登录→用bb-browser)。2026-06-20装。

- **fact_id**: 86
- **category**: tool
- **tags**: tool,browser,bb-browser,second-brain/03-knowledge/bb-browser
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-19 17:21:08
- **updated**: 2026-06-19 17:21:08

---

## HERMES-FACT-107 (trust: 0.65)

[工具] AI工具链：Reasonix v1.9全功能coding agent调DeepSeek LLM。MiMo Code CLI(@mimo-ai/cli)已装，API Key在.env(MIMO_API_KEY)。PATH已加D:/Tools/npm-global/。

- **fact_id**: 107
- **category**: tool
- **tags**: ai,reasonix,mimo
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-19 19:23:03
- **updated**: 2026-06-19 19:23:03

---

## HERMES-FACT-118 (trust: 0.65)

[工具] 硅基流动文生图已接入Hermes。provider名=siliconflow，插件路径=C:\Users\YANG\AppData\Local\hermes\plugins\image_gen\siliconflow\，调用硅基流动API https://api.siliconflow.cn/v1/images/generations，认证用GLM_API_KEY。支持模型：Kolors(默认)、Z-Image-Turbo、ERNIE-Image-Turbo、Qwen-Image。用法：Hermes对话中直接描述需求，我会自动调用image_generate工具出图。图片保存在$HERMES_HOME/cache/images/。

- **fact_id**: 118
- **category**: tool
- **tags**: image_gen,siliconflow,kolors,plugin,second-brain/03-knowledge/image-gen,second-brain/04-system/hermes-hooks
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-20 07:19:54
- **updated**: 2026-06-20 07:19:54

---

## HERMES-FACT-121 (trust: 0.65)

[工具] APK打包能力（Capacitor Android）：项目路径 D:\文档\数据库总文件夹\项目工作区\概念小卡片。工具链：JDK=C:\Program Files\Microsoft\jdk-21.0.6.7-hotspot，Android SDK=D:\Android，Gradle=D:\Android\gradle-8.14.3\bin\gradle（注意：项目下gradlew wrapper会因SSL证书问题下载失败，改用本地Gradle），Cap CLI=node_modules\.bin\cap.cmd，npm=C:\Program Files\nodejs\npm，Capacitor 8.4.0。打包流程：①改完代码→②npm install 新插件（如需要）→③npx cap sync android（同步www到android assets）→④cd android && set JAVA_HOME & set ANDROID_HOME && gradle assembleDebug --no-daemon→⑤APK输出在 android\app\build\outputs\apk\debug\app-debug.apk。打包前需确保 capacitor.config.json 的 webDir=www。构建用时约29秒。旧脚本路径写死 D:\xyy-app 已过时。

- **fact_id**: 121
- **category**: tool
- **tags**: apk_build,capacitor,android,paths,second-brain/03-knowledge/apk-build,second-brain/01-yang/desktop
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-20 07:49:59
- **updated**: 2026-06-25 14:53:49

---

## HERMES-FACT-127 (trust: 0.65)

Reasonix 双通道安装：CLI版 v1.10.0-rc.1（npm i -g reasonix@next），GUI桌面版 v1.10.0.0（D:\Tools\Reasonix.exe\reasonix.exe）。CLI调用：reasonix run "需求"。

- **fact_id**: 127
- **category**: tool
- **tags**: reasonix, tool, version,second-brain/03-knowledge/reasonix
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-20 13:55:07
- **updated**: 2026-06-20 13:55:07

---

## HERMES-FACT-149 (trust: 0.65)

[工具] 龙虾语义记忆系统 v1.0。路径:C:\Users\YANG\.hermes\semantic_memory.py。本地嵌入(fastembed+BAAI/bge-small-en-v1.5,384维,ONNX免费离线)。存储(sqlite-vec向量库)。命令:python semantic_memory.py <retain|recall|promote|list|stats|check>。retain存记忆(支持pattern_key)，recall语义搜索，promote检测晋升(3次/30天)。首次调用自动下载模型(需hf-mirror.com)。DB:~/.hermes/semantic_memory.db。

- **fact_id**: 149
- **category**: tool
- **tags**: tool,semantic_memory,vector,embedding,second-brain/01-yang/communication
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-20 17:04:24
- **updated**: 2026-06-20 17:04:24

---

## HERMES-FACT-153 (trust: 0.65)

MarkItDown（微软出品）已安装，路径：/c/Users/YANG/AppData/Local/hermes/hermes-agent/venv/Scripts/markitdown。支持PDF/Word/Excel/PPT/图片OCR/音频转文字/YouTube字幕转markdown。有MCP Server可集成AI工具。处理文档时优先使用。

- **fact_id**: 153
- **category**: tool
- **tags**: markitdown,文档转换,microsoft,mcp,second-brain/03-knowledge/markitdown
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-21 13:32:55
- **updated**: 2026-06-21 13:32:55

---

## HERMES-FACT-154 (trust: 0.65)

MCP集成：Hermes支持通过Model Context Protocol连接外部工具服务器。可用`hermes mcp catalog`查看精选MCP目录，`hermes mcp install <name>`一键安装。已安装n8n MCP桥（等待n8n实例配置）。MCP工具以"mcp__<server>__<tool>"前缀命名，不会与内置工具冲突。

- **fact_id**: 154
- **category**: tool
- **tags**: hermes,mcp,integration
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-21 14:21:52
- **updated**: 2026-06-21 14:21:52

---

## HERMES-FACT-155 (trust: 0.65)

n8n（n8n-io/n8n，开源fair-code协议，400+集成）：自托管工作流自动化平台，替代Zapier/Make。免费自托管（社区版无限制工作流和执行）。支持Docker部署，原生AI节点+LangChain集成。可以与Hermes的MCP桥对接（`hermes mcp install n8n`已装）。YANG若自建n8n实例，我可以通过MCP管理其工作流。

- **fact_id**: 155
- **category**: tool
- **tags**: n8n,automation,workflow,free
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-21 14:21:53
- **updated**: 2026-06-21 14:21:53

---

## HERMES-FACT-156 (trust: 0.65)

Hermes插件系统：`hermes plugins list`查看所有插件。插件是bundled（内置）或user（用户安装）。disk-cleanup插件已启用（自动清理临时文件）。web-ddgs插件已启用（DuckDuckGo网页搜索）。还有大量平台适配器（Telegram/Discord/Slack/WhatsApp等）、搜索后端（Brave/Exa/Firecrawl/Tavily等）、图像/视频生成后端等插件可选启用。

- **fact_id**: 156
- **category**: tool
- **tags**: hermes,plugins,extension,second-brain/03-knowledge/mcp-plugins
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-21 14:21:54
- **updated**: 2026-06-21 14:21:54

---

## HERMES-FACT-157 (trust: 0.65)

agentskills.io：开放的AI Agent技能市场，Hermes兼容。技能是SKILL.md格式，可社区共享。Hermes自带Skills Hub兼容此格式。技能可以在Hermes间移植共享。

- **fact_id**: 157
- **category**: tool
- **tags**: skills,agentskills,marketplace
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-21 14:21:55
- **updated**: 2026-06-21 14:21:55

---

## HERMES-FACT-160 (trust: 0.65)

已启用插件记录：disk-cleanup v2.0（自动清理临时文件，生命周期钩子，bundled），web-ddgs v1.0（DuckDuckGo搜索后端，bundled）。生效时间：下次会话。启用方式：`hermes plugins enable <name>`。注意：插件是opt-in的，默认不加载。

- **fact_id**: 160
- **category**: tool
- **tags**: mcp,plugins,enabled,second-brain/03-knowledge/mcp-plugins
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-21 14:24:39
- **updated**: 2026-06-21 14:24:39

---

## HERMES-FACT-167 (trust: 0.65)

[参考] Xpoz MCP社交智能: 社交媒体情报MCP服务器，可集成Claude Code等Agent。功能包括社交平台数据采集+分析。备选集成方案，当前已有bb-browser+60s API够用，未来需要更深度社交数据分析时考虑。

- **fact_id**: 167
- **category**: tool
- **tags**: reference,mcp,social-intelligence
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-22 11:06:36
- **updated**: 2026-06-22 11:06:36

---

## HERMES-FACT-179 (trust: 0.65)

[参考] MiniMax M3编程调用方式：从Reasonix的.env读取MINIMAX_API_KEY，curl直调https://api.minimax.chat/v1/chat/completions，模型名MiniMax-M3。source /c/Users/YANG/AppData/Roaming/reasonix/.env加载key。适合：写脚本/重构/抓数据/修Bug。我不直接写代码，只统筹。

- **fact_id**: 179
- **category**: tool
- **tags**: minimax,m3,coding,api,second-brain/03-knowledge/minimax-m3,second-brain/03-knowledge/reasonix
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-24 08:35:46
- **updated**: 2026-06-24 08:35:46

---

## HERMES-FACT-181 (trust: 0.65)

AI调度系统完整协议：YANG电脑多AI协作。龙虾=默认入口/管家总调度，Mavis(MiniMax Code)=执行手(GUI/桌面/原生编程)。调度根目录D:\ai_schedule\，目录结构：tasks/(mavis/codex/unclaimed)、state/(tasks_state.json)、results/(mavis/codex)、discovery/(paths/pitfalls/workflows)、notifications/(pending.yaml)、dialogue/、scripts/。任务模板分quick(一句话)和full(多步)。状态机：pending→claimed→in_progress→done/partial/failed/rerouted。超时：claimed 5分钟，in_progress 30分钟。自路由最多跳1次。discovery双向同步。YANG直达权。通知：win10toast弹窗+pending.yaml降级。后台cronjob：watchdog每10分钟扫超时，cleanup每1小时删已完成超1h的任务。

- **fact_id**: 181
- **category**: tool
- **tags**: ai_schedule,orchestration,mavis,protocol
- **trust**: 0.5
- **retrieval_count**: 0
- **helpful_count**: 0
- **created**: 2026-06-24 10:22:39
- **updated**: 2026-06-24 10:22:39

---



## 相关链接

- [[general]]
- [[user_pref]]
- [[paths]]
