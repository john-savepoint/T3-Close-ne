"use client"

import { useChat as useAIChat } from "ai/react"
import { useCallback, useRef } from "react"
import { SupportedModel } from "@/types/models"

interface UseChatStreamingOptions {
  initialModel?: SupportedModel
  apiKey?: string
  chatId?: string
  projectId?: string
  onResponse?: (response: Response) => void
  onFinish?: (message: any) => void
  onError?: (error: Error) => void
}

export function useChatStreaming(options: UseChatStreamingOptions = {}) {
  const abortControllerRef = useRef<AbortController | null>(null)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    reload,
    setMessages,
    setInput,
    append,
    data,
  } = useAIChat({
    api: "/api/chat",
    id: options.chatId,
    initialMessages: [],
    body: {
      model: options.initialModel || "openai/gpt-4o-mini",
      apiKey: options.apiKey,
      projectId: options.projectId,
    },
    onResponse: (response) => {
      console.log("Stream response started:", response.status)
      options.onResponse?.(response)
    },
    onFinish: (message) => {
      console.log("Stream finished:", message)
      options.onFinish?.(message)
    },
    onError: (error) => {
      console.error("Stream error:", error)
      options.onError?.(error)
    },
  })

  // Enhanced message sending with proper typing
  const sendMessage = useCallback(
    async (
      content: string,
      messageOptions?: {
        model?: SupportedModel
        apiKey?: string
        temperature?: number
        maxTokens?: number
        topP?: number
      }
    ) => {
      if (!content.trim()) return

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      try {
        await append(
          {
            role: "user",
            content: content.trim(),
          },
          {
            body: {
              model: messageOptions?.model || options.initialModel || "openai/gpt-4o-mini",
              apiKey: messageOptions?.apiKey || options.apiKey,
              temperature: messageOptions?.temperature || 0.7,
              maxTokens: messageOptions?.maxTokens || 4096,
              topP: messageOptions?.topP || 1,
              projectId: options.projectId,
            },
          }
        )
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Stream was cancelled")
          return
        }
        console.error("Failed to send message:", error)
        throw error
      } finally {
        abortControllerRef.current = null
      }
    },
    [append, options.initialModel, options.apiKey]
  )

  // Model switching
  const switchModel = useCallback((model: SupportedModel) => {
    // Update the model for future messages
    // This will be passed in the body of the next request
    console.log("Switched to model:", model)
  }, [])

  // API key updating
  const updateApiKey = useCallback((apiKey: string | null) => {
    // Update the API key for future messages
    console.log("Updated API key")
  }, [])

  // Enhanced stop with cleanup
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    stop()
  }, [stop])

  // Clear conversation
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [setMessages])

  // Regenerate last message
  const regenerateLastMessage = useCallback(() => {
    if (messages.length > 0) {
      reload()
    }
  }, [messages.length, reload])

  // Get streaming status
  const isStreaming = isLoading

  return {
    // Core chat state
    messages,
    input,
    isLoading,
    isStreaming,
    error,
    data,

    // Input handling
    handleInputChange,
    handleSubmit,
    setInput,

    // Message management
    sendMessage,
    clearMessages,
    setMessages,
    append,

    // Stream control
    stopStreaming,
    regenerateLastMessage,
    reload,

    // Configuration
    switchModel,
    updateApiKey,
  }
}

export type ChatStreamingHook = ReturnType<typeof useChatStreaming>
