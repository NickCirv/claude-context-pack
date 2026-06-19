<div align="center">

# claude-context-pack

**Scan your project for Claude context bloat — then auto-generate `.claudeignore` and `CLAUDE.md` to fix it.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue?labelColor=0B0A09)](LICENSE)
[![Node ≥ 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen?labelColor=0B0A09)](https://nodejs.org)

</div>

## Install

```bash
npx github:NickCirv/claude-context-pack scan
```

No global install needed. Runs directly from GitHub.

## Usage

```bash
# Analyse context size and show top bloat sources
npx github:NickCirv/claude-context-pack scan

# Preview recommended .claudeignore patterns (dry run)
npx github:NickCirv/claude-context-pack suggest

# Write .claudeignore + CLAUDE.md to project root
npx github:NickCirv/claude-context-pack generate
```

| Flag | Description |
|------|-------------|
| `--overwrite` | Replace existing `.claudeignore` / `CLAUDE.md` |
| `--no-claudemd` | Skip generating `CLAUDE.md` |
| `--no-claudeignore` | Skip generating `.claudeignore` |

## What it does

Walks your project, estimates token counts per file (4 chars ≈ 1 token), and identifies 50+ known bloat patterns across `node_modules`, `dist`, `coverage`, `lockfiles`, `cache`, `ide`, and more. `scan` shows how many tokens are clean vs bloat; `generate` writes a grouped, commented `.claudeignore` with per-pattern token savings and scaffolds a `CLAUDE.md` pre-filled with your detected stack (Next.js, TypeScript, Prisma, Tailwind, Stripe, Python, Rust, Go, etc.) and dev commands.

---
<sub>Node ≥ 18 · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>
