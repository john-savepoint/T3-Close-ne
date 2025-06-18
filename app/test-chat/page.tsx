"use client"

import { useState } from "react"
import { useOpenRouterChat } from "@/hooks/use-openrouter-chat"
import { ModelSwitcher } from "@/components/model-switcher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatModelName } from "@/lib/openrouter"

export default function TestChatPage() {
  const [showModelSwitcher, setShowModelSwitcher] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [userApiKey, setUserApiKey] = useState("")

  const {
    messages,
    isLoading,
    error,
    selectedModel,
    sendMessage,
    clearMessages,
    setModel,
    setApiKey,
    clearError,
    stopGeneration,
    getAvailableModels,
  } = useOpenRouterChat()

  const handleSend = async () => {
    if (!inputMessage.trim()) return

    if (userApiKey) {
      setApiKey(userApiKey)
    }

    await sendMessage(inputMessage)
    setInputMessage("")
  }

  const handleModelChange = (modelId: string) => {
    setModel(modelId as any)
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>OpenRouter Chat Test</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowModelSwitcher(true)}>
              {formatModelName(selectedModel)}
            </Button>
            <Badge variant="secondary">
              {getAvailableModels().find((m) => m.id === selectedModel)?.provider}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* API Key Input */}
          <div>
            <label className="text-sm font-medium">OpenRouter API Key (optional)</label>
            <Input
              type="password"
              placeholder="sk-or-..."
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
            />
          </div>

          {/* Messages */}
          <div className="h-96 space-y-3 overflow-y-auto rounded border p-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground">
                Start a conversation with {formatModelName(selectedModel)}
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg p-3 ${
                  message.role === "user" ? "ml-12 bg-blue-500/20" : "mr-12 bg-gray-500/20"
                }`}
              >
                <div className="mb-1 text-sm font-medium">
                  {message.role === "user" ? "You" : formatModelName(selectedModel)}
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="mr-12 rounded-lg bg-gray-500/20 p-3">
                <div className="mb-1 text-sm font-medium">{formatModelName(selectedModel)}</div>
                <div className="text-muted-foreground">Thinking...</div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded border border-red-500/50 bg-red-500/20 p-3">
              <div className="font-medium text-red-400">Error</div>
              <div className="text-sm">{error}</div>
              <Button variant="ghost" size="sm" onClick={clearError} className="mt-2">
                Dismiss
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !inputMessage.trim()}>
              Send
            </Button>
            {isLoading && (
              <Button variant="outline" onClick={stopGeneration}>
                Stop
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearMessages} disabled={messages.length === 0}>
              Clear Chat
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  messages.map((m) => `${m.role}: ${m.content}`).join("\n\n")
                )
              }}
              disabled={messages.length === 0}
            >
              Copy Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      <ModelSwitcher selectedModel={selectedModel} onModelChange={handleModelChange} />
    </div>
  )
}
