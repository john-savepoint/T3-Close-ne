"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { Copy, Check, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCodeActions } from "@/hooks/use-code-actions"
import { detectLanguage } from "@/lib/syntax-detection"

// Dynamic language registration to avoid SSR issues
const languageRegistrations = {
  javascript: () => import("react-syntax-highlighter/dist/cjs/languages/prism/javascript"),
  typescript: () => import("react-syntax-highlighter/dist/cjs/languages/prism/typescript"),
  jsx: () => import("react-syntax-highlighter/dist/cjs/languages/prism/jsx"),
  tsx: () => import("react-syntax-highlighter/dist/cjs/languages/prism/tsx"),
  css: () => import("react-syntax-highlighter/dist/cjs/languages/prism/css"),
  json: () => import("react-syntax-highlighter/dist/cjs/languages/prism/json"),
  python: () => import("react-syntax-highlighter/dist/cjs/languages/prism/python"),
  java: () => import("react-syntax-highlighter/dist/cjs/languages/prism/java"),
  cpp: () => import("react-syntax-highlighter/dist/cjs/languages/prism/cpp"),
  c: () => import("react-syntax-highlighter/dist/cjs/languages/prism/c"),
  html: () => import("react-syntax-highlighter/dist/cjs/languages/prism/markup"),
  markup: () => import("react-syntax-highlighter/dist/cjs/languages/prism/markup"),
  sql: () => import("react-syntax-highlighter/dist/cjs/languages/prism/sql"),
  bash: () => import("react-syntax-highlighter/dist/cjs/languages/prism/bash"),
  shell: () => import("react-syntax-highlighter/dist/cjs/languages/prism/bash"),
  yaml: () => import("react-syntax-highlighter/dist/cjs/languages/prism/yaml"),
  yml: () => import("react-syntax-highlighter/dist/cjs/languages/prism/yaml"),
  markdown: () => import("react-syntax-highlighter/dist/cjs/languages/prism/markdown"),
  md: () => import("react-syntax-highlighter/dist/cjs/languages/prism/markdown"),
  go: () => import("react-syntax-highlighter/dist/cjs/languages/prism/go"),
  rust: () => import("react-syntax-highlighter/dist/cjs/languages/prism/rust"),
  php: () => import("react-syntax-highlighter/dist/cjs/languages/prism/php"),
  ruby: () => import("react-syntax-highlighter/dist/cjs/languages/prism/ruby"),
  swift: () => import("react-syntax-highlighter/dist/cjs/languages/prism/swift"),
  kotlin: () => import("react-syntax-highlighter/dist/cjs/languages/prism/kotlin"),
}

// Keep track of registered languages
const registeredLanguages = new Set<string>()

interface CodeBlockEnhancedProps {
  code: string
  language?: string
  filename?: string
  highlightLines?: number[]
  showLineNumbers?: boolean
  maxHeight?: string
  title?: string
  showActions?: boolean
}

export function CodeBlockEnhanced({
  code,
  language,
  filename,
  highlightLines = [],
  showLineNumbers = true,
  maxHeight = "400px",
  title,
  showActions = true,
}: CodeBlockEnhancedProps) {
  const [copied, setCopied] = useState(false)
  const [languageReady, setLanguageReady] = useState(false)
  const { downloadCode } = useCodeActions()

  const detectedLanguage = language || detectLanguage(code, filename)

  // Register language dynamically
  useEffect(() => {
    const registerLanguage = async () => {
      if (
        registeredLanguages.has(detectedLanguage) ||
        !languageRegistrations[detectedLanguage as keyof typeof languageRegistrations]
      ) {
        setLanguageReady(true)
        return
      }

      try {
        const languageModule =
          await languageRegistrations[detectedLanguage as keyof typeof languageRegistrations]()
        // Ensure the module has the expected structure
        if (languageModule.default) {
          SyntaxHighlighter.registerLanguage(detectedLanguage, languageModule.default)
          registeredLanguages.add(detectedLanguage)
        } else {
          console.warn(`Language module for ${detectedLanguage} missing default export`)
        }
        setLanguageReady(true)
      } catch (error) {
        console.warn(`Could not register language: ${detectedLanguage}`, error)
        setLanguageReady(true) // Still show the component, just without highlighting
      }
    }

    registerLanguage()
  }, [detectedLanguage])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [code])

  const handleDownload = useCallback(() => {
    downloadCode(code, detectedLanguage, filename)
  }, [code, detectedLanguage, filename, downloadCode])

  const displayName = title || filename || detectedLanguage

  return (
    <div className="group relative overflow-hidden rounded-lg border border-mauve-dark/50 bg-mauve-dark/20 backdrop-blur-sm">
      {/* Header with language badge and actions */}
      <div className="flex items-center justify-between border-b border-mauve-dark/50 bg-mauve-dark/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-mauve-subtle" />
          <Badge
            variant="outline"
            className="border-mauve-accent/30 bg-mauve-dark/50 font-mono text-xs"
          >
            {displayName}
          </Badge>
          {highlightLines.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {highlightLines.length} line{highlightLines.length !== 1 ? "s" : ""} highlighted
            </Badge>
          )}
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2 text-xs text-mauve-subtle transition-colors hover:bg-mauve-accent/20 hover:text-mauve-bright"
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 h-3 w-3 text-green-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-8 px-2 text-xs text-mauve-subtle transition-colors hover:bg-mauve-accent/20 hover:text-mauve-bright"
            >
              <Download className="mr-1.5 h-3 w-3" />
              <span>Download</span>
            </Button>
          </div>
        )}
      </div>

      {/* Code content with scrolling */}
      <div
        style={{ maxHeight }}
        className="scrollbar-thin scrollbar-track-mauve-dark/30 scrollbar-thumb-mauve-accent/50 overflow-auto"
      >
        {!languageReady ? (
          <div className="p-4 text-center text-mauve-subtle">
            <div className="animate-pulse">Loading syntax highlighting...</div>
          </div>
        ) : (
          <SyntaxHighlighter
            language={registeredLanguages.has(detectedLanguage) ? detectedLanguage : "text"}
            style={vscDarkPlus}
            showLineNumbers={showLineNumbers}
            wrapLongLines={true}
            lineProps={(lineNumber) => ({
              style: {
                backgroundColor: highlightLines.includes(lineNumber)
                  ? "rgba(167, 139, 250, 0.1)" // Purple highlight for dark theme
                  : "transparent",
                borderLeft: highlightLines.includes(lineNumber)
                  ? "3px solid rgb(167, 139, 250)" // Purple accent border
                  : "3px solid transparent",
                paddingLeft: "0.75rem",
                display: "block",
              },
            })}
            customStyle={{
              margin: 0,
              padding: "1rem",
              fontSize: "0.875rem",
              lineHeight: "1.6",
              background: "transparent",
              fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
            }}
            lineNumberStyle={{
              color: "hsl(322, 8%, 40%)",
              paddingRight: "1rem",
              textAlign: "right",
              userSelect: "none",
            }}
            // Enhanced accessibility attributes
            PreTag={(props) => (
              <pre
                {...props}
                role="code"
                aria-label={`Code block in ${detectedLanguage}`}
                tabIndex={0}
              />
            )}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </div>

      {/* Gradient overlay for long code blocks */}
      {code.split("\n").length > 20 && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-mauve-dark/20 to-transparent" />
      )}
    </div>
  )
}
