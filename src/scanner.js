/**
 * scanner.js — filesystem walker + token estimator
 * Reads .claudeignore if present, respects patterns, walks all files.
 */

import fs from 'fs'
import path from 'path'

const CHARS_PER_TOKEN = 4

// Default ignore patterns (always applied)
const DEFAULT_IGNORE = [
  '.git',
  '.DS_Store',
  'Thumbs.db',
]

// Binary file extensions — excluded from token count (still flagged)
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.bmp', '.tiff', '.svg',
  '.mp4', '.mp3', '.wav', '.ogg', '.mov', '.avi', '.mkv',
  '.pdf', '.zip', '.tar', '.gz', '.7z', '.rar',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.exe', '.dll', '.so', '.dylib', '.bin',
  '.pyc', '.pyo', '.class',
  '.db', '.sqlite', '.sqlite3',
])

/**
 * Parse .claudeignore (or .gitignore-style) file into pattern list.
 * Returns array of string patterns.
 */
function parseIgnoreFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
  } catch {
    return []
  }
}

/**
 * Simple glob-style pattern matcher.
 * Supports: exact match, leading **, trailing /*, directory names.
 */
function matchesPattern(relPath, pattern) {
  // Normalize separators
  const normalized = relPath.replace(/\\/g, '/')
  const p = pattern.replace(/\\/g, '/')

  // Directory match: pattern with no slash matches any path segment
  if (!p.includes('/')) {
    const parts = normalized.split('/')
    return parts.some(part => minimatch(part, p))
  }

  // Leading **/ glob
  if (p.startsWith('**/')) {
    const suffix = p.slice(3)
    return normalized.endsWith(suffix) || normalized.includes('/' + suffix)
  }

  // Trailing /* glob
  if (p.endsWith('/*')) {
    const prefix = p.slice(0, -2)
    return normalized.startsWith(prefix + '/')
  }

  // Trailing /** glob
  if (p.endsWith('/**')) {
    const prefix = p.slice(0, -3)
    return normalized.startsWith(prefix + '/') || normalized === prefix
  }

  // Exact match
  return normalized === p || normalized.startsWith(p + '/')
}

/**
 * Minimal glob helper for single path segment (no slashes).
 */
function minimatch(str, pattern) {
  if (pattern === '*') return true
  if (!pattern.includes('*')) return str === pattern
  const escaped = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')
  return new RegExp('^' + escaped + '$').test(str)
}

/**
 * Check if a path should be ignored given a list of patterns.
 */
function isIgnored(relPath, patterns) {
  for (const pattern of patterns) {
    if (matchesPattern(relPath, pattern)) return true
  }
  return false
}

/**
 * Estimate tokens from a file's character count.
 */
function estimateTokens(chars) {
  return Math.ceil(chars / CHARS_PER_TOKEN)
}

/**
 * Walk the filesystem from rootDir, collecting file info.
 * Returns { files, totalTokens, totalBytes, ignoredCount, binaryCount }
 */
export function scan(rootDir, options = {}) {
  const { verbose = false } = options

  // Load ignore patterns
  const claudeignorePath = path.join(rootDir, '.claudeignore')
  const gitignorePath = path.join(rootDir, '.gitignore')

  const userPatterns = fs.existsSync(claudeignorePath)
    ? parseIgnoreFile(claudeignorePath)
    : []

  const gitPatterns = options.respectGitignore !== false && fs.existsSync(gitignorePath)
    ? parseIgnoreFile(gitignorePath)
    : []

  const allPatterns = [...DEFAULT_IGNORE, ...gitPatterns, ...userPatterns]

  const files = []
  let ignoredCount = 0
  let binaryCount = 0

  function walk(dir) {
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relPath = path.relative(rootDir, fullPath)

      if (isIgnored(relPath, allPatterns)) {
        ignoredCount++
        continue
      }

      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        const isBinary = BINARY_EXTENSIONS.has(ext)

        let size = 0
        let tokens = 0

        try {
          const stat = fs.statSync(fullPath)
          size = stat.size

          if (!isBinary) {
            // Read content to get actual char count
            const content = fs.readFileSync(fullPath, 'utf8')
            tokens = estimateTokens(content.length)
          }
        } catch {
          // unreadable file — skip token count
        }

        if (isBinary) {
          binaryCount++
        }

        files.push({
          path: fullPath,
          relPath,
          name: entry.name,
          ext,
          size,
          tokens,
          isBinary,
        })
      }
    }
  }

  walk(rootDir)

  const totalTokens = files.reduce((sum, f) => sum + f.tokens, 0)
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0)

  // Sort by tokens descending
  files.sort((a, b) => b.tokens - a.tokens)

  return {
    files,
    totalTokens,
    totalBytes,
    ignoredCount,
    binaryCount,
    rootDir,
    hasClaudeignore: fs.existsSync(claudeignorePath),
    hasGitignore: fs.existsSync(gitignorePath),
  }
}
