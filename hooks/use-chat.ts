"use client"

import { useChatStreaming } from "./use-chat-streaming"
import { SupportedModel } from "@/types/models"
import { useCallback, useState } from "react"
import type { Attachment } from "@/types/attachment"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

interface UseChatOptions {
  initialModel?: SupportedModel
  apiKey?: string
  chatId?: string
}

export interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
  toolUsed?: string
  isEdited?: boolean
  editedAt?: Date
  attachments?: Attachment[]
}

export function useChat(options: UseChatOptions = {}) {
  const [selectedModel, setSelectedModel] = useState<SupportedModel>(
    options.initialModel || "openai/gpt-4o-mini"
  )
  const [apiKey, setApiKey] = useState<string | undefined>(options.apiKey)
  const [temperature, setTemperature] = useState<number>(0.7)

  // Convex mutations
  const editMessageMutation = useMutation(api.messages.edit)
  const deleteMessageMutation = useMutation(api.messages.deleteMessage)

  const {
    messages: aiMessages,
    input,
    handleInputChange,
    isLoading,
    error,
    sendMessage: aiSendMessage,
    clearMessages: aiClearMessages,
    setInput,
    stopStreaming,
    regenerateLastMessage,
    switchModel,
    updateApiKey,
  } = useChatStreaming({
    initialModel: selectedModel,
    apiKey,
    chatId: options.chatId,
    onResponse: (response) => {
      console.log("Chat response:", response.status)
    },
    onFinish: (message) => {
      console.log("Chat finished:", message)
    },
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  // Convert AI SDK messages to our ChatMessage format
  const messages: ChatMessage[] = aiMessages.map((msg) => ({
    id: msg.id,
    type: msg.role === "user" ? "user" : "assistant",
    content: msg.content,
    timestamp: new Date(msg.createdAt || Date.now()),
    model: selectedModel,
  }))

  // Enhanced send message with attachments support
  const sendMessage = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      if (!content.trim()) return

      // For now, include attachment metadata in the message
      // In a more advanced implementation, we'd process attachments
      let messageContent = content.trim()
      if (attachments && attachments.length > 0) {
        const attachmentSummary = attachments
          .map((att) => `[Attachment: ${att.filename}]`)
          .join(" ")
        messageContent = `${messageContent}\n\n${attachmentSummary}`
      }

      await aiSendMessage(messageContent, {
        model: selectedModel,
        apiKey,
        temperature,
      })
    },
    [aiSendMessage, selectedModel, apiKey, temperature]
  )

  // Update model and propagate to streaming hook
  const changeModel = useCallback(
    (model: SupportedModel) => {
      setSelectedModel(model)
      switchModel(model)
    },
    [switchModel]
  )

  // Update API key and propagate to streaming hook
  const changeApiKey = useCallback(
    (newApiKey: string | null) => {
      setApiKey(newApiKey || undefined)
      updateApiKey(newApiKey)
    },
    [updateApiKey]
  )

  // Edit message functionality
  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      try {
        // Optimistic update for immediate UI feedback
        const messageIndex = aiMessages.findIndex((msg) => msg.id === messageId)
        if (messageIndex !== -1) {
          // Call Convex mutation to persist changes
          const result = await editMessageMutation({
            messageId: messageId as any, // TODO: Fix type conversion for Convex ID
            content: newContent.trim(),
          })

          if (result.success) {
            console.log("Message edited successfully:", result.messageId)
            // The message will be updated via Convex live queries
          }
        }
      } catch (error) {
        console.error("Failed to edit message:", error)
        // TODO: Show user-facing error notification
        // Could revert optimistic update here
      }
    },
    [aiMessages, editMessageMutation]
  )

  // Delete message functionality
  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        // Call Convex mutation to delete message and children
        const result = await deleteMessageMutation({
          messageId: messageId as any, // TODO: Fix type conversion for Convex ID
        })

        if (result.success) {
          console.log(`Successfully deleted ${result.deletedCount} message(s)`)
          // The messages will be removed via Convex live queries
        }
      } catch (error) {
        console.error("Failed to delete message:", error)
        // TODO: Show user-facing error notification
      }
    },
    [deleteMessageMutation]
  )

  // Regenerate response
  const regenerateResponse = useCallback(
    (messageId: string) => {
      regenerateLastMessage()
    },
    [regenerateLastMessage]
  )

  return {
    // Chat state
    messages,
    isLoading,
    isStreaming: isLoading,
    error,
    selectedModel,
    apiKey,
    temperature,

    // Input state
    input,
    setInput,
    handleInputChange,

    // Core actions
    sendMessage,
    editMessage,
    deleteMessage,
    regenerateResponse,
    clearMessages: aiClearMessages,
    stopStreaming,

    // Configuration
    changeModel,
    changeApiKey,
    setTemperature,
  }
}

export type ChatHook = ReturnType<typeof useChat>
