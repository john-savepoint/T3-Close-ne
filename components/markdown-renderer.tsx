"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const components: Components = {
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''
      const inline = !match && !String(children).includes('\n')
      
      if (!inline && match) {
        return (
          <div className="my-4 overflow-hidden rounded-lg border border-mauve-dark/50 bg-mauve-dark/20">
            <SyntaxHighlighter
              style={atomDark}
              language={language}
              PreTag="div"
              customStyle={{
                margin: 0,
                background: 'transparent',
                padding: '1rem',
                fontSize: '0.875rem',
              }}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        )
      }
      
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
    // Custom link component to open in new tab
    a({ href, children, ...props }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      )
    },
  }

  return (
    <div className={cn(
        "prose prose-sm prose-invert max-w-none",
        "prose-p:my-2 prose-p:leading-7",
        "prose-headings:font-semibold prose-headings:text-foreground",
        "prose-h1:text-2xl prose-h1:mt-6 prose-h1:mb-4",
        "prose-h2:text-xl prose-h2:mt-5 prose-h2:mb-3",
        "prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2",
        "prose-h4:text-base prose-h4:mt-3 prose-h4:mb-2",
        "prose-strong:text-foreground prose-strong:font-semibold",
        "prose-em:text-foreground/90",
        "prose-blockquote:border-l-4 prose-blockquote:border-mauve-accent prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-foreground/80",
        "prose-code:bg-mauve-dark/50 prose-code:text-mauve-bright prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-[''] prose-code:after:content-['']",
        "prose-pre:bg-transparent prose-pre:p-0",
        "prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-6",
        "prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6",
        "prose-li:my-1",
        "prose-a:text-mauve-bright prose-a:underline prose-a:decoration-mauve-accent/50 hover:prose-a:decoration-mauve-accent",
        "prose-hr:border-mauve-dark",
        "prose-table:border-collapse prose-table:overflow-hidden prose-table:rounded-lg",
        "prose-th:bg-mauve-dark/50 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold",
        "prose-td:border-t prose-td:border-mauve-dark prose-td:px-4 prose-td:py-2",
        className
      )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}