"use client"

import { useEffect, useRef } from "react"
import mermaid from "mermaid"

interface MermaidProps {
  code: string
  className?: string
}

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#8b5cf6',
    primaryTextColor: '#e5e7eb',
    primaryBorderColor: '#7c3aed',
    lineColor: '#a78bfa',
    secondaryColor: '#1f2937',
    tertiaryColor: '#374151',
    background: '#111827',
    mainBkg: '#1f2937',
    secondBkg: '#374151',
    tertiaryBkg: '#4b5563',
    nodeTextColor: '#e5e7eb',
    textColor: '#e5e7eb',
    fontSize: '14px'
  }
})

export default function Mermaid({ code, className = "" }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && code) {
      ref.current.innerHTML = ''
      // Generate a unique ID that always starts with a letter for valid CSS selector
      const uniqueId = Math.random().toString(36).substring(2)
      // Ensure the ID starts with 'm' in case the random string starts with a number
      const id = `m${uniqueId}-${Date.now()}`
      
      try {
        mermaid.render(id, code).then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg
          }
        }).catch((error) => {
          console.error('Mermaid render error:', error)
          if (ref.current) {
            ref.current.innerHTML = `<div class="text-red-400 text-sm p-4">Error rendering diagram: ${error.message}</div>`
          }
        })
      } catch (error) {
        console.error('Mermaid error:', error)
        if (ref.current) {
          ref.current.innerHTML = `<div class="text-red-400 text-sm p-4">Error: Invalid diagram syntax</div>`
        }
      }
    }
  }, [code])

  return (
    <div className={`mermaid-container ${className}`}>
      <div ref={ref} className="flex justify-center" />
    </div>
  )
}