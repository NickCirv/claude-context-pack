#!/usr/bin/env node

/**
 * claude-context-pack CLI
 * Analyze context size, detect bloat, generate .claudeignore + CLAUDE.md
 */

import { Command } from 'commander'
import chalk from 'chalk'
import path from 'path'
import { scan } from '../src/scanner.js'
import { analyze } from '../src/analyzer.js'
import { generateClaudeIgnore, generateClaudeMd, writeFiles } from '../src/generator.js'
import { printScanReport, printSuggestReport } from '../src/formatter.js'

const program = new Command()

program
  .name('claude-context-pack')
  .description('Analyze context size, detect bloat, generate .claudeignore + CLAUDE.md')
  .version('1.0.0')

program
  .command('scan')
  .description('Scan project and show context size breakdown')
  .argument('[dir]', 'directory to scan', '.')
  .action((dir) => {
    const rootDir = path.resolve(dir)
    const result = scan(rootDir)
    const analysis = analyze(result)
    printScanReport(result, analysis)
  })

program
  .command('suggest')
  .description('Show recommended .claudeignore patterns without writing')
  .argument('[dir]', 'directory to scan', '.')
  .action((dir) => {
    const rootDir = path.resolve(dir)
    const result = scan(rootDir)
    const analysis = analyze(result)
    printSuggestReport(analysis)
  })

program
  .command('generate')
  .description('Write .claudeignore and CLAUDE.md to project root')
  .argument('[dir]', 'directory to scan', '.')
  .option('--overwrite', 'replace existing files', false)
  .option('--no-claudemd', 'skip generating CLAUDE.md')
  .option('--no-claudeignore', 'skip generating .claudeignore')
  .action((dir, opts) => {
    const rootDir = path.resolve(dir)
    const result = scan(rootDir)
    const analysis = analyze(result)

    const claudeignore = opts.claudeignore !== false
      ? generateClaudeIgnore(analysis, result)
      : null

    const claudeMd = opts.claudemd !== false
      ? generateClaudeMd(result, analysis)
      : null

    const { written, skipped } = writeFiles(rootDir, { claudeignore, claudeMd }, { overwrite: opts.overwrite })

    console.log('')
    if (written.length > 0) {
      for (const f of written) {
        console.log(chalk.green(`  ✓ ${f} written`))
      }
    }
    if (skipped.length > 0) {
      for (const f of skipped) {
        console.log(chalk.yellow(`  ⊘ ${f} already exists (use --overwrite to replace)`))
      }
    }
    if (written.length === 0 && skipped.length === 0) {
      console.log(chalk.gray('  Nothing to write.'))
    }
    console.log('')
  })

program.parse()
