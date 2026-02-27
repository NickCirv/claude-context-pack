/**
 * analyzer.js — identifies bloat sources and categorizes findings
 */

import path from 'path'

// Known bloat patterns with categories and reasons
const BLOAT_PATTERNS = [
  // Dependency directories
  { pattern: /^node_modules(\/|$)/, category: 'dependencies', reason: 'npm packages — never needed in context', priority: 'critical' },
  { pattern: /^vendor(\/|$)/, category: 'dependencies', reason: 'vendored dependencies — exclude entirely', priority: 'critical' },
  { pattern: /^\.pnpm(\/|$)/, category: 'dependencies', reason: 'pnpm store — never needed in context', priority: 'critical' },
  { pattern: /^bower_components(\/|$)/, category: 'dependencies', reason: 'Bower dependencies — exclude entirely', priority: 'critical' },

  // Build output
  { pattern: /^(dist|build|out|output)(\/|$)/, category: 'build', reason: 'compiled output — Claude reads source, not build', priority: 'critical' },
  { pattern: /^\.next(\/|$)/, category: 'build', reason: 'Next.js build cache — not source code', priority: 'critical' },
  { pattern: /^\.nuxt(\/|$)/, category: 'build', reason: 'Nuxt.js build cache', priority: 'critical' },
  { pattern: /^\.svelte-kit(\/|$)/, category: 'build', reason: 'SvelteKit build cache', priority: 'critical' },
  { pattern: /^\.vite(\/|$)/, category: 'build', reason: 'Vite cache', priority: 'high' },
  { pattern: /^\.turbo(\/|$)/, category: 'build', reason: 'Turborepo cache', priority: 'high' },
  { pattern: /^\.parcel-cache(\/|$)/, category: 'build', reason: 'Parcel build cache', priority: 'high' },
  { pattern: /^storybook-static(\/|$)/, category: 'build', reason: 'Storybook build output', priority: 'high' },

  // Test coverage
  { pattern: /^coverage(\/|$)/, category: 'coverage', reason: 'test coverage reports — generated data', priority: 'high' },
  { pattern: /^\.nyc_output(\/|$)/, category: 'coverage', reason: 'NYC/Istanbul coverage output', priority: 'high' },
  { pattern: /^htmlcov(\/|$)/, category: 'coverage', reason: 'Python coverage HTML report', priority: 'high' },

  // Python
  { pattern: /^__pycache__(\/|$)/, category: 'python', reason: 'Python bytecode cache', priority: 'critical' },
  { pattern: /\.pyc$/, category: 'python', reason: 'compiled Python bytecode', priority: 'critical' },
  { pattern: /^(venv|\.venv|env|\.env)(\/|$)/, category: 'python', reason: 'Python virtual environment — use requirements.txt instead', priority: 'critical' },
  { pattern: /^\.tox(\/|$)/, category: 'python', reason: 'tox testing environments', priority: 'high' },
  { pattern: /\.egg-info(\/|$)/, category: 'python', reason: 'Python package build metadata', priority: 'high' },

  // Lock files (large, generated)
  { pattern: /^package-lock\.json$/, category: 'lockfiles', reason: 'npm lock file — thousands of lines of generated JSON', priority: 'high' },
  { pattern: /^yarn\.lock$/, category: 'lockfiles', reason: 'Yarn lock file — large generated file', priority: 'high' },
  { pattern: /^pnpm-lock\.yaml$/, category: 'lockfiles', reason: 'pnpm lock file — large generated file', priority: 'high' },
  { pattern: /^Cargo\.lock$/, category: 'lockfiles', reason: 'Rust lock file — large generated file', priority: 'medium' },
  { pattern: /^Gemfile\.lock$/, category: 'lockfiles', reason: 'Ruby lock file — large generated file', priority: 'medium' },
  { pattern: /^composer\.lock$/, category: 'lockfiles', reason: 'PHP Composer lock file — large generated file', priority: 'medium' },
  { pattern: /^poetry\.lock$/, category: 'lockfiles', reason: 'Poetry lock file — large generated file', priority: 'medium' },
  { pattern: /^uv\.lock$/, category: 'lockfiles', reason: 'uv lock file — large generated file', priority: 'medium' },

  // Logs
  { pattern: /^(logs?|\.logs?)(\/|$)/, category: 'logs', reason: 'log files — runtime output, not source', priority: 'high' },
  { pattern: /\.log$/, category: 'logs', reason: 'log file', priority: 'high' },

  // IDE and editor
  { pattern: /^\.idea(\/|$)/, category: 'ide', reason: 'JetBrains IDE config — not project code', priority: 'medium' },
  { pattern: /^\.vscode(\/|$)/, category: 'ide', reason: 'VS Code config — not project code', priority: 'medium' },
  { pattern: /^\.cursor(\/|$)/, category: 'ide', reason: 'Cursor editor config', priority: 'medium' },

  // OS files
  { pattern: /^\.DS_Store$/, category: 'os', reason: 'macOS metadata file', priority: 'medium' },
  { pattern: /^Thumbs\.db$/, category: 'os', reason: 'Windows thumbnail cache', priority: 'medium' },

  // Test fixtures / snapshots (large)
  { pattern: /^__snapshots__(\/|$)/, category: 'test', reason: 'Jest snapshots — often very large', priority: 'medium' },
  { pattern: /^fixtures?(\/|$)/, category: 'test', reason: 'test fixtures — usually large data files', priority: 'low' },

  // Misc generated
  { pattern: /^\.cache(\/|$)/, category: 'cache', reason: 'generic cache directory', priority: 'high' },
  { pattern: /^tmp(\/|$)/, category: 'cache', reason: 'temp files', priority: 'high' },
  { pattern: /^\.temp(\/|$)/, category: 'cache', reason: 'temp files', priority: 'high' },
  { pattern: /^public\/build(\/|$)/, category: 'build', reason: 'compiled public assets', priority: 'high' },
]

