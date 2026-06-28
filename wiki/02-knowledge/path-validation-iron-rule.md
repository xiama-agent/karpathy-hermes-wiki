---
id: PATH_VALIDATION_IRON_RULE_20260626
title: 路径验证铁律
type: rule
tags: [path-validation, file-system, desktop, safety]
trust: 0.3
use_cases: ["文件路径验证", "桌面路径处理", "避免路径重定向错误", " capability-reference skill使用"]
source: 回忆录候选 | 2026-06-26
last_updated: 2026-06-26
---

# 路径验证铁律

> Auto-extracted by transform hook, awaiting Mavis/knowledge-extractor cron to consolidate.

## 路径验证铁律

### 1. `capability-reference` — 路径验证铁律（🔄 patch）

### 2. 使用前验证铁律

> **路径可能因用户文件夹重定向而改变（Desktop最常见）**

## 详细说明

在使用任何文件路径时，必须遵循以下验证规则：

1. **验证路径存在性** - 在使用路径前必须检查路径是否存在
2. **处理Desktop重定向** - 特别注意用户文件夹可能重定向到Desktop
3. **动态路径处理** - 不要硬编码路径，应该动态获取
4. **错误处理** - 如果路径不存在，应该提供明确的错误信息

## 应用场景

- `capability-reference` skill 使用前验证路径
- 任何文件操作前的路径检查
- 避免因Windows路径重定向导致的错误

## 最佳实践

```markdown
1. 检查路径是否存在
2. 处理可能的路径重定向
3. 提供友好的错误信息
4. 记录路径变更历史
```

## 相关链接
- [[02-knowledge/paths]] — 上级/相关页面
- [[02-knowledge/paths-conventions]] — 路径命名约定
