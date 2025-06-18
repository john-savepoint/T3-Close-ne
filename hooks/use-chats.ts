"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useCallback, useState } from "react"

interface UseChatPersistenceOptions {
  userId?: Id<"users">
  status?: "active" | "archived" | "trashed"
  projectId?: Id<"projects">
  limit?: number
}

interface UseMessagesOptions {
  chatId?: Id<"chats">
  limit?: number
}

export function useChats(options: UseChatPersistenceOptions = {}) {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Queries
  const chats = useQuery(
    api.chats.listWithPreview,
    options.userId
      ? {
          userId: options.userId,
          status: options.status,
          limit: options.limit,
        }
      : "skip"
  )

  const stats = useQuery(api.chats.getStats, options.userId ? { userId: options.userId } : "skip")

  // Mutations
  const createChatMutation = useMutation(api.chats.create)
  const updateChatMutation = useMutation(api.chats.update)
  const updateStatusMutation = useMutation(api.chats.updateStatus)
  const deletePermanentlyMutation = useMutation(api.chats.deletePermanently)
  const duplicateMutation = useMutation(api.chats.duplicate)
  const bulkUpdateStatusMutation = useMutation(api.chats.bulkUpdateStatus)

  // Chat operations with optimistic updates
  const createChat = useCallback(
    async (title: string, projectId?: Id<"projects">): Promise<Id<"chats"> | null> => {
      if (!options.userId) return null

      setIsCreating(true)
      try {
        const chatId = await createChatMutation({
          title,
          userId: options.userId,
          projectId,
        })
        return chatId
      } catch (error) {
        console.error("Failed to create chat:", error)
        throw error
      } finally {
        setIsCreating(false)
      }
    },
    [createChatMutation, options.userId]
  )

  const updateChat = useCallback(
    async (
      chatId: Id<"chats">,
      updates: {
        title?: string
        systemPrompt?: string
        model?: string
        isPublic?: boolean
        projectId?: Id<"projects">
      }
    ): Promise<void> => {
      setIsUpdating(true)
      try {
        await updateChatMutation({
          chatId,
          ...updates,
        })
      } catch (error) {
        console.error("Failed to update chat:", error)
        throw error
      } finally {
        setIsUpdating(false)
      }
    },
    [updateChatMutation]
  )

  const moveToArchive = useCallback(
    async (chatId: Id<"chats">): Promise<void> => {
      try {
        await updateStatusMutation({
          chatId,
          status: "archived",
        })
      } catch (error) {
        console.error("Failed to archive chat:", error)
        throw error
      }
    },
    [updateStatusMutation]
  )

  const moveToTrash = useCallback(
    async (chatId: Id<"chats">): Promise<void> => {
      try {
        await updateStatusMutation({
          chatId,
          status: "trashed",
        })
      } catch (error) {
        console.error("Failed to move chat to trash:", error)
        throw error
      }
    },
    [updateStatusMutation]
  )

  const restoreChat = useCallback(
    async (chatId: Id<"chats">): Promise<void> => {
      try {
        await updateStatusMutation({
          chatId,
          status: "active",
        })
      } catch (error) {
        console.error("Failed to restore chat:", error)
        throw error
      }
    },
    [updateStatusMutation]
  )

  const deletePermanently = useCallback(
    async (chatId: Id<"chats">): Promise<void> => {
      try {
        await deletePermanentlyMutation({ chatId })
      } catch (error) {
        console.error("Failed to permanently delete chat:", error)
        throw error
      }
    },
    [deletePermanentlyMutation]
  )

  const duplicateChat = useCallback(
    async (chatId: Id<"chats">, newTitle?: string): Promise<Id<"chats"> | null> => {
      if (!options.userId) return null

      try {
        const newChatId = await duplicateMutation({
          chatId,
          newTitle,
          userId: options.userId,
        })
        return newChatId
      } catch (error) {
        console.error("Failed to duplicate chat:", error)
        throw error
      }
    },
    [duplicateMutation, options.userId]
  )

  const bulkUpdateStatus = useCallback(
    async (chatIds: Id<"chats">[], status: "active" | "archived" | "trashed"): Promise<number> => {
      if (!options.userId) return 0

      try {
        const count = await bulkUpdateStatusMutation({
          chatIds,
          status,
          userId: options.userId,
        })
        return count
      } catch (error) {
        console.error("Failed to bulk update chats:", error)
        throw error
      }
    },
    [bulkUpdateStatusMutation, options.userId]
  )

  return {
    // Data
    chats: chats || [],
    stats,
    isLoading: chats === undefined,

    // State
    isCreating,
    isUpdating,

    // Operations
    createChat,
    updateChat,
    moveToArchive,
    moveToTrash,
    restoreChat,
    deletePermanently,
    duplicateChat,
    bulkUpdateStatus,
  }
}

