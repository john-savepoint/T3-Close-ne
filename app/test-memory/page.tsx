"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useMemory } from "@/hooks/use-memory"
import { Badge } from "@/components/ui/badge"
import { Brain, MessageSquare, Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export default function TestMemoryPage() {
  const { memories, createMemory, deleteMemory, loading } = useMemory()
  const [newMemoryContent, setNewMemoryContent] = useState("")

  const handleAddMemory = async () => {
    if (!newMemoryContent.trim()) return

    await createMemory({
      content: newMemoryContent,
      category: "preference",
      title: newMemoryContent.substring(0, 50),
    })

    setNewMemoryContent("")
  }

  const handleAddExampleMemory = async () => {
    const exampleMemory = "I prefer TypeScript over JavaScript and always use strict mode"
    await createMemory({
      content: exampleMemory,
      category: "preference",
      title: "TypeScript Preference",
    })
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Memory System Test</h1>
        <p className="text-muted-foreground">
          Test the memory system backend with Convex integration
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Memory Management Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              User Memories
            </CardTitle>
            <CardDescription>
              {memories.length} active {memories.length === 1 ? "memory" : "memories"}
              {loading && " (loading...)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add New Memory */}
            <div className="mb-6 space-y-3">
              <Textarea
                value={newMemoryContent}
                onChange={(e) => setNewMemoryContent(e.target.value)}
                placeholder="Add a new memory..."
                className="min-h-[80px] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddMemory}
                  disabled={!newMemoryContent.trim() || loading}
                  size="sm"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Memory
                </Button>
                <Button
                  onClick={handleAddExampleMemory}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  Add Example
                </Button>
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Memory List */}
            <ScrollArea className="h-[400px] pr-4">
              {memories.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Brain className="mx-auto mb-3 h-12 w-12 opacity-20" />
                  <p>No memories yet</p>
                  <p className="text-sm">Add a memory above to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memories.map((memory) => (
                    <div
                      key={memory.id}
                      className="rounded-lg border bg-card p-3 transition-colors hover:bg-accent/5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="mb-1 text-sm font-medium">
                            {memory.title || memory.content.substring(0, 50)}
                          </p>
                          <p className="text-xs text-muted-foreground">{memory.content}</p>
                          <div className="mt-2 flex items-center gap-2">
                            {memory.category && (
                              <Badge variant="secondary" className="text-xs">
                                {memory.category}
                              </Badge>
                            )}
                            {memory.priority !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                Priority: {memory.priority}
                              </Badge>
                            )}
                            {memory.usageCount !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                Used: {memory.usageCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => deleteMemory(memory.id)}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          disabled={loading}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">✅ Memory Backend Merged</p>
                <p>The Convex memory system is now working with full CRUD operations</p>
              </div>
              <div>
                <p className="font-medium text-foreground">🔄 Chat Integration</p>
                <p>Memory context is integrated into the chat API route for OpenRouter</p>
              </div>
              <div>
                <p className="font-medium text-foreground">🎯 Test in Main Chat</p>
                <p>Go to the main chat interface to test memory-enhanced conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
