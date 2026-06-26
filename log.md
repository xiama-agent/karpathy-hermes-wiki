# 操作日志（每日归档）

> 每日一个文件：log/{YYYY-MM-DD}.md
> 格式：## [{HH:mm:ss}] {operation} | {description}
> 操作类型：init / ingest / query / lint / audit / forget / soul-sync / recall-fail

**当前日期**: 2026-06-26  
**今日日志**: [[log/2026-06-26.md]]

## 检索日志

`ash
# 最近 5 条
ls -t log/*.md | head -5 | xargs cat | grep '^## \[' | tail -5
`

## 自动归档规则

- 每天 23:59 自动 git commit 当日 log
- 30 天前的 log 自动压缩为季度归档
## [01:29:51] maintenance | update-trust initialized: HERMES-FACT-015 trust += 0.1, retrieval_count += 1
