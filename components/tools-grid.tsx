"use client"

import type React from "react"

import { Mail, MessageSquare, FileText, Code, LineChart, ImageIcon, GitBranch } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailResponderTool } from "@/components/tools/email-responder-tool"
import { SocialMediaTool } from "@/components/tools/social-media-tool"
import { SummarizerTool } from "@/components/tools/summarizer-tool"
import { DiagrammerTool } from "@/components/tools/diagrammer-tool"

interface ToolData {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  component: React.ComponentType<{ onComplete: (result: any) => void }>
}

interface ToolsGridProps {
  onToolSelect: (toolId: string, result: any) => void
}

export function ToolsGrid({ onToolSelect }: ToolsGridProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null)

  const tools: ToolData[] = [
    {
      id: "email-responder",
      name: "Email Responder",
      description: "Draft professional email responses based on context",
      icon: <Mail className="h-6 w-6" />,
      component: EmailResponderTool,
    },
    {
      id: "social-media",
      name: "Social Media Generator",
      description: "Create engaging posts for any social platform",
      icon: <MessageSquare className="h-6 w-6" />,
      component: SocialMediaTool,
    },
    {
      id: "summarizer",
      name: "Summarizer",
      description: "Condense long texts into concise summaries",
      icon: <FileText className="h-6 w-6" />,
      component: SummarizerTool,
    },
    {
      id: "diagrammer",
      name: "Diagrammer",
      description: "Visualize processes, flows, and relationships",
      icon: <GitBranch className="h-6 w-6" />,
      component: DiagrammerTool,
    },
    {
      id: "data-analyzer",
      name: "Data Analyzer",
      description: "Interpret data and create visualizations",
      icon: <LineChart className="h-6 w-6" />,
      component: SummarizerTool, // Placeholder until implemented
    },
    {
      id: "image-generator",
      name: "Image Generator",
      description: "Create images from text descriptions",
      icon: <ImageIcon className="h-6 w-6" />,
      component: SummarizerTool, // Placeholder until implemented
    },
  ]

  const handleToolComplete = (toolId: string, result: any) => {
    onToolSelect(toolId, result)
    // Keep the tool open so users can refine or generate again
    // setActiveTool(null)
  }

  return (
    <div className="w-full">
      {activeTool ? (
        <div className="rounded-lg border border-mauve-dark/40 bg-mauve-surface/20 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {tools.find((tool) => tool.id === activeTool)?.name}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setActiveTool(null)}>
              Back to tools
            </Button>
          </div>

          {/* Render active tool component */}
          {(() => {
            const tool = tools.find((t) => t.id === activeTool)
            if (!tool) return null

            const ToolComponent = tool.component
            return <ToolComponent onComplete={(result) => handleToolComplete(activeTool, result)} />
          })()}
        </div>
      ) : (
        <Tabs defaultValue="popular">
          <div className="mb-4 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="all">All Tools</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="popular" className="mt-0">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tools.slice(0, 3).map((tool) => (
                <Card
                  key={tool.id}
                  className="group cursor-pointer border-mauve-dark/40 bg-mauve-surface/20 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-mauve-accent/40 hover:bg-mauve-surface/30 hover:shadow-lg hover:shadow-mauve-accent/10"
                  onClick={() => setActiveTool(tool.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-mauve-surface/30 p-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-mauve-accent/20">
                      <div className="transition-colors duration-300 group-hover:text-mauve-accent">
                        {tool.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-left font-medium transition-colors duration-300 group-hover:text-mauve-accent">
                        {tool.name}
                      </h3>
                      <p className="text-left text-sm text-mauve-subtle/80">{tool.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <Card
                  key={tool.id}
                  className="group cursor-pointer border-mauve-dark/40 bg-mauve-surface/20 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-mauve-accent/40 hover:bg-mauve-surface/30 hover:shadow-lg hover:shadow-mauve-accent/10"
                  onClick={() => setActiveTool(tool.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-mauve-surface/30 p-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-mauve-accent/20">
                      <div className="transition-colors duration-300 group-hover:text-mauve-accent">
                        {tool.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-left font-medium transition-colors duration-300 group-hover:text-mauve-accent">
                        {tool.name}
                      </h3>
                      <p className="text-left text-sm text-mauve-subtle/80">{tool.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
