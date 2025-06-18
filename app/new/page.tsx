"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useTools } from "@/hooks/use-tools"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function NewChatPage() {
  const router = useRouter()
  const { tools, getToolIcon } = useTools()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToolClick = (toolId: string) => {
    router.push(`/tools/${toolId}`)
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">T3Chat Tools</h1>
        <p className="mx-auto max-w-2xl text-mauve-subtle/70">
          Choose a specialized tool to help you accomplish specific tasks, or start a general
          conversation.
        </p>
      </div>

      <div className="relative mx-auto mb-6 max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 transform text-mauve-subtle/50"
          size={18}
        />
        <Input
          type="text"
          placeholder="Search tools..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredTools.length > 0 ? (
        <>
          {searchQuery.length === 0 && (
            <div className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
                <span>Popular Tools</span>
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tools
                  .filter((tool) => tool.isPopular)
                  .map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onClick={handleToolClick}
                      getToolIcon={getToolIcon}
                    />
                  ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-4 text-lg font-medium">
              {searchQuery.length > 0 ? "Search Results" : "All Tools"}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onClick={handleToolClick}
                  getToolIcon={getToolIcon}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="mb-4 text-mauve-subtle/70">No tools match your search.</p>
          <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="mb-4 text-mauve-subtle/70">Want to start a general conversation instead?</p>
        <Button variant="outline" onClick={() => router.push("/chat/new")}>
          Start General Chat
        </Button>
      </div>
    </div>
  )
}

interface ToolCardProps {
  tool: any
  onClick: (toolId: string) => void
  getToolIcon: (icon: string) => React.ComponentType
}

function ToolCard({ tool, onClick, getToolIcon }: ToolCardProps) {
  const Icon = getToolIcon(tool.icon)

  return (
    <Card
      className="group cursor-pointer border border-mauve-subtle/20 transition-all duration-300 hover:border-mauve-accent/40 hover:shadow-lg hover:shadow-mauve-accent/10 hover:-translate-y-1"
      onClick={() => onClick(tool.id)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-mauve-subtle/10 p-3 transition-colors duration-300 group-hover:bg-mauve-accent/20">
            {React.createElement(Icon as any, { 
              className: "h-6 w-6 text-mauve-subtle transition-colors duration-300 group-hover:text-mauve-accent", 
              size: 24 
            })}
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="font-medium transition-colors duration-300 group-hover:text-mauve-accent">
                {tool.name}
              </h3>
              {tool.isNew && (
                <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">New</Badge>
              )}
              {tool.isBeta && (
                <Badge variant="outline" className="text-xs">
                  Beta
                </Badge>
              )}
            </div>
            <p className="text-sm text-mauve-subtle/70 transition-colors duration-300 group-hover:text-mauve-subtle/90">
              {tool.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
