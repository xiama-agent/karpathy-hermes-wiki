# Hermes-Karpathy Wiki — Setup Guide

> Set up a long-term memory system for your AI agent based on the Karpathy LLM Wiki paradigm.
> Prerequisites: Hermes Agent, API key (DeepSeek/MiniMax etc.), Node.js 18+, Git.

---

## Step 1: Clone

```bash
git clone https://github.com/xiama-agent/karpathy-hermes-wiki.git
```

Or download ZIP from the GitHub page.

## Step 2: Placement

Place the `hermes-brain` directory where your Hermes Agent can access it:

```
Windows recommended:
  C:\Users\<username>\AppData\Local\hermes\hermes-brain\
```

## Step 3: Configure SOUL.md

SOUL.md defines the agent's constitution. Copy or symlink it to the Hermes read path:

```bash
copy SOUL.md C:\Users\<username>\AppData\Local\hermes\SOUL.md
```

> Modify SOUL.md with your own identity, preferences, and paths before use.
> Do not push your personalized SOUL.md to a public repository.

## Step 4: Configure AGENTS.md

AGENTS.md is the operations manual — it defines how the agent reads, writes, and maintains the Wiki.

Place it where your Hermes Agent can read it, or specify the path in your Hermes config.

## Step 5: Initialize

```bash
cd hermes-brain
node lint.js              # Health check
node update-trust.js       # Initialize trust scores
```

## Step 6: Verify

Test that the memory system is operational:

```
Query: "What are the iron laws?"
Expected: 8 iron laws from wiki/00-core/core-iron-laws.md

Query: "What are my project paths?"
Expected: User-specific paths from wiki/02-knowledge/paths.md
```

---

## Directory Reference

| Purpose | File |
|:--------|:-----|
| Agent constitution | `SOUL.md` |
| Operations protocol | `AGENTS.md` |
| Knowledge index | `index.md` (auto-injected) |
| Add new knowledge | New `.md` file in `wiki/02-knowledge/` |
| Full system check | `node lint.js` |
| Backup | `git commit` (built-in versioning) |
| Version info | `VERSION.md` |

---

## FAQ

**Q: Does this require Hermes Agent?**
The Wiki architecture is designed for Hermes Agent but can be adapted to any AI agent with file system access and long-context support. You will need to implement the SOUL.md → AGENTS.md → Wiki read chain in your agent runtime.

**Q: Can I use this commercially?**
AGPL v3 license. Free for personal use. Contact the author for commercial licensing.

**Q: How do I customize it?**
Edit `01-yang/` files with your own identity, projects, and paths. Remove irrelevant pages from `02-knowledge/`.

**Q: How to roll back?**
Every Git commit is a checkpoint. `git log` to view history, `git checkout <hash>` to revert.
