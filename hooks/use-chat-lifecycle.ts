"use client"

import { useState, useCallback, useEffect } from "react"
import type { Chat } from "@/types/chat"

// Mock data for demonstration
const mockArchivedChats: Chat[] = [
  {
    id: "archived-1",
    title: "Completed React Project Discussion",
    status: "archived",
    statusChangedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    messages: [],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "archived-2",
    title: "Old Marketing Campaign Ideas",
    status: "archived",
    statusChangedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    messages: [],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
]

const mockTrashedChats: Chat[] = [
  {
    id: "trashed-1",
    title: "Accidentally Deleted Chat",
    status: "trashed",
    statusChangedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    messages: [],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
]

export function useChatLifecycle() {
  const [archivedChats, setArchivedChats] = useState<Chat[]>(mockArchivedChats)
  const [trashedChats, setTrashedChats] = useState<Chat[]>(mockTrashedChats)
  const [loading, setLoading] = useState(false)

  const moveToArchive = useCallback(async (chatId: string): Promise<void> => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log(`Moving chat ${chatId} to archive`)

      // In a real app, this would be an API call
      // await api.updateChatStatus(chatId, 'archived')
    } catch (error) {
      console.error("Failed to archive chat:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const moveToTrash = useCallback(async (chatId: string): Promise<void> => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log(`Moving chat ${chatId} to trash`)

      // In a real app, this would be an API call
      // await api.updateChatStatus(chatId, 'trashed')
    } catch (error) {
      console.error("Failed to move chat to trash:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const restoreFromTrash = useCallback(async (chatId: string): Promise<void> => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log(`Restoring chat ${chatId} from trash`)

      // Remove from trashed chats
      setTrashedChats((prev) => prev.filter((chat) => chat.id !== chatId))

      // In a real app, this would be an API call
      // await api.updateChatStatus(chatId, 'active')
    } catch (error) {
      console.error("Failed to restore chat:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const restoreFromArchive = useCallback(async (chatId: string): Promise<void> => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log(`Restoring chat ${chatId} from archive`)

      // Remove from archived chats
      setArchivedChats((prev) => prev.filter((chat) => chat.id !== chatId))

      // In a real app, this would be an API call
      // await api.updateChatStatus(chatId, 'active')
    } catch (error) {
      console.error("Failed to restore chat from archive:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePermanently = useCallback(async (chatId: string): Promise<void> => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log(`Permanently deleting chat ${chatId}`)

      // Remove from trashed chats
      setTrashedChats((prev) => prev.filter((chat) => chat.id !== chatId))

      // In a real app, this would be an API call
      // await api.deleteChatPermanently(chatId)
    } catch (error) {
      console.error("Failed to permanently delete chat:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const emptyTrash = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Emptying trash")

      // Clear all trashed chats
      setTrashedChats([])

      // In a real app, this would be an API call
      // await api.emptyTrash()
    } catch (error) {
      console.error("Failed to empty trash:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const getDaysUntilAutoPurge = useCallback((chat: Chat): number => {
    if (chat.status !== "trashed" || !chat.statusChangedAt) return 0

    const daysSinceTrash = Math.floor((Date.now() - chat.statusChangedAt.getTime()) / (1000 * 60 * 60 * 24))

    return Math.max(0, 30 - daysSinceTrash)
  }, [])

  // Simulate auto-purge check
  useEffect(() => {
    const checkAutoPurge = () => {
      const now = Date.now()
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

      setTrashedChats((prev) =>
        prev.filter((chat) => !chat.statusChangedAt || chat.statusChangedAt.getTime() > thirtyDaysAgo),
      )
    }

    // Check every minute for demo purposes (would be daily in production)
    const interval = setInterval(checkAutoPurge, 60000)
    return () => clearInterval(interval)
  }, [])

  return {
    archivedChats,
    trashedChats,
    loading,
    moveToArchive,
    moveToTrash,
    restoreFromTrash,
    restoreFromArchive,
    deletePermanently,
    emptyTrash,
    getDaysUntilAutoPurge,
  }
}
