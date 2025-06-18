"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { GitBranch, Send, Loader2, AlertCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { generateDiagram } from "@/lib/tools-api"
import { useToast } from "@/hooks/use-toast"
import { createChatUrl } from "@/lib/tool-chat-integration"
import dynamic from "next/dynamic"

// Dynamically import mermaid to avoid SSR issues
const Mermaid = dynamic(() => import("@/components/ui/mermaid"), { ssr: false })

export default function DiagrammerPage() {
  const router = useRouter()
  const [description, setDescription] = useState("")
  const [diagramType, setDiagramType] = useState<"flowchart" | "sequence" | "class" | "entity-relationship">("flowchart")
  const [isGenerating, setIsGenerating] = useState(false)
  const [mermaidCode, setMermaidCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!description) return

    setIsGenerating(true)
    setError(null)

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
      setIsGenerating(false)
    }
  }

  const handleContinueInChat = () => {
    const context = {
      toolId: "diagrammer",
      toolName: "Diagrammer",
      input: {
        description,
        type: diagramType,
      },
      result: `\`\`\`mermaid\n${mermaidCode}\n\`\`\``,
    }
    
    router.push(createChatUrl(context))
  }

  const diagramTypeLabels = {
    flowchart: "Flowchart",
    sequence: "Sequence Diagram",
    class: "Class Diagram",
    "entity-relationship": "Entity Relationship",
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
          <GitBranch className="h-8 w-8" />
          <span>Diagrammer</span>
        </h1>
        <p className="text-mauve-subtle/70">
          Visualize processes, systems, and relationships with AI-generated diagrams.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <label className="mb-2 block text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe what you want to diagram... E.g., 'User authentication flow with email verification' or 'Database schema for an e-commerce platform'"
                className="min-h-[200px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Diagram Type</label>
                  <Select value={diagramType} onValueChange={(value: any) => setDiagramType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select diagram type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flowchart">Flowchart - Processes and workflows</SelectItem>
                      <SelectItem value="sequence">Sequence - Interactions over time</SelectItem>
                      <SelectItem value="class">Class - Object structures and relationships</SelectItem>
                      <SelectItem value="entity-relationship">Entity Relationship - Database schemas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isGenerating || !description}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate Diagram
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-red-500/20 bg-red-500/10">
              <CardContent className="flex items-center gap-2 p-4">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                <span className="text-sm text-red-400">{error}</span>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="h-full">
            <CardContent className="flex h-full flex-col p-6">
              <h3 className="mb-4 font-medium">Generated Diagram</h3>

              {!mermaidCode ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-mauve-subtle/20 p-8">
                  <div className="text-center text-mauve-subtle/50">
                    <GitBranch className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Your diagram will appear here</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex-1 overflow-auto">
                    {/* Diagram preview */}
                    <div className="mb-4 rounded-lg border border-mauve-subtle/20 bg-slate-900 p-4">
                      <Mermaid code={mermaidCode} />
                    </div>
                    
                    {/* Code view */}
                    <div className="rounded-lg border border-mauve-subtle/20 bg-slate-900 p-4">
                      <p className="mb-2 text-xs font-medium text-mauve-subtle/70">Mermaid Code:</p>
                      <pre className="overflow-x-auto text-xs">
                        <code>{mermaidCode}</code>
                      </pre>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigator.clipboard.writeText(mermaidCode)}
                    >
                      Copy Code
                    </Button>
                    <Button className="flex-1" onClick={handleContinueInChat}>
                      Continue in Chat
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}