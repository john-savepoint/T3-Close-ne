"use client"

import { useState } from 'react'
import { useOpenRouterChat } from '@/hooks/use-openrouter-chat'
import { EnhancedModelSwitcher } from '@/components/enhanced-model-switcher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatModelName } from '@/lib/openrouter'

export default function TestChatPage() {
  const [showModelSwitcher, setShowModelSwitcher] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [userApiKey, setUserApiKey] = useState('')
  
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
    getAvailableModels
  } = useOpenRouterChat()

  const handleSend = async () => {
    if (!inputMessage.trim()) return
    
    if (userApiKey) {
      setApiKey(userApiKey)
    }
    
    await sendMessage(inputMessage)
    setInputMessage('')
  }

  const handleModelChange = (modelId: string) => {
    setModel(modelId as any)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>OpenRouter Chat Test</CardTitle>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              onClick={() => setShowModelSwitcher(true)}
            >
              {formatModelName(selectedModel)}
            </Button>
            <Badge variant="secondary">
              {getAvailableModels().find(m => m.id === selectedModel)?.provider}
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
          <div className="h-96 overflow-y-auto border rounded p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground">
                Start a conversation with {formatModelName(selectedModel)}
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-500/20 ml-12' 
                    : 'bg-gray-500/20 mr-12'
                }`}
              >
                <div className="font-medium text-sm mb-1">
                  {message.role === 'user' ? 'You' : formatModelName(selectedModel)}
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="bg-gray-500/20 mr-12 p-3 rounded-lg">
                <div className="font-medium text-sm mb-1">
                  {formatModelName(selectedModel)}
                </div>
                <div className="text-muted-foreground">Thinking...</div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded p-3">
              <div className="font-medium text-red-400">Error</div>
              <div className="text-sm">{error}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="mt-2"
              >
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
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !inputMessage.trim()}
            >
              Send
            </Button>
            {isLoading && (
              <Button 
                variant="outline" 
                onClick={stopGeneration}
              >
                Stop
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearMessages}
              disabled={messages.length === 0}
            >
              Clear Chat
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  messages.map(m => `${m.role}: ${m.content}`).join('\n\n')
                )
              }}
              disabled={messages.length === 0}
            >
              Copy Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      <EnhancedModelSwitcher
        isOpen={showModelSwitcher}
        onClose={() => setShowModelSwitcher(false)}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
      />
    </div>
  )
}