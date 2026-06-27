# 🦞 龙虾记忆系统 · 搭建教程

> 从零开始，把你的 AI 智能体装上"大脑"。
> 基于 Karpathy LLM Wiki 范式 + Hermes Agent 引擎。

---

## 你需要什么

| 前置条件 | 说明 |
|:--------|:-----|
| **Hermes Agent** | 桌面版（推荐）或 CLI 版。下载：[hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com) |
| **API Key** | DeepSeek、MiniMax M3 或其他兼容模型的 API Key |
| **Node.js 18+** | 运行运维脚本（`node lint.js` 等） |
| **Git** | 版本控制（可选但推荐） |

---

## 第一步：获取大脑

```bash
# 克隆
git clone https://github.com/3866654034-stack/hermes-brain.git
```

或者直接下载 ZIP：GitHub 页面 → Code → Download ZIP

## 第二步：放在哪里

把 `hermes-brain` 目录放到 Hermes Agent 能访问的位置：

```
Windows 推荐：
  C:\Users\你的用户名\AppData\Local\hermes\hermes-brain\

或者任意位置，只要后续路径配得对。
```

## 第三步：配置 SOUL.md

Hermes Agent 会读取 `SOUL.md` 作为身份宪法。

把仓库根目录的 `SOUL.md` **复制或软链接** 到 Hermes 的读取位置：

```bash
# 如果你用的是 Hermes 桌面版，默认路径：
copy SOUL.md C:\Users\你的用户名\AppData\Local\hermes\SOUL.md
```

> ⚠️ `SOUL.md` 中含有你的个性化信息（用户名、偏好、路径），**不要直接上传到自己 GitHub 的公开仓库**。本仓库的 SOUL.md 是模板。

## 第四步：配置 AGENTS.md

`AGENTS.md` 是操作手册，告诉 AI 怎么读、写、维护 Wiki。

同样放到 Hermes 能读取的位置，或在 Hermes 配置中指定路径。

## 第五步：初始化知识库

```bash
cd hermes-brain

# 安装依赖（如果有 package.json）
npm install

# 运行首次 lint，检查健康状况
node lint.js

# 初始化信任分
node update-trust.js

# 看看效果——问你的 AI："我的项目有哪些？"
```

## 第六步：验证

```
你：我有哪些项目？
AI：（应该回答你的项目清单 → 来自 wiki/01-yang/projects.md）

你：我的桌面路径是什么？
AI：（应该回答准确的路径 → 来自 wiki/02-knowledge/paths.md）

你：龙虾的铁律有哪些？
AI：（应该背诵 8 条铁律 → 来自 wiki/00-core/core-iron-laws.md）
```

如果 AI 能回答这些，大脑就装好了。

---

## 目录速查

| 你想做什么 | 看哪个文件 |
|:----------|:----------|
| 修改 AI 身份 | `SOUL.md` |
| 修改操作规则 | `AGENTS.md` |
| 查有哪些知识 | `index.md`（自动注入） |
| 加新知识 | 在 `wiki/02-knowledge/` 新建 `.md` 文件 |
| 做全量检查 | `node lint.js` |
| 备份 | `git commit`（自带版本控制） |
| 查看版本 | `VERSION.md` |

---

## 常见问题

**Q：一定要用 Hermes Agent 吗？**
不一定。这套 Wiki 架构理论上适用于任何支持长上下文 + 文件系统访问的 AI Agent。但你需要在相应 Agent 中实现 SOUL.md → AGENTS.md → Wiki 的读取链路。

**Q：可以商用吗？**
本项目采用 AGPL v3 许可证。个人免费，商用请联系作者。

**Q：怎么定制成自己的？**
把 `01-yang/` 目录下的文件改成你自己的信息（用户名、项目、路径、预算），更新 `02-knowledge/` 中对你没用的知识页。

**Q：出问题了怎么回滚？**
Git 的每一次提交都是一个检查点。`git log` 看历史，`git checkout <commit-hash>` 回退。
