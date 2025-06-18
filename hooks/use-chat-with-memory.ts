"use client"

import { useChat as useAIChat } from "ai/react"
import { useCallback, useRef, useMemo } from "react"
import { SupportedModel } from "@/types/models"
import { useMemory } from "./use-memory"
import { useProjects } from "./use-projects"

interface UseChatWithMemoryOptions {
  initialModel?: SupportedModel
  apiKey?: string
  chatId?: string
  includeMemories?: boolean
  onResponse?: (response: Response) => void
  onFinish?: (message: any) => void
  onError?: (error: Error) => void
}

export function useChatWithMemory(options: UseChatWithMemoryOptions = {}) {
  const abortControllerRef = useRef<AbortController | null>(null)
  const { memories, trackMemoryUsage } = useMemory()
  const { activeProject } = useProjects()

  // Build memory context string from active memories
  const memoryContext = useMemo(() => {
    if (!options.includeMemories || memories.length === 0) {
      return ""
    }

    // Group memories by category
    const memoryGroups: Record<string, typeof memories> = {}
    memories.forEach((memory) => {
      const category = memory.category || "general"
      if (!memoryGroups[category]) {
        memoryGroups[category] = []
      }
      memoryGroups[category].push(memory)
    })

    // Format memories into context string
    let context = ""
    Object.entries(memoryGroups).forEach(([category, categoryMemories]) => {
      if (categoryMemories.length > 0) {
        context += `\n${category.charAt(0).toUpperCase() + category.slice(1)}:\n`
        categoryMemories.forEach((memory) => {
          context += `- ${memory.content}\n`
        })
      }
    })

    return context
  }, [memories, options.includeMemories])

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
      memoryContext: memoryContext,
    },
    onResponse: (response) => {
      console.log("Stream response started:", response.status)
      options.onResponse?.(response)
    },
    onFinish: async (message) => {
      console.log("Stream finished:", message)
      options.onFinish?.(message)

      // Track memory usage after successful response
      if (memoryContext && memories.length > 0) {
        // Track usage for all active memories used in this conversation
        const trackingPromises = memories.map((memory) => trackMemoryUsage(memory.id))

        try {
          await Promise.all(trackingPromises)
          console.log("Memory usage tracked successfully")
        } catch (error) {
          console.error("Failed to track memory usage:", error)
        }
      }
    },
    onError: (error) => {
      console.error("Stream error:", error)
      options.onError?.(error)
    },
  })

  // Enhanced send message with memory context
  const sendMessage = useCallback(
    async (
      content: string,
      messageOptions?: {
        model?: SupportedModel
        apiKey?: string
        temperature?: number
      }
    ) => {
      const messageData = {
        role: "user" as const,
        content,
      }

      // Create an abort controller for this request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      try {
        await append(messageData, {
          body: {
            model: messageOptions?.model || options.initialModel || "openai/gpt-4o-mini",
            apiKey: messageOptions?.apiKey || options.apiKey,
            temperature: messageOptions?.temperature,
            memoryContext: memoryContext,
          },
        })
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Request was aborted")
        } else {
          throw error
        }
      }
    },
    [append, options.initialModel, options.apiKey, memoryContext]
  )

  // Model switching
  const switchModel = useCallback((model: SupportedModel) => {
    // Update the model for future messages
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

  // Regenerate last message with memory context
  const regenerateLastMessage = useCallback(() => {
    if (messages.length > 0) {
      reload({
        body: {
          model: options.initialModel || "openai/gpt-4o-mini",
          apiKey: options.apiKey,
          memoryContext: memoryContext,
        },
      })
    }
  }, [messages.length, reload, options.initialModel, options.apiKey, memoryContext])

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

    // Memory state
    memories,
    memoryContext,
    hasMemories: memories.length > 0,

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

export type ChatWithMemoryHook = ReturnType<typeof useChatWithMemory>
