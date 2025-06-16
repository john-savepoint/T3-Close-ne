"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  GitBranch,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react"
import { T3Logo } from "@/components/t3-logo"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useChatSharing } from "@/hooks/use-chat-sharing"
import type { PublicChatView as PublicChatViewType } from "@/types/sharing"

interface PublicChatViewProps {
  chat: PublicChatViewType
}

export function PublicChatView({ chat }: PublicChatViewProps) {
  const { forkConversation, incrementViewCount, loading } = useChatSharing()
  const [isForking, setIsForking] = useState(false)
  const [copied, setCopied] = useState(false)

  // Track view (would normally be done server-side)
  React.useEffect(() => {
    incrementViewCount(chat.token)
  }, [chat.token, incrementViewCount])

  const handleForkConversation = async () => {
    setIsForking(true)
    try {
      // Check if user is authenticated (mock check)
      const isLoggedIn = false // This would come from your auth context

      if (!isLoggedIn) {
        // Store fork data in sessionStorage and redirect to login
        sessionStorage.setItem(
          "pendingFork",
          JSON.stringify({
            token: chat.token,
            messages: chat.messages,
            title: chat.title,
          })
        )
        window.location.href = "/login?redirect=fork"
        return
      }

      // If logged in, fork immediately
      const newChatId = await forkConversation({
        token: chat.token,
        messages: chat.messages,
        title: `Forked: ${chat.title}`,
      })

      // Redirect to the new chat
      window.location.href = `/chat/${newChatId}`
    } catch (error) {
      console.error("Failed to fork conversation:", error)
    } finally {
      setIsForking(false)
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const extractCodeBlocks = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const blocks = []
    let match
    let lastIndex = 0

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        blocks.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
        })
      }

      blocks.push({
        type: "code",
        language: match[1] || "text",
        content: match[2].trim(),
      })

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      blocks.push({
        type: "text",
        content: text.slice(lastIndex),
      })
    }

    return blocks.length > 0 ? blocks : [{ type: "text", content: text }]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-mauve-dark bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <T3Logo className="h-6 text-foreground" />
              <div className="hidden md:block">
                <Badge
                  variant="outline"
                  className="border-mauve-accent/50 bg-mauve-accent/20 text-xs text-mauve-bright"
                >
                  Shared Conversation
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>

              <Button
                onClick={handleForkConversation}
                disabled={isForking}
                className="bg-mauve-accent/20 text-mauve-bright hover:bg-mauve-accent/30"
              >
                {isForking ? (
                  "Creating..."
                ) : (
                  <>
                    <GitBranch className="mr-2 h-4 w-4" />
                    Fork Conversation
                  </>
                )}
              </Button>

              <Button asChild size="sm">
                <a href="/" className="flex items-center gap-2">
                  Sign Up
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* Chat Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">{chat.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-mauve-subtle/70">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {chat.createdAt.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {chat.messageCount} messages
            </div>
          </div>

          {/* Fork CTA */}
          <Alert className="mt-6 border-mauve-accent/20 bg-mauve-accent/10">
            <Sparkles className="h-4 w-4 text-mauve-accent" />
            <AlertDescription className="text-mauve-subtle">
              <strong>Want to continue this conversation?</strong> Fork it to your T3Chat account
              and keep the discussion going with AI.
              <Button
                onClick={handleForkConversation}
                disabled={isForking}
                size="sm"
                className="ml-3 bg-mauve-accent/20 hover:bg-mauve-accent/30"
              >
                {isForking ? "Creating..." : "Fork Now"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        </div>

        {/* Messages */}
        <div className="space-y-6">
          {chat.messages.map((message) => {
            const blocks = extractCodeBlocks(message.content)

            return (
              <div
                key={message.id}
                className={`flex gap-4 rounded-lg p-6 transition-colors ${
                  message.type === "user" ? "ml-8 bg-mauve-surface/30" : "bg-mauve-dark/20"
                }`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {message.type === "user" ? (
                    <AvatarFallback className="bg-blue-500/20 text-blue-400">U</AvatarFallback>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-mauve-accent/20">
                      <span className="text-xs font-bold text-mauve-bright">AI</span>
                    </div>
                  )}
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {message.type === "user" ? "User" : "Assistant"}
                    </span>
                    {message.model && (
                      <Badge variant="outline" className="text-xs">
                        {message.model}
                      </Badge>
                    )}
                    <span className="text-xs text-mauve-subtle/70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    {blocks.map((block, index) => (
                      <div key={index}>
                        {block.type === "text" ? (
                          <div className="whitespace-pre-wrap text-sm text-foreground">
                            {block.content}
                          </div>
                        ) : (
                          <div className="my-4">
                            <div className="flex items-center justify-between rounded-t-lg border-b border-mauve-dark bg-mauve-dark/50 px-4 py-2">
                              <Badge variant="outline" className="text-xs">
                                {block.language}
                              </Badge>
                            </div>
                            <SyntaxHighlighter
                              language={block.language}
                              style={oneDark}
                              customStyle={{
                                margin: 0,
                                borderTopLeftRadius: 0,
                                borderTopRightRadius: 0,
                                backgroundColor: "hsl(288, 15%, 12%)",
                              }}
                            >
                              {block.content}
                            </SyntaxHighlighter>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-4 rounded-xl border border-mauve-dark bg-mauve-surface/30 p-6">
            <T3Logo className="h-8 text-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Continue the conversation</h3>
            <p className="max-w-md text-sm text-mauve-subtle/70">
              Fork this conversation to your own T3Chat account and keep exploring with AI.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleForkConversation}
                disabled={isForking}
                className="bg-mauve-accent/20 hover:bg-mauve-accent/30"
              >
                <GitBranch className="mr-2 h-4 w-4" />
                {isForking ? "Creating..." : "Fork Conversation"}
              </Button>
              <Button variant="outline" asChild>
                <a href="/">Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-mauve-dark">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-mauve-subtle/70">
          <p>
            Powered by{" "}
            <a href="/" className="text-mauve-accent transition-colors hover:text-mauve-bright">
              T3Chat
            </a>{" "}
            • Build better with AI
          </p>
        </div>
      </footer>
    </div>
  )
}
