# Hermes-Karpathy Wiki — v1.0

> Release date: 2026-06-27
> Architecture: Karpathy LLM Wiki (Constitution → Operations → Knowledge Base)
> Engine: Hermes Agent + DeepSeek V4 Flash
> Platform: Windows 10

---

## Architecture

```
hermes-brain/
├── SOUL.md         ← Constitution
├── AGENTS.md       ← Operations manual
├── index.md        ← Auto-injected directory
├── VERSION.md      ← This file
│
├── wiki/           ← Knowledge base
├── schema/         ← Constraint layer
├── raw/            ← Raw materials
├── log/            ← Operation logs
└── tools/          ← Utilities
```

## Metrics (at release)

| Metric | Value |
|:-------|:------|
| Wiki pages | 88 (69 active, 43 cleaned) |
| Trust score coverage | 100% |
| Operational scripts | 23 |
| Git commits | 25 |

## Changelog

### v1.0 (2026-06-27)

- First public release
- Karpathy three-layer architecture implemented (raw/wiki/schema)
- 8 operational iron laws finalized
- 43 temp candidates cleaned (646 KB)
- 64 legacy fact store items archived
- core-iron-laws.md promoted from placeholder (trust 0.3 → 1.0)
