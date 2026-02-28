# claude-context-pack

Analyze your project's Claude context size, find the bloat, and generate a `.claudeignore` + `CLAUDE.md` to fix it.

<p align="center">
  <img src="https://img.shields.io/npm/v/claude-context-pack.svg" alt="npm version" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="node >= 18" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" />
</p>

## Why

When Claude Code reads your project, it sees everything you haven't explicitly excluded. A typical Node.js repo without a `.claudeignore` sends `node_modules`, `dist`, `package-lock.json`, coverage reports, and IDE config files into Claude's context window — burning tokens on noise instead of your actual source code.

`claude-context-pack` scans your project, estimates token counts per file, identifies the bloat patterns (50+ known categories), and generates a production-ready `.claudeignore` with explanations for every entry. It also scaffolds a `CLAUDE.md` template pre-filled with your detected tech stack and key files.

## Quick Start

```bash
# Analyze current project
npx claude-context-pack scan

# See what to add to .claudeignore
npx claude-context-pack suggest

# Generate .claudeignore + CLAUDE.md automatically
npx claude-context-pack generate
```

## What It Does

- Walks your entire project and estimates token count per file (4 chars = 1 token)
- Respects existing `.claudeignore` and `.gitignore` when scanning
- Identifies 50+ known bloat patterns across categories: `dependencies`, `build`, `coverage`, `python`, `lockfiles`, `logs`, `ide`, `os`, `test`, `cache`
- Flags large files (>10KB) that aren't caught by known patterns
- Generates a `.claudeignore` with grouped, commented entries and token savings per pattern
- Scaffolds a `CLAUDE.md` template with your detected stack (Next.js, Express, TypeScript, Tailwind, Prisma, Stripe, Python, Rust, Go, etc.) and key entry files
- Detects common dev commands (npm scripts, make targets, docker compose) for CLAUDE.md

## Example Output

```
$ npx claude-context-pack scan

  claude-context-pack  — context size analysis
  ─────────────────────────────────────────────

  Project
  Root:          /Users/you/my-app
  Files scanned: 3,847
  Ignored:       124
  Binary:        38 (excluded from tokens)
  .claudeignore: not found
  .gitignore:    found

  Context Size
  Total tokens:  842.3K (~3.1 MB)

  ████████████████████████████████  842K total
  Clean:   74.1K (9%)
  Bloat:  768.2K (91%)  ← this is what you can eliminate

  Top bloat sources:
  node_modules/     critical    712,400 tokens    (2,341 files)
  dist/             critical     31,200 tokens    (   89 files)
  package-lock.json high          8,800 tokens    (    1 file)
  coverage/         high          7,400 tokens    (   23 files)

  Run: npx claude-context-pack generate
```

## Commands

### `scan [dir]`

Scan the project and show a context size breakdown. Respects `.claudeignore` and `.gitignore`.

### `suggest [dir]`

Show a list of recommended `.claudeignore` patterns with token savings and reasons — without writing anything.

### `generate [dir]`

Write `.claudeignore` and `CLAUDE.md` to the project root. Skips files that already exist (use `--overwrite` to replace).

| Option | Description | Default |
|--------|-------------|---------|
| `--overwrite` | Replace existing `.claudeignore` and `CLAUDE.md` | skip existing |
| `--no-claudemd` | Skip generating `CLAUDE.md` | generates both |
| `--no-claudeignore` | Skip generating `.claudeignore` | generates both |

## Install Globally

```bash
npm i -g claude-context-pack
```

## License

MIT
