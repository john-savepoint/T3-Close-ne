"use client"
import { Button } from "@/components/ui/button"
import { ChatInput } from "@/components/chat-input"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChatMessage } from "@/components/chat-message"
import { ThreadNavigator } from "@/components/thread-navigator"
import { ProjectContextIndicator } from "@/components/project-context-indicator"
import { MemoryContextIndicator } from "@/components/memory-context-indicator"
import { MemorySuggestionBanner } from "@/components/memory-suggestion-banner"
import { TemporaryChatBanner } from "@/components/temporary-chat-banner"
import { TemporaryChatStarter } from "@/components/temporary-chat-starter"
import { ToolsGrid } from "@/components/tools-grid"
import { useState } from "react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
  toolUsed?: string
  isEdited?: boolean
  editedAt?: Date
}
import { useMemory } from "@/hooks/use-memory"
import { useTemporaryChat } from "@/hooks/use-temporary-chat"
import { ShareChatModal } from "@/components/share-chat-modal"
import { ExportChatModal } from "@/components/export-chat-modal"
import { EnhancedModelSwitcher } from "@/components/enhanced-model-switcher"
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation"
import { useConversationTree } from "@/hooks/use-conversation-tree"
import { useAuth } from "@/hooks/use-auth"

export function MainContent() {
  const isMobile = useIsMobile()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState("gpt-4o")
  const { suggestions } = useMemory()
  const { temporaryChat, isTemporaryMode } = useTemporaryChat()
  const { user } = useAuth()

  // Keyboard navigation
  const { isModelSwitcherOpen, closeModelSwitcher, shortcuts } = useKeyboardNavigation()

  // Conversation tree
  const { conversationTree, renameBranch, getMessagePath } = useConversationTree(
    isTemporaryMode ? temporaryChat?.messages || [] : messages,
    currentMessageId
  )

  // Show the first non-dismissed suggestion (only in non-temporary mode)
  const activeSuggestion = !isTemporaryMode ? suggestions[0] : null

  // Use temporary chat messages if in temporary mode
  const displayMessages = isTemporaryMode ? temporaryChat?.messages || [] : messages

  // Get user display name
  const userName = user?.name || user?.email?.split("@")[0] || "there"

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (isTemporaryMode) {
      // Handle temporary chat message editing
      console.log("Edit temporary message:", messageId, newContent)
    } else {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content: newContent, isEdited: true, editedAt: new Date() }
            : m
        )
      )
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    if (isTemporaryMode) {
      // Handle temporary chat message deletion
      console.log("Delete temporary message:", messageId)
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    }
  }

  const handleBranchSelect = (branchId: string) => {
    // Switch to the selected branch
    console.log("Switch to branch:", branchId)
  }

  const handleMessageSelect = (messageId: string) => {
    setCurrentMessageId(messageId)
    // Scroll to message
    const element = document.getElementById(`message-${messageId}`)
    element?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const handleToolSelect = (toolId: string, result: any) => {
    // When a tool generates content, add it as the first message in the chat
    const newMessage = {
      id: `msg-${Date.now()}`,
      type: "assistant" as const,
      content: result.content,
      timestamp: new Date(),
      model: selectedModel,
      toolUsed: toolId,
    }

    if (isTemporaryMode) {
      // Handle temporary chat
      console.log("Add tool result to temporary chat:", newMessage)
    } else {
      setMessages([newMessage])
    }
  }

  return (
    <main className={`flex flex-1 ${isMobile ? "ml-0" : ""}`}>
      {/* Main chat area */}
      <div className="relative flex flex-1 flex-col">
        {/* Background and styling */}
        <div className="absolute inset-0 rounded-tl-xl border-l border-t border-mauve-dark bg-mauve-dark/50"></div>
        <div className="noise-bg absolute inset-0 rounded-tl-xl opacity-20 mix-blend-overlay"></div>

        {/* Context Indicators */}
        {isTemporaryMode ? <TemporaryChatBanner /> : <ProjectContextIndicator />}
        {!isTemporaryMode && <MemoryContextIndicator />}

        {/* Content wrapper */}
        <div className="relative flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1" />
          {displayMessages.length === 0 ? (
            // Welcome screen with tools
            <div className="flex flex-col items-center justify-center space-y-8 p-4 text-center md:p-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                  How can I help you, {userName}?
                </h2>
                <p className="mt-2 text-lg text-mauve-subtle/80">
                  Choose a specialized tool or start a conversation
                </p>
              </div>

              {/* Tools Grid */}
              <div className="w-full max-w-4xl">
                <ToolsGrid onToolSelect={handleToolSelect} />
              </div>

              {/* Temporary Chat Starter - only show when not in temporary mode */}
              {!isTemporaryMode && (
                <div className="w-full max-w-md">
                  <TemporaryChatStarter />
                </div>
              )}

              {/* Quick Start Prompts */}
              <div className="mx-auto flex w-full max-w-2xl flex-col space-y-2">
                <div className="mb-2 text-sm text-mauve-subtle/60">Or try these quick prompts:</div>
                <Button
                  variant="ghost"
                  className="justify-start bg-mauve-surface/30 p-3 hover:bg-mauve-surface/50"
                >
                  How does AI work?
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start bg-mauve-surface/30 p-3 hover:bg-mauve-surface/50"
                >
                  Are black holes real?
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start bg-mauve-surface/30 p-3 hover:bg-mauve-surface/50"
                >
                  How many Rs are in the word "strawberry"?
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start bg-mauve-surface/30 p-3 hover:bg-mauve-surface/50"
                >
                  What is the meaning of life?
                </Button>
              </div>
            </div>
          ) : (
            // Chat messages
            <div className="flex-1 space-y-4 p-4">
              {activeSuggestion && <MemorySuggestionBanner suggestion={activeSuggestion} />}
              {displayMessages.map((message) => (
                <div key={message.id} id={`message-${message.id}`}>
                  <ChatMessage
                    {...message}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                    onRegenerate={(id) => {
                      // Implement regeneration logic
                    }}
                    onCopy={(content) => {
                      navigator.clipboard.writeText(content)
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex-1" />

          {/* Chat Input */}
          <div className="sticky bottom-0 bg-gradient-to-t from-mauve-dark to-transparent px-4 pb-4 md:pb-8">
            <ChatInput />
          </div>
        </div>

        {/* Top right controls */}
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          <ExportChatModal messages={displayMessages} chatTitle="Current Chat Title" />
          <ShareChatModal
            chatId="current-chat-id"
            chatTitle="Current Chat Title"
            messageCount={displayMessages.length}
          />
          <ThreadNavigator
            messages={displayMessages}
            currentMessageId={currentMessageId || undefined}
            onMessageSelect={(messageId: string) => setCurrentMessageId(messageId)}
            onBranchSelect={handleBranchSelect}
            onBranchRename={renameBranch}
          />
        </div>
      </div>

      {/* Enhanced Model Switcher */}
      <EnhancedModelSwitcher
        isOpen={isModelSwitcherOpen}
        onClose={closeModelSwitcher}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />
    </main>
  )
}
