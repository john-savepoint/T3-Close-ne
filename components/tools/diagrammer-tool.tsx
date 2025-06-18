"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, GitBranch, Copy, Check, AlertCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { generateDiagram } from "@/lib/tools-api"
import { useToast } from "@/hooks/use-toast"
import mermaid from "mermaid"

interface DiagrammerToolProps {
  onComplete: (result: { content: string }) => void
}

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
    secondaryBorderColor: '#374151',
    tertiaryBorderColor: '#4b5563',
    secondaryTextColor: '#d1d5db',
    tertiaryTextColor: '#9ca3af',
    nodeTextColor: '#e5e7eb',
    textColor: '#e5e7eb',
    fontSize: '16px'
  }
})

export function DiagrammerTool({ onComplete }: DiagrammerToolProps) {
  const [description, setDescription] = useState("")
  const [diagramType, setDiagramType] = useState<"flowchart" | "sequence" | "class" | "entity-relationship">("flowchart")
  const [isLoading, setIsLoading] = useState(false)
  const [mermaidCode, setMermaidCode] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const diagramRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mermaidCode && diagramRef.current) {
      diagramRef.current.innerHTML = ''
      const id = `mermaid-${Date.now()}`
      const div = document.createElement('div')
      div.id = id
      div.innerHTML = mermaidCode
      diagramRef.current.appendChild(div)
      
      mermaid.init(undefined, `#${id}`)
        .catch((err) => {
          console.error('Mermaid rendering error:', err)
          setError('Failed to render diagram. Please check the syntax.')
        })
    }
  }, [mermaidCode])

  const handleGenerate = async () => {
    if (!description) return

    setIsLoading(true)
    setError(null)
    setMermaidCode("")

    try {
      const result = await generateDiagram({
        description,
        type: diagramType,
      })

      if (result.success && result.content) {
        // Extract mermaid code from the response
        const mermaidMatch = result.content.match(/```mermaid\n([\s\S]*?)\n```/)
        const code = mermaidMatch ? mermaidMatch[1] : result.content
        
        setMermaidCode(code.trim())
        toast({
          title: "Diagram generated successfully",
          description: `Created a ${diagramType} diagram`,
        })
      } else {
        setError(result.error || "Failed to generate diagram")
        toast({
          title: "Generation failed",
          description: result.error || "Unable to generate diagram",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating diagram:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(mermaidCode)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleUse = () => {
    const contentWithContext = `## ${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} Diagram\n\n\`\`\`mermaid\n${mermaidCode}\n\`\`\`\n\n*Generated from: "${description}"*`
    onComplete({ content: contentWithContext })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <Textarea
            placeholder="Describe the process, system, or relationships you want to diagram..."
            className="min-h-[150px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium">Diagram Type</label>
            <Select value={diagramType} onValueChange={(value: any) => setDiagramType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select diagram type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flowchart">Flowchart</SelectItem>
                <SelectItem value="sequence">Sequence Diagram</SelectItem>
                <SelectItem value="class">Class Diagram</SelectItem>
                <SelectItem value="entity-relationship">Entity Relationship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerate} disabled={!description || isLoading} className="mt-4 w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <GitBranch className="mr-2 h-4 w-4" />
                Generate Diagram
              </>
            )}
          </Button>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium">Diagram</label>
            {mermaidCode && (
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6">
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>

          <Card className="min-h-[250px] bg-mauve-surface/30 p-4">
            {mermaidCode ? (
              <div>
                <div ref={diagramRef} className="mb-4 flex justify-center overflow-auto" />
                <div className="mt-4 rounded-md bg-slate-900 p-3">
                  <pre className="overflow-x-auto text-xs">
                    <code>{mermaidCode}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-mauve-subtle/70">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-2 h-5 w-5 animate-spin" />
                    <p>Creating your diagram...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <GitBranch className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>Your diagram will appear here</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {mermaidCode && (
            <Button onClick={handleUse} className="mt-4 w-full">
              Use This Diagram
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}