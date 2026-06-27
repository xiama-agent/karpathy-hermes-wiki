# Karpathy-Hermes-Wiki

**A production-ready AI Agent memory system based on the Karpathy LLM Wiki paradigm.**

A complete, version-controlled knowledge architecture for long-term AI memory — constitution, operations manual, and knowledge base, integrated into a single maintainable system.

---

## Architecture

```
hermes-brain/
├── SOUL.md               ← Constitution: agent identity, hard rules, behavior constraints
├── AGENTS.md             ← Operations manual: read/write/maintain Wiki protocol
├── IRON_RULES.md         ← 7 runtime invariants
├── RUNTIME.md            ← 11 runtime directives
├── index.md              ← Auto-injected directory (loaded every session)
│
├── wiki/                 ← Knowledge base (1.1 MB)
│   ├── 00-core/          ← Constitutional layer: iron laws, identity, preferences, triggers
│   ├── 01-yang/          ← User layer: profile, projects, budget, environment
│   ├── 02-knowledge/     ← Knowledge layer: 33 domain-specific pages
│   ├── 03-system/        ← System layer: architecture audits, cron jobs, operations
│   ├── 04-facts/         ← Fact layer: curated fact index
│   └── 98-archive/       ← Archive
│
├── schema/               ← Constraint layer: trust score standards
├── raw/                  ← Raw source materials
├── log/                  ← Operation logs
│
├── ingest.js             ← Material ingestion pipeline
├── recall.js             ← Semantic recall
├── lint.js               ← Full system check
├── forget-cycle.js       ← Forgetting cycle
└── ... (23 operational scripts)
```

The system implements three memory layers:

1. **Raw Layer** — Unprocessed inputs (conversation transcripts, external sources, skill files)
2. **Wiki Layer** — Curated, version-controlled knowledge organized by category
3. **Schema Layer** — Structural constraints (trust scores, frontmatter standards, naming conventions)

---

## Quick Start

```bash
# Clone
git clone https://github.com/xiama-agent/karpathy-hermes-wiki.git

# Initialize
cd karpathy-hermes-wiki
node lint.js              # Full health check
node update-trust.js       # Initialize trust scores

# Configure SOUL.md and AGENTS.md paths for your AI agent
```

> **Full setup guide (10 minutes)** → [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)

---

## Key Features

| Feature | Description |
|:--------|:------------|
| **Constitutional memory** | SOUL.md defines immutable identity rules and behavior constraints |
| **Topic-gated responses** | Every response declares which Wiki pages were referenced |
| **Trust scoring** | Each page has a frontmatter `trust` field determining answer confidence |
| **Self-maintaining** | 23 automated scripts for ingestion, linting, backup, RSI tracking |
| **Git versioning** | Every modification is committed — full rollback capability |
| **Multi-agent protocol** | Dispatcher + executor architecture for agent collaboration |

---

## License

[AGPL v3](LICENSE) — Free for personal use. Contact the author for commercial use.

---

## References

- Andrej Karpathy's LLM Wiki concept
- Hermes Agent by Nous Research
