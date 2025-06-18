"use client"

import { useState, useEffect } from "react"
import { useResumableStream } from "@/hooks/use-resumable-stream"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Play,
  Pause,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react"

interface StreamRecoveryProps {
  className?: string
}

export function StreamRecovery({ className }: StreamRecoveryProps) {
  const [prompt, setPrompt] = useState("")
  const [sessionIdInput, setSessionIdInput] = useState("")
  const [model, setModel] = useState("openai/gpt-4o-mini")

  const {
    content,
    isStreaming,
    error,
    sessionId,
    progress,
    sessionInfo,
    isConnected,
    isReconnecting,
    reconnectAttempts,
    startStream,
    resumeStream,
    stopStream,
    getStreamInfo,
    clearContent,
  } = useResumableStream({
    autoReconnect: true,
    maxReconnectAttempts: 5,
    reconnectDelay: 2000,
  })

  useEffect(() => {
    if (sessionId) {
      getStreamInfo()
    }
  }, [sessionId, getStreamInfo])

  const handleStartStream = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    await startStream(prompt, model)
  }

  const handleResumeStream = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionIdInput.trim()) return

    resumeStream(sessionIdInput.trim())
  }

  const handleStopStream = async () => {
    await stopStream()
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "generating":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "generating":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Stream Status</CardTitle>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="default" className="bg-green-500">
                  <Wifi className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              ) : isReconnecting ? (
                <Badge variant="secondary">
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  Reconnecting... ({reconnectAttempts}/5)
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <WifiOff className="mr-1 h-3 w-3" />
                  Disconnected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {sessionInfo && (
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Session ID:</span>
                <code className="rounded bg-muted px-2 py-1 text-xs">{sessionInfo.id}</code>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Model:</span>
                <Badge variant="outline">{sessionInfo.model}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(sessionInfo.status)}
                  <span className="text-sm capitalize">{sessionInfo.status}</span>
                </div>
              </div>

              {progress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress:</span>
                    <span className="text-xs text-muted-foreground">
                      {progress.totalChunks} chunks
                    </span>
                  </div>
                  {sessionInfo.status === "generating" && (
                    <Progress value={undefined} className="h-2" />
                  )}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* New Stream */}
      <Card>
        <CardHeader>
          <CardTitle>Start New Stream</CardTitle>
          <CardDescription>
            Create a new resumable stream that can survive page refreshes and network interruptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStartStream} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium">
                Prompt
              </label>
              <Input
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                disabled={isStreaming}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="model" className="text-sm font-medium">
                Model
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={isStreaming}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                <option value="openai/gpt-4o">GPT-4o</option>
                <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isStreaming || !prompt.trim()} className="flex-1">
                {isStreaming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Stream
                  </>
                )}
              </Button>

              {isStreaming && (
                <Button type="button" variant="destructive" onClick={handleStopStream}>
                  <Pause className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Resume Stream */}
      <Card>
        <CardHeader>
          <CardTitle>Resume Existing Stream</CardTitle>
          <CardDescription>
            Continue a stream using its session ID. Works across devices and page refreshes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResumeStream} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="sessionId" className="text-sm font-medium">
                Session ID
              </label>
              <Input
                id="sessionId"
                value={sessionIdInput}
                onChange={(e) => setSessionIdInput(e.target.value)}
                placeholder="Enter session ID to resume..."
                disabled={isStreaming}
              />
            </div>

            <Button
              type="submit"
              disabled={isStreaming || !sessionIdInput.trim()}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Resume Stream
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stream Output */}
      {(content || isStreaming) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Stream Output
              </CardTitle>
              <div className="flex gap-2">
                {sessionId && (
                  <code className="rounded bg-muted px-2 py-1 text-xs">ID: {sessionId}</code>
                )}
                <Button variant="outline" size="sm" onClick={clearContent} disabled={isStreaming}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4">
            <div className="max-h-[500px] min-h-[200px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {content}
                {isStreaming && (
                  <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-current">▋</span>
                )}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How Resumable Streams Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>Survives interruptions:</strong> Streams continue even if you close the tab or
            lose connection
          </p>
          <p>
            • <strong>Multi-device access:</strong> Use the session ID to view the same stream on
            different devices
          </p>
          <p>
            • <strong>Automatic recovery:</strong> The system automatically reconnects and resumes
            from where it left off
          </p>
          <p>
            • <strong>Background generation:</strong> LLM responses are generated server-side and
            persist in Redis
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