export function useMessages(hookOptions: UseMessagesOptions = {}) {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Queries
  const messages = useQuery(
    api.messages.list,
    hookOptions.chatId
      ? {
          chatId: hookOptions.chatId,
          limit: hookOptions.limit,
        }
      : "skip"
  )

  const conversationTree = useQuery(
    api.messages.getConversationTree,
    hookOptions.chatId ? { chatId: hookOptions.chatId } : "skip"
  )

  // Mutations
  const createMessageMutation = useMutation(api.messages.create)
  const editMessageMutation = useMutation(api.messages.edit)
  const deleteMessageMutation = useMutation(api.messages.deleteMessage)
  const createBranchMutation = useMutation(api.messages.createBranch)
  const bulkDeleteMutation = useMutation(api.messages.bulkDelete)

  // Message operations
  const createMessage = useCallback(
    async (
      chatId: Id<"chats">,
      content: string,
      type: "user" | "assistant",
      messageOptions?: {
        userId?: Id<"users">
        parentMessageId?: string
        model?: string
        attachments?: Id<"attachments">[]
        metadata?: {
          model?: string
          tokens?: number
          cost?: number
        }
      }
    ): Promise<Id<"messages"> | null> => {
      setIsCreating(true)
      try {
        const messageId = await createMessageMutation({
          chatId,
          content,
          type,
          userId: messageOptions?.userId,
          parentMessageId: messageOptions?.parentMessageId,
          model: messageOptions?.model,
          attachments: messageOptions?.attachments,
          metadata: messageOptions?.metadata,
        })
        return messageId
      } catch (error) {
        console.error("Failed to create message:", error)
        throw error
      } finally {
        setIsCreating(false)
      }
    },
    [createMessageMutation]
  )

  const editMessage = useCallback(
    async (messageId: Id<"messages">, content: string): Promise<void> => {
      setIsUpdating(true)
      try {
        await editMessageMutation({
          messageId,
          content,
        })
      } catch (error) {
        console.error("Failed to edit message:", error)
        throw error
      } finally {
        setIsUpdating(false)
      }
    },
    [editMessageMutation]
  )

  const deleteMessage = useCallback(
    async (messageId: Id<"messages">): Promise<void> => {
      try {
        await deleteMessageMutation({ messageId })
      } catch (error) {
        console.error("Failed to delete message:", error)
        throw error
      }
    },
    [deleteMessageMutation]
  )

  const createBranch = useCallback(
    async (
      parentMessageId: string,
      content: string,
      type: "user" | "assistant",
      options?: {
        userId?: Id<"users">
        model?: string
        metadata?: {
          model?: string
          tokens?: number
          cost?: number
        }
      }
    ): Promise<Id<"messages"> | null> => {
      try {
        const messageId = await createBranchMutation({
          parentMessageId,
          content,
          type,
          userId: options?.userId,
          model: options?.model,
          metadata: options?.metadata,
        })
        return messageId
      } catch (error) {
        console.error("Failed to create branch:", error)
        throw error
      }
    },
    [createBranchMutation]
  )

  const bulkDelete = useCallback(
    async (messageIds: Id<"messages">[]): Promise<number> => {
      try {
        const result = await bulkDeleteMutation({ messageIds })
        return result.deletedCount
      } catch (error) {
        console.error("Failed to bulk delete messages:", error)
        throw error
      }
    },
    [bulkDeleteMutation]
  )

  return {
    // Data
    messages: messages?.messages || [],
    hasMore: messages?.hasMore || false,
    nextCursor: messages?.nextCursor,
    conversationTree,
    isLoading: messages === undefined,

    // State
    isCreating,
    isUpdating,

    // Operations
    createMessage,
    editMessage,
    deleteMessage,
    createBranch,
    bulkDelete,
  }
}