const LARGE_FILE_THRESHOLD = 10 * 1024 // 10KB in bytes

/**
 * Categorize all files in the scan result.
 * Returns analysis object with suggestions.
 */
export function analyze(scanResult) {
  const { files } = scanResult

  const bloatFiles = []
  const largeFiles = []
  const suggestions = new Map() // pattern → { pattern, reason, category, priority, tokenSavings, fileCount }

  for (const file of files) {
    // Check for known bloat patterns
    let matched = false
    for (const bp of BLOAT_PATTERNS) {
      if (bp.pattern.test(file.relPath)) {
        matched = true
        const key = bp.pattern.toString()
        if (!suggestions.has(key)) {
          suggestions.set(key, {
            pattern: getIgnorePattern(file.relPath, bp.pattern),
            reason: bp.reason,
            category: bp.category,
            priority: bp.priority,
            tokenSavings: 0,
            fileCount: 0,
          })
        }
        const s = suggestions.get(key)
        s.tokenSavings += file.tokens
        s.fileCount++
        bloatFiles.push({ ...file, bloatReason: bp.reason, bloatCategory: bp.category })
        break
      }
    }

    // Check for large files (>10KB) that aren't already flagged as bloat
    if (!matched && !file.isBinary && file.size > LARGE_FILE_THRESHOLD) {
      largeFiles.push(file)
    }
  }

  // Sort suggestions by token savings
  const sortedSuggestions = [...suggestions.values()].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (pDiff !== 0) return pDiff
    return b.tokenSavings - a.tokenSavings
  })

  // Sort large files by tokens
  largeFiles.sort((a, b) => b.tokens - a.tokens)

  const bloatTokens = bloatFiles.reduce((sum, f) => sum + f.tokens, 0)
  const cleanTokens = scanResult.totalTokens - bloatTokens

  return {
    suggestions: sortedSuggestions,
    bloatFiles,
    largeFiles: largeFiles.slice(0, 20), // top 20
    bloatTokens,
    cleanTokens,
    totalTokens: scanResult.totalTokens,
    reductionPercent: scanResult.totalTokens > 0
      ? Math.round((bloatTokens / scanResult.totalTokens) * 100)
      : 0,
  }
}

/**
 * Derive a human-friendly .claudeignore pattern from a matched path.
 */
function getIgnorePattern(relPath, bpPattern) {
  // For directory patterns, return the top-level directory
  const parts = relPath.replace(/\\/g, '/').split('/')
  const topLevel = parts[0]

  // If it's a file extension pattern
  const extMatch = bpPattern.toString().match(/\\\.(\w+)\$/)
  if (extMatch) return `*.${extMatch[1]}`

  // If top-level looks like a known directory
  return topLevel + (parts.length > 1 ? '/' : '')
}

/**
 * Get category breakdown for reporting.
 */
export function getCategoryBreakdown(analysis) {
  const byCategory = {}

  for (const s of analysis.suggestions) {
    if (!byCategory[s.category]) {
      byCategory[s.category] = { tokenSavings: 0, fileCount: 0, patterns: [] }
    }
    byCategory[s.category].tokenSavings += s.tokenSavings
    byCategory[s.category].fileCount += s.fileCount
    byCategory[s.category].patterns.push(s.pattern)
  }

  return byCategory
}
