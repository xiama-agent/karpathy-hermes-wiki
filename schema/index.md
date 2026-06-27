# Schema 约束层

> 对应 SOUL.md v4.0 卡帕西架构：`schema/index/log` 是结构化约束层。

## 内容

| 文件 | 作用 |
|------|------|
| [trust-score-standard.md](trust-score-standard.md) | 信任分规范 + 当前覆盖统计 |

## 范围

schema/ 存放所有 Wiki 页面的结构化规则——frontmatter 字段规范、信任分标准、标签约束、命名规范。不存放具体知识内容。

## 维护

- schema 文件被修改时需跑 lint 验证一致性
- 信任分覆盖率低于 90% 时触发提醒
