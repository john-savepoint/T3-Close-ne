"use client"

import { useState } from "react"
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
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToolClick = (toolId: string) => {
    router.push(`/tools/${toolId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">T3Chat Tools</h1>
        <p className="text-mauve-subtle/70 max-w-2xl mx-auto">
          Choose a specialized tool to help you accomplish specific tasks, or start a general conversation.
        </p>
      </div>

      <div className="relative mb-6 max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mauve-subtle/50" size={18} />
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
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <span>Popular Tools</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools
                  .filter((tool) => tool.isPopular)
                  .map((tool) => (
                    <ToolCard key={tool.id} tool={tool} onClick={handleToolClick} getToolIcon={getToolIcon} />
                  ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-medium mb-4">{searchQuery.length > 0 ? "Search Results" : "All Tools"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onClick={handleToolClick} getToolIcon={getToolIcon} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-mauve-subtle/70 mb-4">No tools match your search.</p>
          <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-mauve-subtle/70 mb-4">Want to start a general conversation instead?</p>
        <Button variant="outline" onClick={() => router.push("/chat/new")}>
          Start General Chat
        </Button>
      </div>
    </div>
  )
}

function ToolCard({ tool, onClick, getToolIcon }) {
  const Icon = getToolIcon(tool.icon)

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all border border-mauve-subtle/20 hover:border-mauve-subtle/40"
      onClick={() => onClick(tool.id)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-mauve-subtle/10 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-mauve-subtle" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{tool.name}</h3>
              {tool.isNew && <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">New</Badge>}
              {tool.isBeta && (
                <Badge variant="outline" className="text-xs">
                  Beta
                </Badge>
              )}
            </div>
            <p className="text-sm text-mauve-subtle/70">{tool.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
