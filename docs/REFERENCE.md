# claude-context-pack — implementation reference

Source revision: `de870f12ec6f04769581aed23abeed9cf6a80eee`. This reference records source declarations; it is not a transcript of a successful run.

## Entrypoint and runtime

[package.json](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/package.json) declares `bin/pack.js`. Node.js `>=18.0.0` and npm.

Executable mapping: `claude-context-pack` → `./bin/pack.js`.

## Supported workflow

Scan and suggestions; stack/key-file detection; selective CLAUDE.md and ignore-file generation.

Token counts are character-based estimates. Generated CLAUDE.md and .claudeignore files are suggestions that need review; generate writes files and --overwrite replaces existing content.

## Declared command interface

Options belong to the preceding command in the linked source; they are not necessarily global.

| Kind | Declaration | Source description | Source |
| --- | --- | --- | --- |
| command | `scan` | Scan project and show context size breakdown | [bin/pack.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/bin/pack.js) |
| argument | `[dir]` | directory to scan | [bin/pack.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/bin/pack.js) |
| command | `suggest` | Show recommended .claudeignore patterns without writing | [bin/pack.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/bin/pack.js) |
| argument | `[dir]` | directory to scan | [bin/pack.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/bin/pack.js) |
| command | `generate` | Write .claudeignore and CLAUDE.md to project root | [bin/pack.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/bin/pack.js) |
| argument | `[dir]` | directory to scan | [bin/pack.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/bin/pack.js) |
| option | `--overwrite` | replace existing files | [bin/pack.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/bin/pack.js) |
| option | `--no-claudemd` | skip generating CLAUDE.md | [bin/pack.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/bin/pack.js) |
| option | `--no-claudeignore` | skip generating .claudeignore | [bin/pack.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/bin/pack.js) |

## Option defaults

These are literal defaults or parsers declared by the command builder; flags belong to their command as shown above.

| Option | Declared default / parser |
| --- | --- |
| `--overwrite` | `false` |

## Package scripts

| Script | Exact command |
| --- | --- |
| `start` | `node bin/pack.js` |
| `test` | `node bin/pack.js scan` |

## Implementation sources

[src/index.js](https://github.com/NickCirv/claude-context-pack/blob/de870f12ec6f04769581aed23abeed9cf6a80eee/src/index.js).

## Verification boundary

No repository code, tests, network operation, hook installer or migration was executed for this review. Source inspection supports the documented interface; runtime correctness and external-service compatibility remain unverified.
