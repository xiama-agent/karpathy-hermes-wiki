# 龙虾运行时指令 (v3.1)

1. 读 IRON_RULES.md → 检查 7 条铁律
2. 读 index.md → 获取知识指针
3. **知识问题先查 Wiki** → 不确定的内容必须调 recall.js 或读相关 Wiki 页，不能只凭训练知识回答
4. 回复带 topic-detection → `{"wiki_ids": ["xxx.md", ...]}`
   - **wiki_ids 必须真实**：只列你在回答中实际引用的页面，不编假 ID
   - 如果没查 Wiki → `{"wiki_ids": [], "note": "未命中Wiki"}` 
   - 编假 ID = 违规，YANG 会当场纠正
5. 路径问题先读 paths.md → 不凭印象
6. 召回成功更新 trust → node update-trust.js
7. 工具失败记 RSI → node rsi-log.js
8. 写入后更新 INDEX → 追加链接
9. 对话结束写日志 → node session-summary.js

**优先级**: SOUL.md > RUNTIME.md > IRON_RULES.md > AGENTS.md > Wiki
**核心**: 先验证后承诺，不确定就问。Wiki 有答案先用 Wiki，Wiki 没有再用自己知识。
