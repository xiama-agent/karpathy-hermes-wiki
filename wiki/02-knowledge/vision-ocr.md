---
id: HERMES-VIS-001
title: 视觉与OCR能力
type: capability
tags: [vision, ocr, mimo]
use_cases: ["看图", "OCR", "图片内容提取", "截图分析"]
source: fact_store#22, #70, #69, 2026-06-28实测
related_skill: software-development/hermes-vision-capabilities
trust: 0.95
last_updated: 2026-06-28
---

# 视觉与OCR

## 看图（MiMo CLI — 主力方案）

**免费，免API Key，无需配置。**

```bash
npx @mimo-ai/cli run "描述这张图片：<图片路径>"
```

### 使用场景
- 用户截图/发图要求分析内容
- vision_analyze 工具因模型不支持而失败时 → **自动降级走 MiMo**
- 需要对比设计稿和实际产出的差异

### 注意事项
- 首次调用冷启动 30-60 秒（npx 拉包），后续快
- MiMo Auto 匿名通道免费，无需任何 Key
- 支持中文描述，输出也是中文
- 路径用绝对路径，Windows 风格（`C:\Users\...`）或 POSIX 风格（`/c/Users/...`）都行

### 与 vision_analyze 的关系
| 方式 | 状态 | 说明 |
|------|------|------|
| Hermes 自带 `vision_analyze` 工具 | ❌ 当前模型不支持 | DeepSeek V4 Flash 无原生视觉能力 |
| MiMo CLI（npx） | ✅ 完全可用，免费 | 走 MiMo Auto 匿名通道 |
| **自动 fallback** | **应执行** | `vision_analyze` 报错后 → 自动用 MiMo CLI 重试 |

## OCR 文字提取
- PaddleOCR（优先，已装）
- OCR 脚本：`python D:\Tools\HermesScripts\ocr.py`
- EasyOCR 有冲突待修，Tesseract 未装

## 文档图片转文字
- MarkItDown 支持图片 OCR 转文字
- 在 Hermes venv 中可用

## 行为规则（2026-06-28 确立）

当用户发图片或要求"看图"时：
1. **先试 `vision_analyze`**（如果模型支持）
2. 如果 `vision_analyze` 报错（如不支持图片）→ **不回复"我看不了"**
3. **立即降级**：`npx @mimo-ai/cli run "描述这张图片：路径"`
4. 这才是正确的响应路径

## 相关链接
- [[02-knowledge/tools-overview]] — 上级/相关页面
- [[02-knowledge/self-media]] — 自媒体工作流
- [[02-knowledge/image-gen]] — 文生图能力
- [[02-knowledge/bb-browser]] — bb-browser 浏览器工具
- software-development/hermes-vision-capabilities — 技能文件（命令细节）
