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
import { useState, useRef, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useChat } from "@/hooks/use-chat"
import { useMemory } from "@/hooks/use-memory"
import { useTemporaryChat } from "@/hooks/use-temporary-chat"
import { ShareChatModal } from "@/components/share-chat-modal"
import { ExportChatModal } from "@/components/export-chat-modal"
import { EnhancedModelSwitcher } from "@/components/enhanced-model-switcher"
import { useModels } from "@/hooks/use-models"
import { ChatModel, SupportedModel } from "@/types/models"
import { createOpenRouterClient } from "@/lib/openrouter"
import type { Attachment } from "@/types/attachment"
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation"
import { useConversationTree } from "@/hooks/use-conversation-tree"
import { useAuth } from "@/hooks/use-auth"
import { DEFAULT_MODEL_ID } from "@/lib/default-models"
import { useProjects } from "@/hooks/use-projects"
import { useUIPreferences } from "@/hooks/use-ui-preferences"

export function MainContent() {
  const isMobile = useIsMobile()
  const searchParams = useSearchParams()
  const chatId = searchParams.get("chatId")
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { selectedModel: modelsSelectedModel, setSelectedModel } = useModels()
  const [estimatedTokens, setEstimatedTokens] = useState(1000)
  const { suggestions } = useMemory()
  const {
    temporaryChat,
    isTemporaryMode,
    addMessageToTemporaryChat,
    updateTemporaryChatMessage,
    deleteTemporaryChatMessage,
    startTemporaryChat,
    settings,
    isStreaming,
    setIsStreaming,
  } = useTemporaryChat()
  const { user, isLoading: authLoading, isAuthenticating, syncError } = useAuth()
  const { activeProject } = useProjects()
  const { isDismissed } = useUIPreferences()

  // Memoize projectId to prevent infinite re-renders
  const projectId = useMemo(() => activeProject?.id, [activeProject?.id])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Abort any ongoing fetch requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Real chat functionality with persistence
  const {
    messages,
    isLoading,
    error,
    selectedModel,
    temperature,
    sendMessage,
    editMessage,
    deleteMessage,
    regenerateResponse,
    clearMessages,
    stopStreaming,
    changeModel,
    setTemperature,
  } = useChat({
    initialModel: (modelsSelectedModel?.id || "openai/gpt-4o-mini") as SupportedModel,
    projectId,
    chatId: chatId || undefined,
  })

  // Keyboard navigation
  const { isModelSwitcherOpen, closeModelSwitcher, shortcuts } = useKeyboardNavigation()

  // Conversation tree
  const { conversationTree, renameBranch, getMessagePath } = useConversationTree({
    messages: isTemporaryMode ? temporaryChat?.messages || [] : messages,
    activeLeafId: currentMessageId,
  })

  // Show the first non-dismissed suggestion (only in non-temporary mode)
  const activeSuggestion = !isTemporaryMode ? suggestions[0] : null

  // Use temporary chat messages if in temporary mode, otherwise use real chat
  const displayMessages = isTemporaryMode ? temporaryChat?.messages || [] : messages

  // Get user display name
  const userName = user?.name || user?.email?.split("@")[0] || "there"

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (isTemporaryMode) {
      updateTemporaryChatMessage(messageId, newContent)
    } else {
      editMessage(messageId, newContent)
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    if (isTemporaryMode) {
      deleteTemporaryChatMessage(messageId)
    } else {
      deleteMessage(messageId)
    }
  }

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    if (isTemporaryMode) {
      // Add user message to temporary chat
      addMessageToTemporaryChat(content, "user")

      // Create new abort controller for this request
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      // Call the API to get response
      try {
        setIsStreaming(true)
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              ...(temporaryChat?.messages || []).map((msg) => ({
                role: msg.type === "user" ? "user" : "assistant",
                content: msg.content,
              })),
              { role: "user", content },
            ],
            model: modelsSelectedModel?.id || "openai/gpt-4o-mini",
            temperature,
            // Don't include memory/context if setting is disabled
            includeMemory: settings.includeMemoryInTempChats,
            projectId,
          }),
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error("No response body")

        let assistantMessage = ""
        const decoder = new TextDecoder()

        // Add empty assistant message that we'll update as chunks come in
        const assistantMessageId = addMessageToTemporaryChat(
          "",
          "assistant",
          modelsSelectedModel?.id || "openai/gpt-4o-mini"
        )
        if (!assistantMessageId) throw new Error("Failed to create assistant message")

        while (!abortController.signal.aborted) {
          const { done, value } = await reader.read()
          if (done) break

          try {
            const chunk = decoder.decode(value)
            const lines = chunk.split("\n").filter((line) => line.trim() !== "")

            for (const line of lines) {
              if (line.startsWith("0:")) {
                try {
                  const content = line.slice(2).replace(/"/g, "").replace(/\\n/g, "\n")
                  assistantMessage += content
                  if (!abortController.signal.aborted) {
                    updateTemporaryChatMessage(assistantMessageId, assistantMessage)
                  }
                } catch (parseError) {
                  console.warn("Failed to parse stream chunk:", line, parseError)
                }
              }
            }
          } catch (chunkError) {
            console.error("Error processing stream chunk:", chunkError)
          }
        }
      } catch (error: any) {
        // Don't show error if it was aborted
        if (error.name !== "AbortError") {
          console.error("Error sending temporary message:", error)
          addMessageToTemporaryChat("Sorry, I encountered an error. Please try again.", "assistant")
        }
      } finally {
        setIsStreaming(false)
        // Clear the ref if this was the current request
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null
        }
      }
    } else {
      await sendMessage(content, attachments)
    }
  }

  const handleBranchSelect = (branchId: string) => {
    // Switch to the selected branch by finding the leaf message ID
    const branches = conversationTree.branches
    const branch =
      branches instanceof Map
        ? branches.get(branchId)
        : Array.isArray(branches)
          ? branches.find((b: any) => b.id === branchId)
          : undefined
    if (branch && branch.messages && branch.messages.length > 0) {
      const leafMessage = branch.messages[branch.messages.length - 1]
      setCurrentMessageId(leafMessage.id)
      // In a real implementation, we would update the chat's activeLeafMessageId
      // and refetch the conversation based on this new active path
      console.log("Switch to branch:", branchId, "leaf:", leafMessage.id)
    }
  }

  const handleMessageSelect = (messageId: string) => {
    setCurrentMessageId(messageId)
    // Scroll to message
    const element = document.getElementById(`message-${messageId}`)
    element?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const handleToolSelect = async (toolId: string, result: any) => {
    // When a tool generates content, send it as a message
    if (isTemporaryMode) {
      await handleSendMessage(`Tool result from ${toolId}: ${result.content}`)
    } else {
      await sendMessage(`Tool result from ${toolId}: ${result.content}`)
    }
  }

  const handleMessageSent = async (message: string, modelId: string, attachments: Attachment[]) => {
    // Delegate to the appropriate chat handler based on mode
    if (isTemporaryMode) {
      await handleSendMessage(message, attachments)
    } else {
      await sendMessage(message, attachments)
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

              {/* Temporary Chat Starter - only show when not in temporary mode and not dismissed */}
              {!isTemporaryMode && !isDismissed("temporaryChatStarter") && (
                <div className="w-full max-w-md">
                  <TemporaryChatStarter />
                </div>
              )}

            </div>
          ) : (
            // Chat messages
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-4xl space-y-4 px-4 py-4">
                {activeSuggestion && <MemorySuggestionBanner suggestion={activeSuggestion} />}

                {/* Error display */}
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
                    <p className="font-medium">Error:</p>
                    <p className="text-sm">{error.message || String(error)}</p>
                  </div>
                )}
                
                {/* Auth sync error display */}
                {syncError && (
                  <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-400">
                    <p className="font-medium">Authentication Sync Issue</p>
                    <p className="text-sm">We're having trouble syncing your account. Please refresh the page or try signing out and back in.</p>
                  </div>
                )}
                
                {/* Auth loading state */}
                {isAuthenticating && (
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4 text-blue-400">
                    <p className="text-sm">Syncing your account...</p>
                  </div>
                )}

                {displayMessages.map((message) => (
                  <div key={message.id} id={`message-${message.id}`}>
                    <ChatMessage
                      {...message}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessage}
                      onRegenerate={regenerateResponse}
                      onCopy={(content) => {
                        navigator.clipboard.writeText(content).then(() => {
                          // Success is handled in the component itself
                        }).catch(err => {
                          console.error('Failed to copy:', err)
                        })
                      }}
                    />
                  </div>
                ))}

                {/* Loading indicator */}
                {((isLoading && !isTemporaryMode) || (isStreaming && isTemporaryMode)) &&
                  displayMessages.length > 0 && (
                    <div className="flex items-center space-x-2 text-mauve-subtle">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-mauve-accent border-t-transparent"></div>
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  )}
              </div>
            </div>
          )}
          <div className="flex-1" />

          {/* Chat Input */}
          <div className="sticky bottom-0 bg-gradient-to-t from-mauve-dark to-transparent pb-4 md:pb-8">
            <div className="mx-auto max-w-4xl px-4">
              <ChatInput
                onSendMessage={handleSendMessage}
                onMessageSent={handleMessageSent}
                isLoading={isTemporaryMode ? isStreaming : isLoading}
                onStopGeneration={stopStreaming}
                selectedModel={selectedModel}
                onModelChange={(model: string) => changeModel(model as any)}
                temperature={temperature}
                onTemperatureChange={setTemperature}
                disabled={!!error || (isTemporaryMode && isStreaming)}
              />
            </div>
          </div>
        </div>

        {/* Top right controls */}
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          <ExportChatModal
            messages={displayMessages}
            chatTitle={
              displayMessages.length > 0 ? `Chat ${new Date().toLocaleDateString()}` : "New Chat"
            }
          />
          <ShareChatModal
            chatId={`chat-${Date.now()}`}
            chatTitle={
              displayMessages.length > 0 ? `Chat ${new Date().toLocaleDateString()}` : "New Chat"
            }
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
    </main>
  )
}
