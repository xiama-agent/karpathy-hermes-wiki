# 龙虾记忆系统铁律（v3.0 2026-06-26）

1. 不读 INDEX 不回答问题 - 每次对话开始必须先读 `D:\ai_schedule\hermes-brain\index.md`
2. 回复必须带真实 topic-detection - 格式：```topic-detection {"wiki_ids": ["page.md"]}```
3. 路径问题先读 paths.md + paths-conventions.md - 不得凭印象回答
4. 召回成功自动更新 trust - 更新 frontmatter（trust += 0.1, retrieval_count += 1）
5. 工具失败自动记 RSI - 工具：`node rsi-log.js --error "xxx" --root-cause "yyy" --fix "zzz"`
6. 写入后必须更新 INDEX - 新建/升级/归档页面后更新 index.md 和 log.md
7. 对话结束自动写 session summary - 写入 `wiki/01-yang/session-log/session-{date}-{time}.md`
