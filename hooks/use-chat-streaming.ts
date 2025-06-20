"use client"

import { useChat as useAIChat } from "ai/react"
import { useCallback, useRef, useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SupportedModel } from "@/types/models"
import { useChats, useMessages } from "./use-chats"
import { useAuth } from "./use-auth"
import { Id } from "@/convex/_generated/dataModel"
import type { Attachment } from "@/types/attachment"

interface UseChatStreamingOptions {
  initialModel?: SupportedModel
  apiKey?: string
  chatId?: string
  projectId?: string
  onResponse?: (response: Response) => void
  onFinish?: (message: any) => void
  onError?: (error: Error) => void
}

// Helper function to convert string to Convex ID
function toProjectId(id: string): Id<"projects"> {
  return id as Id<"projects">
}

export function useChatStreaming(options: UseChatStreamingOptions = {}) {
  const { user } = useAuth()
  const router = useRouter()
  
  // Safely get chatId from URL or options
  const [persistentChatId, setPersistentChatId] = useState<Id<"chats"> | undefined>(() => {
    // First check if chatId is passed via options
    if (options.chatId) {
      return options.chatId as Id<"chats">
    }
    
    // Otherwise try to get from URL
    if (typeof window !== "undefined") {
      try {
        const searchParams = new URLSearchParams(window.location.search)
        const currentChatId = searchParams.get("chatId")
        return currentChatId ? (currentChatId as Id<"chats">) : undefined
      } catch {
        return undefined
      }
    }
    return undefined
  })
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Update persistentChatId when options.chatId changes
  useEffect(() => {
    if (options.chatId && options.chatId !== persistentChatId) {
      setPersistentChatId(options.chatId as Id<"chats">)
    }
  }, [options.chatId, persistentChatId])

  // Chat persistence hooks
  const { createChat } = useChats({ userId: user?._id })
  const { messages: existingMessages, createMessage } = useMessages({ chatId: persistentChatId })

  // Convert existing messages to AI SDK format
  const initialMessages = useMemo(() => {
    if (!existingMessages || existingMessages.length === 0) {
      return []
    }
    
    console.log("Loading existing messages for chat:", persistentChatId, "count:", existingMessages.length)
    
    const converted = existingMessages.map((msg) => ({
      id: msg._id,
      role: msg.type as "user" | "assistant",
      content: msg.content,
      createdAt: new Date(msg.timestamp),
    }))
    return converted
  }, [existingMessages])

  // Auto-create chat on first message
  const ensureChat = useCallback(async (): Promise<Id<"chats"> | null> => {
    if (persistentChatId) return persistentChatId
    if (isCreatingChat) return null
    if (!user?._id) return null

    setIsCreatingChat(true)
    try {
      const chatId = await createChat(
        options.projectId ? `New Chat in Project` : "New Chat",
        options.projectId ? toProjectId(options.projectId) : undefined
      )
      
      if (chatId) {
        setPersistentChatId(chatId)
        // Update URL to include chatId
        if (typeof window !== "undefined") {
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.set("chatId", chatId)
          router.replace(newUrl.pathname + newUrl.search)
        }
        
        return chatId
      }
    } catch (error) {
      console.error("Failed to create chat:", error)
    } finally {
      setIsCreatingChat(false)
    }
    
    return null
  }, [persistentChatId, isCreatingChat, user?._id, createChat, options.projectId, router])

  const {
    messages: aiMessages,
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
    id: persistentChatId || undefined,
    initialMessages,
    body: {
      model: options.initialModel || "openai/gpt-4o-mini",
      apiKey: options.apiKey,
      projectId: options.projectId,
    },
    onResponse: (response) => {
      console.log("Stream response started:", response.status)
      options.onResponse?.(response)
    },
    onFinish: async (message) => {
      console.log("Stream finished:", message)
      
      // Save assistant message to database when streaming finishes
      if (persistentChatId && message.content && user?._id) {
        try {
          await createMessage(
            persistentChatId,
            message.content,
            "assistant",
            {
              userId: user._id,
              model: options.initialModel,
              metadata: {
                model: options.initialModel || "openai/gpt-4o-mini",
              },
            }
          )
        } catch (error) {
          console.error("Failed to save assistant message:", error)
        }
      }
      
      options.onFinish?.(message)
    },
    onError: (error) => {
      console.error("Stream error:", error)
      options.onError?.(error)
    },
  })

  // Sync messages when existing messages are loaded but AI SDK messages are empty
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0 && aiMessages && aiMessages.length === 0 && !isLoading) {
      console.log("Syncing messages from database to AI SDK:", initialMessages.length, "messages")
      setMessages(initialMessages as any)
    }
  }, [initialMessages, aiMessages, isLoading, setMessages])

  // Enhanced message sending with persistence
  const sendMessage = useCallback(
    async (
      content: string,
      attachments?: Attachment[],
      messageOptions?: {
        model?: SupportedModel
        apiKey?: string
        temperature?: number
        maxTokens?: number
        topP?: number
      }
    ) => {
      if (!content.trim()) return
      if (!user?._id) return

      // Ensure we have a chat to save to
      const chatId = await ensureChat()
      if (!chatId) {
        console.error("Failed to create chat for message")
        return
      }

      try {
        // Save user message to database first
        // All attachments should now be real Convex attachments with valid IDs
        const validAttachments = attachments?.filter(att => {
          const id = att.id || att._id
          return id && typeof id === 'string' && id.length > 0
        })
        
        await createMessage(
          chatId,
          content,
          "user",
          {
            userId: user._id,
            attachments: validAttachments?.map(att => (att.id || att._id) as Id<"attachments">),
          }
        )

        // Cancel any existing request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()

        // Send message to AI SDK for streaming response
        let messageContent = content.trim()
        if (attachments && attachments.length > 0) {
          const attachmentSummary = attachments
            .map((att) => `[Attachment: ${att.filename}]`)
            .join(" ")
          messageContent = `${messageContent}\n\n${attachmentSummary}`
        }

        await append(
          {
            role: "user",
            content: messageContent,
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
    [user?._id, ensureChat, createMessage, append, options.initialModel, options.apiKey, options.projectId]
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
    if (aiMessages.length > 0) {
      reload()
    }
  }, [aiMessages.length, reload])

  // Get streaming status
  const isStreaming = isLoading

  return {
    // Core chat state
    messages: aiMessages,
    input,
    isLoading: isLoading || isCreatingChat,
    isStreaming,
    error,
    data,
    chatId: persistentChatId,

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
