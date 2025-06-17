/**
 * Advanced language detection for code blocks
 * Combines file extension detection with content-based heuristics
 */

interface LanguagePattern {
  keywords: string[]
  patterns: RegExp[]
  fileExtensions: string[]
}

const LANGUAGE_PATTERNS: Record<string, LanguagePattern> = {
  javascript: {
    keywords: ['function', 'const', 'let', 'var', 'import', 'export', 'class', 'extends'],
    patterns: [
      /\b(async|await)\b/,
      /=>\s*{/,
      /\.(forEach|map|filter|reduce)\(/,
      /console\.(log|error|warn)/,
      /require\(['"`]/,
      /module\.exports/
    ],
    fileExtensions: ['js', 'mjs', 'cjs']
  },
  
  typescript: {
    keywords: ['interface', 'type', 'enum', 'namespace', 'declare', 'abstract'],
    patterns: [
      /:\s*(string|number|boolean|object|any|unknown|never|void)/,
      /\?\s*:/,
      /<[A-Z][A-Za-z0-9]*>/,
      /as\s+[A-Z]/,
      /implements\s+[A-Z]/
    ],
    fileExtensions: ['ts', 'mts', 'cts']
  },
  
  tsx: {
    keywords: ['React', 'Component', 'Props', 'State', 'JSX'],
    patterns: [
      /<[A-Z][A-Za-z0-9]*\s*[^>]*>/,
      /\{.*\}/,
      /className=/,
      /onClick=/,
      /useState|useEffect|useCallback|useMemo/
    ],
    fileExtensions: ['tsx']
  },
  
  jsx: {
    keywords: ['React', 'Component', 'render', 'props', 'state'],
    patterns: [
      /<[A-Z][A-Za-z0-9]*\s*[^>]*>/,
      /className=/,
      /onClick=/,
      /\{.*\}/
    ],
    fileExtensions: ['jsx']
  },
  
  python: {
    keywords: ['def', 'class', 'import', 'from', 'if', 'elif', 'else', 'for', 'while', 'try', 'except'],
    patterns: [
      /def\s+\w+\s*\(/,
      /class\s+\w+/,
      /import\s+\w+/,
      /from\s+\w+\s+import/,
      /#.*$/m,
      /print\(/,
      /\bself\b/
    ],
    fileExtensions: ['py', 'pyw', 'pyi']
  },
  
  java: {
    keywords: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements'],
    patterns: [
      /public\s+(class|interface)/,
      /\bSystem\.out\.print/,
      /\bString\[\]/,
      /\bnew\s+\w+\(/,
      /\@Override/
    ],
    fileExtensions: ['java']
  },
  
  cpp: {
    keywords: ['#include', 'using', 'namespace', 'class', 'struct', 'template'],
    patterns: [
      /#include\s*<.*>/,
      /using\s+namespace/,
      /std::/,
      /cout\s*<</,
      /cin\s*>>/,
      /\btemplate\s*</
    ],
    fileExtensions: ['cpp', 'cxx', 'cc', 'c++']
  },
  
  c: {
    keywords: ['#include', 'int', 'char', 'float', 'double', 'void', 'struct'],
    patterns: [
      /#include\s*<.*\.h>/,
      /printf\(/,
      /scanf\(/,
      /int\s+main\s*\(/,
      /\bmalloc\(/,
      /\bfree\(/
    ],
    fileExtensions: ['c', 'h']
  },
  
  css: {
    keywords: ['@import', '@media', '@keyframes', '@font-face'],
    patterns: [
      /\.[a-zA-Z][\w-]*\s*\{/,
      /#[a-zA-Z][\w-]*\s*\{/,
      /[a-zA-Z-]+\s*:\s*[^;]+;/,
      /@media\s*\(/,
      /rgba?\(/,
      /hsla?\(/
    ],
    fileExtensions: ['css', 'scss', 'sass', 'less']
  },
  
  html: {
    keywords: ['<!DOCTYPE', '<html', '<head', '<body', '<div', '<span'],
    patterns: [
      /<!DOCTYPE\s+html>/i,
      /<\/?\w+[^>]*>/,
      /\s+(class|id|src|href)=/,
      /<!--.*-->/
    ],
    fileExtensions: ['html', 'htm', 'xhtml']
  },
  
  json: {
    keywords: [],
    patterns: [
      /^\s*\{[\s\S]*\}\s*$/,
      /^\s*\[[\s\S]*\]\s*$/,
      /"[^"]*"\s*:\s*("[^"]*"|\d+|true|false|null|\{|\[)/,
    ],
    fileExtensions: ['json', 'jsonc']
  },
  
  sql: {
    keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'],
    patterns: [
      /\bSELECT\s+.*\s+FROM\b/i,
      /\bINSERT\s+INTO\b/i,
      /\bUPDATE\s+.*\s+SET\b/i,
      /\bCREATE\s+(TABLE|INDEX|VIEW)\b/i,
      /\bJOIN\b/i,
      /\bGROUP\s+BY\b/i,
      /\bORDER\s+BY\b/i
    ],
    fileExtensions: ['sql', 'psql', 'mysql']
  },
  
  bash: {
    keywords: ['#!/bin/bash', '#!/bin/sh', 'if', 'then', 'else', 'fi', 'for', 'while', 'do', 'done'],
    patterns: [
      /^#!/,
      /\$\w+/,
      /\$\{.*\}/,
      /\|\s*\w+/,
      /&&|\|\|/,
      /echo\s+/,
      /grep\s+/,
      /find\s+/
    ],
    fileExtensions: ['sh', 'bash', 'zsh', 'fish']
  },
  
  yaml: {
    keywords: [],
    patterns: [
      /^[a-zA-Z_][\w-]*\s*:/m,
      /^\s*-\s+/m,
      /:\s*\|/,
      /:\s*>/,
      /^---\s*$/m,
      /^\.\.\.\s*$/m
    ],
    fileExtensions: ['yaml', 'yml']
  },
  
  markdown: {
    keywords: [],
    patterns: [
      /^#+\s+/m,
      /^\*{1,3}[^*].*[^*]\*{1,3}$/m,
      /^\_{1,3}[^_].*[^_]\_{1,3}$/m,
      /^\s*[-*+]\s+/m,
      /^\s*\d+\.\s+/m,
      /```[\w]*$/m,
      /`[^`]+`/,
      /\[.*\]\(.*\)/
    ],
    fileExtensions: ['md', 'markdown', 'mdown', 'mkdown']
  },

  go: {
    keywords: ['func', 'package', 'import', 'var', 'const', 'type', 'struct', 'interface', 'range', 'go', 'defer'],
    patterns: [
      /package\s+\w+/,
      /func\s+\w+\s*\(/,
      /fmt\.(Print|Println|Printf)/,
      /\bgo\s+func/,
      /\bmake\(/,
      /\brange\b/,
      /\bdefer\b/,
      /\berr\s*:=/,
      /\bnil\b/
    ],
    fileExtensions: ['go']
  },

  rust: {
    keywords: ['fn', 'let', 'mut', 'use', 'mod', 'struct', 'enum', 'impl', 'trait', 'match', 'pub'],
    patterns: [
      /fn\s+\w+\s*\(/,
      /let\s+(mut\s+)?\w+/,
      /\buse\s+\w+::/,
      /\bmatch\s+\w+/,
      /\bResult<.*>/,
      /\bOption<.*>/,
      /\bpub\s+(fn|struct|enum)/,
      /\b&str\b/,
      /\bString::/
    ],
    fileExtensions: ['rs']
  },

  php: {
    keywords: ['<?php', 'function', 'class', 'public', 'private', 'protected', 'namespace', 'use'],
    patterns: [
      /^<\?php/,
      /\$\w+/,
      /function\s+\w+\s*\(/,
      /class\s+\w+/,
      /echo\s+/,
      /\$this->/,
      /->/,
      /namespace\s+\w+/
    ],
    fileExtensions: ['php', 'phtml']
  },

  ruby: {
    keywords: ['def', 'class', 'module', 'require', 'include', 'attr_accessor', 'attr_reader', 'attr_writer'],
    patterns: [
      /def\s+\w+/,
      /class\s+\w+/,
      /module\s+\w+/,
      /@\w+/,
      /\bdo\s*\|.*\|/,
      /\bend\b/,
      /puts\s+/,
      /require\s+['"`]/
    ],
    fileExtensions: ['rb', 'ruby']
  },

  swift: {
    keywords: ['func', 'class', 'struct', 'enum', 'protocol', 'extension', 'import', 'var', 'let'],
    patterns: [
      /func\s+\w+\s*\(/,
      /class\s+\w+/,
      /struct\s+\w+/,
      /\bvar\s+\w+:\s*\w+/,
      /\blet\s+\w+\s*=/,
      /print\(/,
      /\bswitch\s+\w+/,
      /\bguard\s+let/
    ],
    fileExtensions: ['swift']
  },

  kotlin: {
    keywords: ['fun', 'class', 'object', 'interface', 'data', 'sealed', 'abstract', 'open', 'val', 'var'],
    patterns: [
      /fun\s+\w+\s*\(/,
      /class\s+\w+/,
      /data\s+class/,
      /\bval\s+\w+\s*=/,
      /\bvar\s+\w+:\s*\w+/,
      /println\(/,
      /\bwhen\s*\(/,
      /\bnull\b/
    ],
    fileExtensions: ['kt', 'kts']
  }
}

/**
 * Detect programming language from file extension
 */
export function detectLanguageFromExtension(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return null
  
  for (const [language, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    if (patterns.fileExtensions.includes(ext)) {
      return language
    }
  }
  
  return null
}

/**
 * Detect programming language from code content using heuristics
 */
export function detectLanguageFromContent(code: string): string {
  const lines = code.split('\n')
  const firstFewLines = lines.slice(0, 10).join('\n')
  const sampleCode = code.length > 1000 ? code.substring(0, 1000) : code
  
  const scores: Record<string, number> = {}
  
  for (const [language, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    let score = 0
    
    // Check for keywords
    for (const keyword of patterns.keywords) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      const matches = sampleCode.match(regex)
      if (matches) {
        score += matches.length * 2
      }
    }
    
    // Check for patterns
    for (const pattern of patterns.patterns) {
      const matches = sampleCode.match(pattern)
      if (matches) {
        score += matches.length * 3
      }
    }
    
    // Special scoring for specific languages
    if (language === 'json') {
      try {
        JSON.parse(code.trim())
        score += 50 // High confidence for valid JSON
      } catch {
        score = Math.max(0, score - 10) // Penalty for invalid JSON
      }
    }
    
    scores[language] = score
  }
  
  // Find the language with the highest score
  const sortedLanguages = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort(([_, a], [__, b]) => b - a)
  
  if (sortedLanguages.length === 0) {
    return 'text'
  }
  
  const [bestLanguage, bestScore] = sortedLanguages[0]
  
  // Require a minimum confidence threshold
  if (bestScore < 3) {
    return 'text'
  }
  
  return bestLanguage
}

/**
 * Main language detection function that combines extension and content analysis
 */
export function detectLanguage(code: string, filename?: string): string {
  // First try to detect from filename extension
  if (filename) {
    const extensionLanguage = detectLanguageFromExtension(filename)
    if (extensionLanguage) {
      return extensionLanguage
    }
  }
  
  // Fallback to content-based detection
  return detectLanguageFromContent(code)
}

/**
 * Get the display name for a language
 */
export function getLanguageDisplayName(language: string): string {
  const displayNames: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    tsx: 'TypeScript React',
    jsx: 'JavaScript React',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    csharp: 'C#',
    css: 'CSS',
    scss: 'SCSS',
    sass: 'Sass',
    less: 'Less',
    html: 'HTML',
    xml: 'XML',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    sql: 'SQL',
    bash: 'Bash',
    shell: 'Shell',
    sh: 'Shell',
    markdown: 'Markdown',
    md: 'Markdown',
    text: 'Plain Text',
    txt: 'Plain Text'
  }
  
  return displayNames[language.toLowerCase()] || language.toUpperCase()
}

/**
 * Check if a language supports syntax highlighting
 */
export function isLanguageSupported(language: string): boolean {
  const supportedLanguages = [
    'javascript', 'typescript', 'tsx', 'jsx', 'python', 'java', 'cpp', 'c',
    'css', 'scss', 'sass', 'less', 'html', 'xml', 'json', 'yaml', 'yml',
    'sql', 'bash', 'shell', 'sh', 'markdown', 'md'
  ]
  
  return supportedLanguages.includes(language.toLowerCase())
}