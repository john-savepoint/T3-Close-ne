"use client"

import { BrainCircuit, Code, GraduationCap, Sparkles } from "lucide-react"
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
import { useState } from "react"
import { useMemory } from "@/hooks/use-memory"
import { useTemporaryChat } from "@/hooks/use-temporary-chat"
import { ShareChatModal } from "@/components/share-chat-modal"
import { ExportChatModal } from "@/components/export-chat-modal"
import { EnhancedModelSwitcher } from "@/components/enhanced-model-switcher"
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation"
import { useConversationTree } from "@/hooks/use-conversation-tree"

export function MainContent() {
  const isMobile = useIsMobile()
  const [messages, setMessages] = useState([])
  const [currentMessageId, setCurrentMessageId] = useState(null)
  const [selectedModel, setSelectedModel] = useState("gpt-4o")
  const { suggestions } = useMemory()
  const { temporaryChat, isTemporaryMode } = useTemporaryChat()

  // Keyboard navigation
  const { isModelSwitcherOpen, closeModelSwitcher, shortcuts } = useKeyboardNavigation()

  // Conversation tree
  const { conversationTree, renameBranch, getMessagePath } = useConversationTree(
    isTemporaryMode ? temporaryChat?.messages || [] : messages,
    currentMessageId,
  )

  // Show the first non-dismissed suggestion (only in non-temporary mode)
  const activeSuggestion = !isTemporaryMode ? suggestions[0] : null

  // Use temporary chat messages if in temporary mode
  const displayMessages = isTemporaryMode ? temporaryChat?.messages || [] : messages

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (isTemporaryMode) {
      // Handle temporary chat message editing
      console.log("Edit temporary message:", messageId, newContent)
    } else {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, content: newContent, isEdited: true, editedAt: new Date() } : m)),
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

  return (
    <main className={`flex-1 flex ${isMobile ? "ml-0" : ""}`}>
      {/* Main chat area */}
      <div className="flex-1 flex flex-col relative">
        {/* Background and styling */}
        <div className="absolute inset-0 bg-mauve-dark/50 border-l border-t border-mauve-dark rounded-tl-xl"></div>
        <div className="absolute inset-0 opacity-20 mix-blend-overlay rounded-tl-xl noise-bg"></div>

        {/* Context Indicators */}
        {isTemporaryMode ? <TemporaryChatBanner /> : <ProjectContextIndicator />}
        {!isTemporaryMode && <MemoryContextIndicator />}

        {/* Content wrapper */}
        <div className="relative flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1" />
          {displayMessages.length === 0 ? (
            // Welcome screen
            <div className="flex flex-col items-center justify-center p-4 md:p-8 text-center space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">How can I help you, John?</h2>
                <div className="mt-6 flex flex-wrap justify-center gap-3 md:gap-4">
                  <Button variant="outline" className="bg-mauve-surface/50 border-mauve-dark hover:bg-mauve-surface/80">
                    <Sparkles className="mr-2 h-4 w-4" /> Create
                  </Button>
                  <Button variant="outline" className="bg-mauve-surface/50 border-mauve-dark hover:bg-mauve-surface/80">
                    <BrainCircuit className="mr-2 h-4 w-4" /> Explore
                  </Button>
                  <Button variant="outline" className="bg-mauve-surface/50 border-mauve-dark hover:bg-mauve-surface/80">
                    <Code className="mr-2 h-4 w-4" /> Code
                  </Button>
                  <Button variant="outline" className="bg-mauve-surface/50 border-mauve-dark hover:bg-mauve-surface/80">
                    <GraduationCap className="mr-2 h-4 w-4" /> Learn
                  </Button>
                </div>
              </div>

              {!isTemporaryMode && (
                <div className="w-full max-w-md">
                  <TemporaryChatStarter />
                </div>
              )}

              <div className="flex flex-col w-full max-w-2xl mx-auto space-y-2">
                <Button variant="ghost" className="justify-start p-3 bg-mauve-surface/30 hover:bg-mauve-surface/50">
                  How does AI work?
                </Button>
                <Button variant="ghost" className="justify-start p-3 bg-mauve-surface/30 hover:bg-mauve-surface/50">
                  Are black holes real?
                </Button>
                <Button variant="ghost" className="justify-start p-3 bg-mauve-surface/30 hover:bg-mauve-surface/50">
                  How many Rs are in the word "strawberry"?
                </Button>
                <Button variant="ghost" className="justify-start p-3 bg-mauve-surface/30 hover:bg-mauve-surface/50">
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
          <div className="sticky bottom-0 px-4 pb-4 md:pb-8 bg-gradient-to-t from-mauve-dark to-transparent">
            <ChatInput />
          </div>
        </div>

        {/* Top right controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <ExportChatModal messages={displayMessages} chatTitle="Current Chat Title" />
          <ShareChatModal
            chatId="current-chat-id"
            chatTitle="Current Chat Title"
            messageCount={displayMessages.length}
          />
          <ThreadNavigator
            messages={displayMessages}
            currentMessageId={currentMessageId}
            onMessageSelect={setCurrentMessageId}
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
