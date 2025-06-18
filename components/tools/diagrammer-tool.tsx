"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, MessageSquare } from "lucide-react"
import Mermaid from "@/components/ui/mermaid"
import { generateDiagram } from "@/lib/tools-api"
import { createChatUrl, formatToolResultForChat } from "@/lib/tool-chat-integration"
import { useToast } from "@/hooks/use-toast"

interface DiagrammerToolProps {
  onComplete: (result: any) => void
}

export function DiagrammerTool({ onComplete }: DiagrammerToolProps) {
  const [description, setDescription] = useState("")
  const [diagramType, setDiagramType] = useState("flowchart")
  const [generatedDiagram, setGeneratedDiagram] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { showToast } = useToast()

  const diagramTypes = [
    { id: "flowchart", name: "Flowchart", description: "Process flows and decision trees" },
    { id: "sequence", name: "Sequence", description: "Interactions over time" },
    { id: "class", name: "Class", description: "Object relationships" },
    { id: "entity", name: "Entity", description: "Database relationships" },
    { id: "mindmap", name: "Mind Map", description: "Ideas and concepts" },
    { id: "gitgraph", name: "Git Graph", description: "Version control flows" },
  ]

  const handleGenerate = async () => {
    if (!description.trim()) {
      showToast({
        type: "error",
        message: "Please provide a description of what you want to diagram.",
      })
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateDiagram({
        description: description.trim(),
        diagramType,
      })

      setGeneratedDiagram(result.content || "")
      showToast({
        type: "success",
        message: "Your diagram has been created successfully!",
      })
    } catch (error) {
      console.error("Error generating diagram:", error)
      showToast({
        type: "error",
        message: "Failed to generate diagram. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedDiagram)
      showToast({
        type: "success",
        message: "Mermaid code copied to clipboard.",
      })
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to copy to clipboard.",
      })
    }
  }

  const handleDownload = () => {
    const blob = new Blob([generatedDiagram], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `diagram-${diagramType}-${Date.now()}.mmd`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showToast({
      type: "success",
      message: "Diagram file saved to your downloads.",
    })
  }

  const handleContinueInChat = () => {
    const context = {
      toolId: "diagrammer",
      toolName: "Diagrammer",
      input: { description, diagramType },
      result: generatedDiagram,
    }

    const chatUrl = createChatUrl(context)
    window.location.href = chatUrl

    // Also call onComplete to close the tool
    onComplete({
      content: formatToolResultForChat(context),
      type: "diagram",
      mermaidCode: generatedDiagram,
    })
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="diagram-type" className="text-sm font-medium">
            Diagram Type
          </Label>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
            {diagramTypes.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer border transition-colors ${
                  diagramType === type.id
                    ? "border-mauve-accent bg-mauve-accent/10"
                    : "border-mauve-dark/40 hover:border-mauve-accent/40"
                }`}
                onClick={() => setDiagramType(type.id)}
              >
                <CardContent className="p-3">
                  <div className="text-sm font-medium">{type.name}</div>
                  <div className="text-xs text-mauve-subtle/70">{type.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium">
            Describe what you want to diagram
          </Label>
          <Textarea
            id="description"
            placeholder="E.g., 'Create a flowchart showing the user registration process with email verification and error handling...'"
            className="mt-2 min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button onClick={handleGenerate} disabled={isGenerating || !description.trim()} className="w-full">
          {isGenerating ? "Generating..." : "Generate Diagram"}
        </Button>
      </div>

      {/* Result Section */}
      {generatedDiagram && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Generated Diagram</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyCode}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleContinueInChat}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Continue in Chat
              </Button>
            </div>
          </div>

          <Tabs defaultValue="preview" className="w-full">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Mermaid Code</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <Mermaid code={generatedDiagram} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <pre className="whitespace-pre-wrap text-sm">
                    <code>{generatedDiagram}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}