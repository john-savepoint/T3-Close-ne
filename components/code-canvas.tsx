"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, RefreshCw, ExternalLink, Copy, Code as CodeIcon, Eye } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlockEnhanced } from "@/components/code-block-enhanced"
import { sanitizeHTML } from "@/lib/content-sanitizer"

interface CodeCanvasProps {
  code: string
  language: string
  title?: string
}

const isPreviewable = (language: string): boolean => {
  return ["html", "javascript", "css", "jsx", "tsx"].includes(language.toLowerCase())
}

export function CodeCanvas({ code, language, title }: CodeCanvasProps) {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code")
  const [isRunning, setIsRunning] = useState(false)
  const [previewContent, setPreviewContent] = useState<string>("")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const generatePreviewHTML = (code: string, lang: string): string => {
    let htmlContent = ""

    switch (lang.toLowerCase()) {
      case "html":
        // For HTML, use it directly but sanitize it
        htmlContent = sanitizeHTML(code)
        break

      case "javascript":
        // Wrap JavaScript in a basic HTML structure
        htmlContent = `
          <html>
            <head>
              <style>
                body { 
                  margin: 0; 
                  padding: 16px; 
                  font-family: system-ui, -apple-system, sans-serif;
                  background: #111827;
                  color: #e5e7eb;
                }
                .output {
                  margin-top: 16px;
                  padding: 16px;
                  background: #1f2937;
                  border-radius: 8px;
                  border: 1px solid #374151;
                }
              </style>
            </head>
            <body>
              <div id="output" class="output"></div>
              <script>
                // Redirect console.log to display output
                const output = document.getElementById('output');
                const originalLog = console.log;
                console.log = function(...args) {
                  originalLog.apply(console, args);
                  const message = args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                  ).join(' ');
                  output.innerHTML += '<div>' + message + '</div>';
                };
                
                try {
                  ${code}
                } catch (error) {
                  output.innerHTML = '<div style="color: #ef4444;">Error: ' + error.message + '</div>';
                }
              </script>
            </body>
          </html>
        `
        break

      case "css":
        // Create a demo HTML with the CSS
        htmlContent = `
          <html>
            <head>
              <style>
                ${code}
              </style>
              <style>
                body {
                  margin: 0;
                  padding: 16px;
                  font-family: system-ui, -apple-system, sans-serif;
                  background: #111827;
                  color: #e5e7eb;
                }
              </style>
            </head>
            <body>
              <h1>CSS Preview</h1>
              <p>This is a paragraph to demonstrate the CSS styles.</p>
              <div class="container">
                <div class="box">Box 1</div>
                <div class="box">Box 2</div>
                <div class="box">Box 3</div>
              </div>
              <button>Sample Button</button>
            </body>
          </html>
        `
        break

      case "jsx":
      case "tsx":
        // For React components, show a placeholder
        htmlContent = `
          <html>
            <head>
              <style>
                body {
                  margin: 0;
                  padding: 16px;
                  font-family: system-ui, -apple-system, sans-serif;
                  background: #111827;
                  color: #e5e7eb;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  text-align: center;
                }
                .notice {
                  padding: 32px;
                  background: #1f2937;
                  border-radius: 12px;
                  border: 1px solid #374151;
                  max-width: 400px;
                }
                .notice h3 {
                  margin: 0 0 16px 0;
                  color: #a78bfa;
                }
                .notice p {
                  margin: 0;
                  color: #9ca3af;
                  line-height: 1.5;
                }
                code {
                  background: #374151;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-family: monospace;
                }
              </style>
            </head>
            <body>
              <div class="notice">
                <h3>React Component Preview</h3>
                <p>
                  React components require a build step to preview. 
                  For now, you can copy this code to your local environment or use 
                  an online playground like CodeSandbox.
                </p>
                <p style="margin-top: 16px;">
                  Component type: <code>${lang.toUpperCase()}</code>
                </p>
              </div>
            </body>
          </html>
        `
        break

      default:
        htmlContent = `<p>Preview not available for ${lang}</p>`
    }

    return htmlContent
  }

  const runCode = () => {
    setIsRunning(true)
    const html = generatePreviewHTML(code, language)
    setPreviewContent(html)
    setActiveTab("preview")

    // Update iframe content
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.srcdoc = html
      }
      setIsRunning(false)
    }, 100)
  }

  // Auto-run on first render for HTML
  useEffect(() => {
    if (language.toLowerCase() === "html") {
      runCode()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, language])

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
  }

  const handleOpenExternal = () => {
    // Create a blob URL and open in new tab
    const blob = new Blob([previewContent || generatePreviewHTML(code, language)], {
      type: "text/html",
    })
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
  }

  // Check if the language is previewable
  if (!isPreviewable(language)) {
    return (
      <CodeBlockEnhanced
        code={code}
        language={language}
        showLineNumbers={true}
        showActions={true}
        maxHeight="500px"
      />
    )
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-mauve-dark/50 bg-mauve-dark/20">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "code" | "preview")}>
        <div className="flex items-center justify-between border-b border-mauve-dark/50 bg-mauve-dark/30 px-4 py-2">
          <div className="flex items-center gap-2">
            <TabsList className="h-8">
              <TabsTrigger value="code" className="text-xs">
                <CodeIcon className="mr-1 h-3 w-3" />
                Code
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs">
                <Eye className="mr-1 h-3 w-3" />
                Preview
              </TabsTrigger>
            </TabsList>
            {title && <span className="text-xs text-mauve-subtle">{title}</span>}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={runCode}
              disabled={isRunning}
              className="h-7 px-2 text-xs"
            >
              {isRunning ? (
                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Play className="mr-1 h-3 w-3" />
              )}
              Run
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs">
              <Copy className="mr-1 h-3 w-3" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenExternal}
              className="h-7 px-2 text-xs"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Open
            </Button>
          </div>
        </div>

        <TabsContent value="code" className="m-0">
          <CodeBlockEnhanced
            code={code}
            language={language}
            showActions={false}
            showLineNumbers={true}
            maxHeight="400px"
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0 min-h-[300px] bg-white">
          <iframe
            ref={iframeRef}
            className="h-full min-h-[300px] w-full"
            sandbox="allow-scripts allow-modals"
            style={{ border: "none" }}
            title="Code Preview"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
