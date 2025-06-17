"use client"

import { useState, useCallback, useRef } from "react"
import { SupportedModel, DEFAULT_MODELS } from "@/types/models"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  selectedModel: SupportedModel
  apiKey: string | null
}

interface UseChatOptions {
  initialModel?: SupportedModel
  apiKey?: string
}

export function useOpenRouterChat(options: UseChatOptions = {}) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    selectedModel: options.initialModel || "openai/gpt-4o-mini",
    apiKey: options.apiKey || null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      }

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }))

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...state.messages, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            model: state.selectedModel,
            apiKey: state.apiKey,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        // Handle streaming response
        const reader = response.body?.getReader()
        if (!reader) throw new Error("No response body")

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
          timestamp: new Date(),
        }

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
        }))

        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  setState((prev) => ({
                    ...prev,
                    messages: prev.messages.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: msg.content + parsed.content }
                        : msg
                    ),
                  }))
                }
              } catch (e) {
                console.warn("Failed to parse chunk:", data)
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return // Request was cancelled
        }

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          messages: prev.messages.filter((msg) => msg.id !== userMessage.id),
        }))
      } finally {
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }))
        abortControllerRef.current = null
      }
    },
    [state.messages, state.selectedModel, state.apiKey]
  )

  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      error: null,
    }))
  }, [])

  const setModel = useCallback((model: SupportedModel) => {
    setState((prev) => ({
      ...prev,
      selectedModel: model,
    }))
  }, [])

  const setApiKey = useCallback((apiKey: string | null) => {
    setState((prev) => ({
      ...prev,
      apiKey,
    }))
  }, [])

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }))
  }, [])

  const getAvailableModels = useCallback(() => {
    return DEFAULT_MODELS
  }, [])

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    selectedModel: state.selectedModel,
    apiKey: state.apiKey,
    sendMessage,
    clearMessages,
    setModel,
    setApiKey,
    stopGeneration,
    clearError,
    getAvailableModels,
  }
}
