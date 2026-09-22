# claude-context-pack — documentation research

Reviewed 21 September 2026. Public GitHub source only.

## Revision and scope

- Commit: [`de870f12ec6f04769581aed23abeed9cf6a80eee`](https://github.com/NickCirv/claude-context-pack/commit/de870f12ec6f04769581aed23abeed9cf6a80eee).
- Tree: `d48de9c547d080a32bc2cdc8f57fcb6e4a12dc25`; truncated: `false`.
- Capture: 10 of 10 eligible text files; all eligible text files.
- Method: package and entrypoint inspection, implementation-interface review, targeted behavior/limitation inspection, and test-source review. This is not an exhaustive correctness or security audit.
- Commands run against repository code: **none**. External services, deployment and npm publication were not verified.

## Claim and evidence map

| Documentation claim | Pinned evidence | Assessment |
| --- | --- | --- |
| Runtime, executable and development commands | [package.json](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/package.json) | Source declaration inspected; runtime unverified |
| Scans a project for context-heavy files and drafts Claude configuration files from local source structure. | [bin/pack.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/bin/pack.js) · [src/index.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/index.js) | Implementation interfaces inspected; behavior not executed |
| Scan and suggestions; stack/key-file detection; selective CLAUDE.md and ignore-file generation. | [bin/pack.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/bin/pack.js), [src/analyzer.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/analyzer.js), [src/formatter.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/formatter.js), [src/generator.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/generator.js), [src/index.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/index.js), [src/scanner.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/scanner.js) | Source-backed scope, not a test result |
| Token counts are character-based estimates. Generated CLAUDE.md and .claudeignore files are suggestions that need review; generate writes files and --overwrite replaces existing content. | [bin/pack.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/bin/pack.js), [src/analyzer.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/analyzer.js), [src/formatter.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/formatter.js), [src/generator.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/generator.js), [src/index.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/index.js), [src/scanner.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/scanner.js) | Material limits documented; service compatibility remains open |

## Documentation inventory and disposition

| Existing document | Decision |
| --- | --- |
| [README.md](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/README.md) | Rewritten with source-specific purpose, direct checkout setup, limitations and verification status. Old section fragments retained where practical. |

Added `docs/REFERENCE.md` for the observed implementation and command surface, and this research record. Protected license and attribution files remain in their original locations without edits. No source or product UI was changed.

## Quality dimensions

| Dimension | Status | Evidence / next step |
| --- | --- | --- |
| Pinned provenance | Verified | Captured commit, tree and per-file hashes recorded below |
| Interface documentation | Partially verified | Source inspection only; run clean-checkout quickstart |
| Runtime behavior | Unverified | No repository execution in this review |
| Test results | Unverified | Existing tests were not run |
| Deployment / package availability | Unverified | No remote publish or live-service check |
| Visual / link checks | Unverified | Portfolio renderer and independent QA are separate from this authoring step |

## Unresolved issues

Token counts are character-based estimates. Generated CLAUDE.md and .claudeignore files are suggestions that need review; generate writes files and --overwrite replaces existing content.

A meaningful behavioral test suite was not established from the capture.

## Captured source inventory

This lists captured provenance, not a claim that every line received a full audit. Binary/generated/excluded files are outside the eligible text capture.

| File | SHA-256 | Bytes |
| --- | --- | --- |
| [LICENSE](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/LICENSE) | `68729cab364d82364078b08d8580ccfa51dc69c81a7d64e8d8d47a1da6c9349d` | 1072 |
| [README.md](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/README.md) | `c7ee2bf79e987282d02b4ac3ed1ceb8c7db24d061565af0bbc9ff990192854a9` | 1634 |
| [package.json](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/package.json) | `1c8b8547414eb768ae1674f32b6aacda030582a3153dc0bedacacc7ab7799845` | 1039 |
| [.github/workflows/ci.yml](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/.github/workflows/ci.yml) | `433fbf65635a767ef5cd787147104c248d0cea6bbd6523c6c862f915e0e3206a` | 384 |
| [bin/pack.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/bin/pack.js) | `e49bdcce603108288234437a108016947fc86dbc174a94ca864bcee9849bdf0a` | 2543 |
| [src/analyzer.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/analyzer.js) | `beb030bd33715f45ad4a92460a17479510fa3a08424fc12c6b78b2b30df22dda` | 8432 |
| [src/formatter.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/formatter.js) | `1f9fffff283e6fbcbbcc43ae3814ac03a350f1c20f45e8a5d5888b94194d9215` | 8316 |
| [src/generator.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/generator.js) | `cfd8fb1bb388ca09cac3a7ce049696dd0b59794b5f6cfdc5ed7a5f367023e0bb` | 9723 |
| [src/index.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/index.js) | `f0aadfe2bfcdf49625a5eaa470cc7ec6e70becc17cd45a7d02d4f5cdf968a412` | 382 |
| [src/scanner.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/scanner.js) | `db39e2f34c7f84caedcf8d0727240f26b77675dd7fecd0aede713cb2f0243806` | 5246 |
