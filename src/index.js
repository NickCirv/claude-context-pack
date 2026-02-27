/**
 * index.js — public API for claude-context-pack
 * Re-exports core functions for programmatic use.
 */

export { scan } from './scanner.js'
export { analyze, getCategoryBreakdown } from './analyzer.js'
export { generateClaudeIgnore, generateClaudeMd, writeFiles } from './generator.js'
export { printScanReport, printSuggestReport, printCompareReport } from './formatter.js'
