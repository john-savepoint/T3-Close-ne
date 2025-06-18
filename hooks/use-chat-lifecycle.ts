"use client"

import { useState, useCallback, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import type { Chat, ConvexChat } from "@/types/chat"
import { adaptConvexChatToChat, getChatId } from "@/types/chat"
import { useAuth } from "@/hooks/use-auth"

export function useChatLifecycle() {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Get real archived and trashed chats from Convex
  const archivedChatsData = useQuery(
    api.chats.listWithPreview,
    user?._id
      ? {
          userId: user._id,
          status: "archived",
        }
      : "skip"
  )

  const trashedChatsData = useQuery(
    api.chats.listWithPreview,
    user?._id
      ? {
          userId: user._id,
          status: "trashed",
        }
      : "skip"
  )

  // Convert Convex data to Chat type using proper adapters
  const archivedChats: Chat[] = (archivedChatsData || []).map(adaptConvexChatToChat)
  const trashedChats: Chat[] = (trashedChatsData || []).map(adaptConvexChatToChat)

  // Convex mutations
  const updateStatusMutation = useMutation(api.chats.updateStatus)
  const deletePermanentlyMutation = useMutation(api.chats.deletePermanently)
  const bulkUpdateStatusMutation = useMutation(api.chats.bulkUpdateStatus)

  const moveToArchive = useCallback(
    async (chatId: string): Promise<void> => {
      setLoading(true)
      try {
        await updateStatusMutation({
          chatId: chatId as Id<"chats">,
          status: "archived",
        })
      } catch (error) {
        console.error("Failed to archive chat:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [updateStatusMutation]
  )

  const moveToTrash = useCallback(
    async (chatId: string): Promise<void> => {
      setLoading(true)
      try {
        await updateStatusMutation({
          chatId: chatId as Id<"chats">,
          status: "trashed",
        })
      } catch (error) {
        console.error("Failed to move chat to trash:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [updateStatusMutation]
  )

  const restoreFromTrash = useCallback(
    async (chatId: string): Promise<void> => {
      setLoading(true)
      try {
        await updateStatusMutation({
          chatId: chatId as Id<"chats">,
          status: "active",
        })
      } catch (error) {
        console.error("Failed to restore chat:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [updateStatusMutation]
  )

  const restoreFromArchive = useCallback(
    async (chatId: string): Promise<void> => {
      setLoading(true)
      try {
        await updateStatusMutation({
          chatId: chatId as Id<"chats">,
          status: "active",
        })
      } catch (error) {
        console.error("Failed to restore chat from archive:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [updateStatusMutation]
  )

  const deletePermanently = useCallback(
    async (chatId: string): Promise<void> => {
      setLoading(true)
      try {
        await deletePermanentlyMutation({
          chatId: chatId as Id<"chats">,
        })
      } catch (error) {
        console.error("Failed to permanently delete chat:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [deletePermanentlyMutation]
  )

  const emptyTrash = useCallback(async (): Promise<void> => {
    if (!user?._id || trashedChats.length === 0) return

    setLoading(true)
    try {
      const chatIds = trashedChats.map((chat) => chat.id as Id<"chats">)

      // Delete all trashed chats permanently
      await Promise.all(chatIds.map((chatId) => deletePermanentlyMutation({ chatId })))
    } catch (error) {
      console.error("Failed to empty trash:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [deletePermanentlyMutation, trashedChats, user?._id])

  const getDaysUntilAutoPurge = useCallback((chat: Chat): number => {
    if (chat.status !== "trashed" || !chat.statusChangedAt) return 0

    const daysSinceTrash = Math.floor(
      (Date.now() - chat.statusChangedAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    return Math.max(0, 30 - daysSinceTrash)
  }, [])

  // Bulk operations
  const bulkMoveToArchive = useCallback(
    async (chatIds: string[]): Promise<void> => {
      if (!user?._id) return

      setLoading(true)
      try {
        await bulkUpdateStatusMutation({
          chatIds: chatIds as Id<"chats">[],
          status: "archived",
          userId: user._id,
        })
      } catch (error) {
        console.error("Failed to bulk archive chats:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [bulkUpdateStatusMutation, user?._id]
  )

  const bulkMoveToTrash = useCallback(
    async (chatIds: string[]): Promise<void> => {
      if (!user?._id) return

      setLoading(true)
      try {
        await bulkUpdateStatusMutation({
          chatIds: chatIds as Id<"chats">[],
          status: "trashed",
          userId: user._id,
        })
      } catch (error) {
        console.error("Failed to bulk move chats to trash:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [bulkUpdateStatusMutation, user?._id]
  )

  const bulkRestore = useCallback(
    async (chatIds: string[]): Promise<void> => {
      if (!user?._id) return

      setLoading(true)
      try {
        await bulkUpdateStatusMutation({
          chatIds: chatIds as Id<"chats">[],
          status: "active",
          userId: user._id,
        })
      } catch (error) {
        console.error("Failed to bulk restore chats:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [bulkUpdateStatusMutation, user?._id]
  )

  // Auto-purge effect (for demo - in production this would be handled by a scheduled job)
  useEffect(() => {
    const checkAutoPurge = async () => {
      if (!user?._id || trashedChats.length === 0) return

      const now = Date.now()
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

      const chatsToDelete = trashedChats.filter(
        (chat) => chat.statusChangedAt && chat.statusChangedAt.getTime() < thirtyDaysAgo
      )

      if (chatsToDelete.length > 0) {
        console.log(`Auto-purging ${chatsToDelete.length} chats older than 30 days`)

        try {
          await Promise.all(
            chatsToDelete.map((chat) =>
              deletePermanentlyMutation({ chatId: chat.id as Id<"chats"> })
            )
          )
        } catch (error) {
          console.error("Auto-purge failed:", error)
        }
      }
    }

    // Check every hour for demo purposes (would be daily in production)
    const interval = setInterval(checkAutoPurge, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [trashedChats, deletePermanentlyMutation, user?._id])

  return {
    archivedChats,
    trashedChats,
    loading: loading || archivedChatsData === undefined || trashedChatsData === undefined,

    // Single operations
    moveToArchive,
    moveToTrash,
    restoreFromTrash,
    restoreFromArchive,
    deletePermanently,
    emptyTrash,
    getDaysUntilAutoPurge,

    // Bulk operations
    bulkMoveToArchive,
    bulkMoveToTrash,
    bulkRestore,
  }
}
