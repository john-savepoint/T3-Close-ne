"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useChatWithMemory } from "@/hooks/use-chat-with-memory"
import { useMemory } from "@/hooks/use-memory"
import { Badge } from "@/components/ui/badge"
import { Brain, MessageSquare, Sparkles, ToggleLeft, ToggleRight, Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export default function TestMemoryPage() {
  const [includeMemories, setIncludeMemories] = useState(true)
  const { memories, createMemory, deleteMemory } = useMemory()
  const { messages, input, handleInputChange, sendMessage, isLoading, memoryContext, hasMemories } =
    useChatWithMemory({
      includeMemories,
      initialModel: "openai/gpt-4o-mini",
    })

  const handleSendMessage = async () => {
    if (!input.trim()) return
    await sendMessage(input)
  }

  const handleAddMemory = async () => {
    const exampleMemory = "I prefer TypeScript over JavaScript and always use strict mode"
    await createMemory({
      content: exampleMemory,
      category: "preference",
      title: "TypeScript Preference",
    })
  }

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Memory System Test</h1>
        <p className="text-muted-foreground">
          Test the AI memory feature by adding memories and seeing how they affect conversations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Memory Management Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                User Memories
              </CardTitle>
              <CardDescription>
                {memories.length} active {memories.length === 1 ? "memory" : "memories"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {memories.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Brain className="mx-auto mb-3 h-12 w-12 opacity-20" />
                    <p>No memories yet</p>
                    <Button onClick={handleAddMemory} variant="outline" size="sm" className="mt-3">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Example Memory
                    </Button>
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
                            {memory.category && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {memory.category}
                              </Badge>
                            )}
                          </div>
                          <Button
                            onClick={() => deleteMemory(memory.id)}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {memories.length === 0 && (
                <div className="mt-4 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Try this:</strong> Click "Add Example Memory" then send a message asking
                    for TypeScript code. The AI will remember your preference!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Memory Toggle */}
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Use Memories</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIncludeMemories(!includeMemories)}
                  className="h-8 px-2"
                >
                  {includeMemories ? (
                    <ToggleRight className="h-5 w-5 text-primary" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {includeMemories
                  ? "AI is using your memories to personalize responses"
                  : "AI is not using memories (baseline mode)"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Test Chat
              </CardTitle>
              <CardDescription>
                {hasMemories && includeMemories
                  ? "Chat with memory context enabled"
                  : "Chat without memory context"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ScrollArea className="mb-4 flex-1 pr-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-20" />
                      <p>Start a conversation to test memory integration</p>
                      <p className="mt-2 text-xs">Try asking: "Write a hello world function"</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-lg bg-muted p-3">
                        <div className="flex space-x-2">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/20" />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/20 delay-100" />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/20 delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <Separator className="mb-4" />

              <div className="space-y-2">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type a message..."
                  className="min-h-[80px] resize-none"
                  disabled={isLoading}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {memoryContext && includeMemories && (
                      <span className="flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        Using {memories.length} memories
                      </span>
                    )}
                  </div>
                  <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Debug Panel */}
      {memoryContext && includeMemories && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Debug: Memory Context</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
              {memoryContext || "No memory context"}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
