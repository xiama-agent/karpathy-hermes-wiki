---
id: HERMES-SYS-DC-001
title: disk-cleanup 插件
type: system
tags: [plugin, disk-cleanup, hermes]
trust: 1.0
use_cases: ["disk-cleanup 是什么", "磁盘清理", "plugin 配置"]
source: config.yaml plugins.enabled
last_updated: 2026-06-26
---

# disk-cleanup 插件

## 状态
- ✅ **已启用**：在 `config.yaml` 的 `plugins.enabled` 列表中
- 用途：自动清理临时文件，节省磁盘空间
- 触发：定期 cron + 手动触发

## 相关配置
```yaml
plugins:
  enabled:
  - disk-cleanup
  - topic_gate
  - web/ddgs
```

## 相关链接
- [[hermes-hooks]]
- [[cron-jobs]]
- [[mcp-plugins]]
