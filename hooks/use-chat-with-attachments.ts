"use client"

import { useState, useCallback } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type { Attachment } from "@/types/attachment"

export interface ChatMessage {
  _id: Id<"messages">
  chatId: Id<"chats">
  content: string
  type: "user" | "assistant"
  userId?: Id<"users">
  model?: string
  attachments?: Attachment[]
  parentMessageId?: string
  timestamp: number
}

export interface UseChatWithAttachmentsOptions {
  chatId: Id<"chats">
  userId?: Id<"users">
}

export function useChatWithAttachments({ chatId, userId }: UseChatWithAttachmentsOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convex mutations and queries
  const addMessage = useMutation(api.chats.addMessage)
  const removeMessageAttachment = useMutation(api.chats.removeMessageAttachment)
  const messages = useQuery(api.chats.getMessages, { chatId })

  const sendMessage = useCallback(
    async (
      content: string,
      attachmentIds: Id<"attachments">[] = [],
      model?: string,
      parentMessageId?: string
    ): Promise<Id<"messages"> | null> => {
      if (!content.trim() && attachmentIds.length === 0) {
        setError("Message content or attachments required")
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        const messageId = await addMessage({
          chatId,
          content: content.trim(),
          type: "user",
          userId,
          model,
          attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
          parentMessageId,
        })

        return messageId
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to send message"
        setError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [addMessage, chatId, userId]
  )

  const sendAssistantMessage = useCallback(
    async (
      content: string,
      model?: string,
      parentMessageId?: string
    ): Promise<Id<"messages"> | null> => {
      if (!content.trim()) {
        setError("Message content required")
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        const messageId = await addMessage({
          chatId,
          content: content.trim(),
          type: "assistant",
          model,
          parentMessageId,
        })

        return messageId
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to send assistant message"
        setError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [addMessage, chatId]
  )

  const removeAttachment = useCallback(
    async (messageId: Id<"messages">, attachmentId: Id<"attachments">): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        await removeMessageAttachment({
          messageId,
          attachmentId,
        })
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to remove attachment"
        setError(errorMessage)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [removeMessageAttachment]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Transform messages to include proper typing
  const typedMessages: ChatMessage[] = (messages || []).map((message) => ({
    ...message,
    attachments: (message.attachments as Attachment[]) || [],
  }))

  return {
    messages: typedMessages,
    sendMessage,
    sendAssistantMessage,
    removeAttachment,
    isLoading,
    error,
    clearError,
  }
}

// Utility function to extract attachment IDs from Attachment objects
export function extractAttachmentIds(attachments: Attachment[]): Id<"attachments">[] {
  return attachments.map((attachment) => attachment._id as Id<"attachments">)
}
