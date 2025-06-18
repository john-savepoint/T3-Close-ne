"use client"

import { useCallback } from "react"

/**
 * Hook for code block actions (copy, download, etc.)
 */
export function useCodeActions() {
  /**
   * Enhanced clipboard copy with proper security checks
   */
  const copyToClipboard = useCallback(async (code: string): Promise<boolean> => {
    // Security check: Must be in secure context (HTTPS)
    if (!window.isSecureContext) {
      console.warn('Clipboard API requires secure context (HTTPS)')
      return copyFallback(code)
    }

    // Check for clipboard API support
    if (!navigator.clipboard) {
      console.warn('Clipboard API not supported, using fallback')
      return copyFallback(code)
    }

    try {
      // Modern Clipboard API - requires user activation
      await navigator.clipboard.writeText(code)
      return true
    } catch (err) {
      console.error('Clipboard API failed:', err)
      // Fallback to older method
      return copyFallback(code)
    }
  }, [])

  /**
   * Secure fallback for clipboard operations
   */
  const copyFallback = useCallback((code: string): boolean => {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = code
      
      // Security: Hide the textarea but make it accessible
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      textArea.style.top = '-9999px'
      textArea.style.opacity = '0'
      textArea.setAttribute('readonly', '')
      textArea.setAttribute('aria-hidden', 'true')
      
      document.body.appendChild(textArea)
      
      // Focus and select for better cross-browser compatibility
      textArea.focus()
      textArea.select()
      textArea.setSelectionRange(0, 99999) // For mobile devices
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      return successful
    } catch (err) {
      console.error('Fallback copy failed:', err)
      return false
    }
  }, [])

  /**
   * Get appropriate file extension for a language
   */
  const getFileExtension = useCallback((language: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      tsx: 'tsx',
      jsx: 'jsx',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      'c++': 'cpp',
      c: 'c',
      csharp: 'cs',
      'c#': 'cs',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      less: 'less',
      html: 'html',
      xml: 'xml',
      json: 'json',
      yaml: 'yaml',
      yml: 'yml',
      sql: 'sql',
      bash: 'sh',
      shell: 'sh',
      sh: 'sh',
      zsh: 'zsh',
      fish: 'fish',
      markdown: 'md',
      md: 'md',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      swift: 'swift',
      kotlin: 'kt',
      scala: 'scala',
      r: 'r',
      matlab: 'm',
      perl: 'pl',
      lua: 'lua',
      text: 'txt',
      plain: 'txt',
      plaintext: 'txt'
    }

    return extensions[language.toLowerCase()] || 'txt'
  }, [])

  /**
   * Generate appropriate filename for code snippet with security sanitization
   */
  const generateFilename = useCallback((language: string, customFilename?: string): string => {
    // Sanitize filename to prevent directory traversal and invalid characters
    const sanitize = (name: string) => 
      name.replace(/[^a-z0-9\-_\.]/gi, '_').replace(/_{2,}/g, '_').slice(0, 100)

    if (customFilename) {
      const sanitized = sanitize(customFilename)
      // If custom filename already has extension, use it as-is
      if (sanitized.includes('.')) {
        return sanitized
      }
      // Otherwise, add appropriate extension
      return `${sanitized}.${getFileExtension(language)}`
    }

    // Generate default filename based on language
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const extension = getFileExtension(language)
    
    return `code-snippet-${timestamp}.${extension}`
  }, [getFileExtension])

  /**
   * Enhanced download with better MIME type handling and security
   */
  const downloadCode = useCallback((
    code: string, 
    language: string, 
    filename?: string
  ): void => {
    try {
      const finalFilename = generateFilename(language, filename)
      const mimeType = getMimeType(language)
      
      // Create blob with proper MIME type
      const blob = new Blob([code], { 
        type: `${mimeType};charset=utf-8` 
      })
      
      // Security: Validate blob size (prevent memory exhaustion)
      if (blob.size > 50 * 1024 * 1024) { // 50MB limit
        console.error('File too large for download')
        return
      }
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      // Security attributes
      link.href = url
      link.download = finalFilename
      link.style.display = 'none'
      link.setAttribute('rel', 'noopener noreferrer')
      
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      
      // Clean up object URL to prevent memory leaks
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch (err) {
      console.error('Failed to download code:', err)
    }
  }, [generateFilename, getMimeType])

  /**
   * Share code via Web Share API (if supported)
   */
  const shareCode = useCallback(async (
    code: string, 
    language: string, 
    title?: string
  ): Promise<boolean> => {
    if (!navigator.share) {
      return false
    }
    
    try {
      await navigator.share({
        title: title || `Code snippet (${language})`,
        text: code
      })
      return true
    } catch (err) {
      console.error('Failed to share code:', err)
      return false
    }
  }, [])

  /**
   * Print code (opens print dialog)
   */
  const printCode = useCallback((code: string, language: string, title?: string): void => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || `Code - ${language}`}</title>
          <style>
            body {
              font-family: 'JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 20px;
              background: white;
              color: black;
            }
            .header {
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .language {
              background: #f0f0f0;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
              display: inline-block;
            }
            .code {
              white-space: pre-wrap;
              word-wrap: break-word;
              background: #f8f8f8;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            @media print {
              body { margin: 0; }
              .header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${title || 'Code Snippet'}</h2>
            <span class="language">${language.toUpperCase()}</span>
          </div>
          <div class="code">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </body>
      </html>
    `
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    
    // Trigger print dialog after content loads
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }, [])

  /**
   * Copy code with language info as formatted text
   */
  const copyWithLanguage = useCallback(async (
    code: string, 
    language: string
  ): Promise<boolean> => {
    const formattedCode = `\`\`\`${language}\n${code}\n\`\`\``
    return copyToClipboard(formattedCode)
  }, [copyToClipboard])

  /**
   * Get MIME type for a language (useful for advanced sharing/export)
   */
  const getMimeType = useCallback((language: string): string => {
    const mimeTypes: Record<string, string> = {
      javascript: 'text/javascript',
      typescript: 'text/typescript',
      tsx: 'text/typescript',
      jsx: 'text/javascript',
      python: 'text/x-python',
      java: 'text/x-java-source',
      cpp: 'text/x-c++src',
      c: 'text/x-csrc',
      csharp: 'text/x-csharp',
      css: 'text/css',
      html: 'text/html',
      xml: 'application/xml',
      json: 'application/json',
      yaml: 'text/yaml',
      sql: 'text/x-sql',
      bash: 'text/x-shellscript',
      markdown: 'text/markdown',
      php: 'text/x-php',
      ruby: 'text/x-ruby',
      go: 'text/x-go',
      rust: 'text/x-rustsrc',
      swift: 'text/x-swift'
    }

    return mimeTypes[language.toLowerCase()] || 'text/plain'
  }, [])

  /**
   * Format code for different contexts (email, chat, etc.)
   */
  const formatCode = useCallback((
    code: string, 
    language: string, 
    format: 'markdown' | 'html' | 'plain' = 'markdown'
  ): string => {
    switch (format) {
      case 'markdown':
        return `\`\`\`${language}\n${code}\n\`\`\``
      
      case 'html':
        return `<pre><code class="language-${language}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
      
      case 'plain':
      default:
        return code
    }
  }, [])

  return {
    copyToClipboard,
    downloadCode,
    shareCode,
    printCode,
    copyWithLanguage,
    formatCode,
    getMimeType,
    getFileExtension,
    generateFilename
  }
}