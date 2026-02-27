/**
 * formatter.js — pretty terminal output with size bars
 */

import chalk from 'chalk'

const BAR_WIDTH = 30

/**
 * Render a horizontal bar representing a fraction.
 */
function bar(fraction, width = BAR_WIDTH) {
  const filled = Math.round(Math.min(fraction, 1) * width)
  const empty = width - filled
  return chalk.magenta('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
}

/**
 * Format token count with K suffix.
 */
function fmtTokens(n) {
  if (n >= 1000000) return chalk.bold((n / 1000000).toFixed(1) + 'M')
  if (n >= 1000) return chalk.bold((n / 1000).toFixed(1) + 'K')
  return chalk.bold(String(n))
}

/**
 * Format bytes.
 */
function fmtBytes(n) {
  if (n >= 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + ' MB'
  if (n >= 1024) return (n / 1024).toFixed(1) + ' KB'
  return n + ' B'
}

/**
 * Priority color.
 */
function priorityColor(priority) {
  switch (priority) {
    case 'critical': return chalk.red(priority)
    case 'high': return chalk.yellow(priority)
    case 'medium': return chalk.cyan(priority)
    case 'low': return chalk.gray(priority)
    default: return chalk.gray(priority)
  }
}

/**
 * Print the scan report (used by `scan` command).
 */
export function printScanReport(scanResult, analysis) {
  const { files, totalTokens, totalBytes, ignoredCount, binaryCount, hasClaudeignore, hasGitignore } = scanResult

  console.log('')
  console.log(chalk.bold.white('  claude-context-pack') + chalk.gray('  — context size analysis'))
  console.log(chalk.gray('  ─────────────────────────────────────────────'))
  console.log('')

  // Summary
  console.log(chalk.bold('  Project'))
  console.log(`  ${chalk.gray('Root:')}         ${chalk.white(scanResult.rootDir)}`)
  console.log(`  ${chalk.gray('Files scanned:')} ${chalk.white(files.length.toLocaleString())}`)
  console.log(`  ${chalk.gray('Ignored:')}      ${chalk.white(ignoredCount.toLocaleString())}`)
  console.log(`  ${chalk.gray('Binary:')}       ${chalk.white(binaryCount.toLocaleString())} ${chalk.gray('(excluded from tokens)')}`)
  console.log(`  ${chalk.gray('.claudeignore:')} ${hasClaudeignore ? chalk.green('found') : chalk.yellow('not found')}`)
  console.log(`  ${chalk.gray('.gitignore:')}   ${hasGitignore ? chalk.green('found') : chalk.gray('not found')}`)
  console.log('')

  // Token totals
  console.log(chalk.bold('  Context Size'))
  console.log(`  Total tokens:  ${fmtTokens(totalTokens)} ${chalk.gray('(~' + fmtBytes(totalBytes) + ')')}`)

  if (analysis.bloatTokens > 0) {
    const cleanFraction = analysis.cleanTokens / totalTokens
    const bloatFraction = analysis.bloatTokens / totalTokens

    console.log('')
    console.log(`  ${bar(1)}`)
    console.log(`  ${chalk.green('Clean:  ')} ${fmtTokens(analysis.cleanTokens)} ${chalk.gray('(' + Math.round(cleanFraction * 100) + '%)')}`)
    console.log(`  ${chalk.red('Bloat:  ')} ${fmtTokens(analysis.bloatTokens)} ${chalk.gray('(' + analysis.reductionPercent + '%) — could be eliminated')}`)
    console.log('')

    const grade = gradeContext(analysis.reductionPercent)
    console.log(`  Context grade: ${grade.color(grade.label)}  ${chalk.gray(grade.note)}`)
  } else {
    console.log('')
    console.log(`  Context grade: ${chalk.green('A+')}  ${chalk.gray('No bloat detected — great shape!')}`)
  }

  console.log('')
  console.log(chalk.gray('  ─────────────────────────────────────────────'))
  console.log('')

  // Top files by token count
  const topFiles = files.filter(f => !f.isBinary && f.tokens > 0).slice(0, 15)
  if (topFiles.length > 0) {
    console.log(chalk.bold('  Largest Files'))
    console.log('')

    const maxTokens = topFiles[0].tokens

    for (const f of topFiles) {
      const fraction = f.tokens / maxTokens
      const label = f.relPath.length > 40
        ? '...' + f.relPath.slice(-37)
        : f.relPath.padEnd(40)
      const isBloat = analysis.bloatFiles.some(b => b.relPath === f.relPath)
      const fileColor = isBloat ? chalk.red : chalk.white
      console.log(`  ${fileColor(label)}  ${fmtTokens(f.tokens).padStart(8)} ${bar(fraction, 15)}${isBloat ? chalk.red(' ✗') : ''}`)
    }
    console.log('')
  }

  // Quick hint
  if (analysis.suggestions.length > 0) {
    console.log(chalk.gray(`  Run ${chalk.white('npx claude-context-pack suggest')} to see what to ignore.`))
    console.log(chalk.gray(`  Run ${chalk.white('npx claude-context-pack generate')} to create .claudeignore + CLAUDE.md.`))
  }

  console.log('')
}

/**
 * Print the suggest report (used by `suggest` command).
 */
export function printSuggestReport(analysis) {
  console.log('')
  console.log(chalk.bold.white('  Suggestions'))
  console.log(chalk.gray('  ─────────────────────────────────────────────'))
  console.log('')

  if (analysis.suggestions.length === 0) {
    console.log(chalk.green('  No bloat detected. Your context is clean!'))
    console.log('')
    return
  }

  console.log(`  ${chalk.bold(analysis.suggestions.length)} patterns to add to .claudeignore:`)
  console.log(`  Potential savings: ${fmtTokens(analysis.bloatTokens)} tokens (${analysis.reductionPercent}% reduction)`)
  console.log('')

  for (const s of analysis.suggestions) {
    const savings = s.tokenSavings > 0
      ? chalk.gray(' saves ~' + fmtTokens(s.tokenSavings) + ' tokens')
      : ''
    console.log(
      `  ${chalk.yellow(s.pattern.padEnd(35))} ${priorityColor(s.priority).padEnd(6)} ${savings}`
    )
    console.log(`  ${chalk.gray('└─ ' + s.reason)}`)
    console.log('')
  }

  // Large files not yet flagged
  if (analysis.largeFiles.length > 0) {
    console.log(chalk.bold('  Large files (>10KB, review manually):'))
    console.log('')
    for (const f of analysis.largeFiles.slice(0, 10)) {
      console.log(`  ${chalk.cyan(f.relPath.padEnd(45))} ${fmtTokens(f.tokens)}`)
    }
    console.log('')
  }

  console.log(chalk.gray(`  Run ${chalk.white('npx claude-context-pack generate')} to apply all suggestions automatically.`))
  console.log('')
}

/**
 * Print the compare report (before vs after).
 */
export function printCompareReport(before, after) {
  console.log('')
  console.log(chalk.bold.white('  Before vs After'))
  console.log(chalk.gray('  ─────────────────────────────────────────────'))
  console.log('')

  const saved = before.totalTokens - after.totalTokens
  const pct = before.totalTokens > 0 ? Math.round((saved / before.totalTokens) * 100) : 0

  console.log(`  ${chalk.gray('Before:')}  ${fmtTokens(before.totalTokens)} tokens  (${before.files.length} files)`)
  console.log(`  ${chalk.gray('After:')}   ${fmtTokens(after.totalTokens)} tokens  (${after.files.length} files)`)
  console.log('')

  if (saved > 0) {
    console.log(`  ${chalk.green('Saved:')}   ${fmtTokens(saved)} tokens  (${pct}% reduction)`)

    const beforeBar = bar(1, BAR_WIDTH)
    const afterFraction = after.totalTokens / before.totalTokens
    const afterBar = bar(afterFraction, BAR_WIDTH)

    console.log('')
    console.log(`  ${chalk.gray('Before')}  ${beforeBar}  ${fmtTokens(before.totalTokens)}`)
    console.log(`  ${chalk.gray('After ')}  ${afterBar}  ${fmtTokens(after.totalTokens)}`)
  } else if (saved === 0) {
    console.log(chalk.gray('  No change in context size.'))
  } else {
    console.log(chalk.yellow(`  Context grew by ${fmtTokens(Math.abs(saved))} tokens.`))
  }

  console.log('')
}

/**
 * Grade the context health.
 */
function gradeContext(bloatPercent) {
  if (bloatPercent === 0) return { label: 'A+', color: chalk.green, note: 'Perfect' }
  if (bloatPercent < 5) return { label: 'A', color: chalk.green, note: 'Very clean' }
  if (bloatPercent < 15) return { label: 'B', color: chalk.cyan, note: 'Some bloat' }
  if (bloatPercent < 30) return { label: 'C', color: chalk.yellow, note: 'Notable bloat' }
  if (bloatPercent < 50) return { label: 'D', color: chalk.red, note: 'Significant bloat' }
  return { label: 'F', color: chalk.bold.red, note: 'Critical bloat — fix immediately' }
}
