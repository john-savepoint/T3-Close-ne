"use client"

import { useChatStreaming } from "./use-chat-streaming"
import { SupportedModel } from "@/types/models"
import { useCallback, useState } from "react"
import type { Attachment } from "@/types/attachment"

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
    (messageId: string, newContent: string) => {
      // Update the message in the local state
      const messageIndex = aiMessages.findIndex((msg) => msg.id === messageId)
      if (messageIndex !== -1) {
        const updatedMessages = [...aiMessages]
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: newContent,
        }
        // Note: We would need to update the streaming hook to support this
        // For now, we'll need to implement this in the messages management
        console.log("Edit message:", messageId, newContent)
        // TODO: Persist to database
      }
    },
    [aiMessages]
  )

  // Delete message functionality
  const deleteMessage = useCallback(
    (messageId: string) => {
      // Remove the message and all subsequent messages in the conversation
      const messageIndex = aiMessages.findIndex((msg) => msg.id === messageId)
      if (messageIndex !== -1) {
        const filteredMessages = aiMessages.slice(0, messageIndex)
        // Note: We would need to update the streaming hook to support this
        console.log("Delete message:", messageId)
        // TODO: Update the conversation context
        // TODO: Persist to database
      }
    },
    [aiMessages]
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
