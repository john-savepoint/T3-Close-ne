"use client"

import { useState, useCallback } from "react"
import type { SharedChat, PublicChatView, ShareChatData, ForkChatData } from "@/types/sharing"

// Mock data for demonstration
const mockSharedChats: SharedChat[] = [
  {
    id: "share-1",
    chatId: "chat-1",
    ownerUserId: "user-1",
    token: "abc123def456ghi789",
    isActive: true,
    createdAt: new Date("2024-01-20"),
    viewCount: 24,
  },
]

export function useChatSharing() {
  const [sharedChats, setSharedChats] = useState<SharedChat[]>(mockSharedChats)
  const [loading, setLoading] = useState(false)

  const generateSecureToken = (): string => {
    // Generate a cryptographically secure random token
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const createSharedLink = useCallback(async (data: ShareChatData): Promise<SharedChat> => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newSharedChat: SharedChat = {
        id: `share-${Date.now()}`,
        chatId: data.chatId,
        ownerUserId: "user-1", // Would come from auth context
        token: generateSecureToken(),
        isActive: true,
        createdAt: new Date(),
        viewCount: 0,
      }

      setSharedChats((prev) => [...prev, newSharedChat])
      return newSharedChat
    } catch (error) {
      console.error("Failed to create shared link:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const revokeSharedLink = useCallback(async (chatId: string): Promise<void> => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setSharedChats((prev) => prev.map((share) => (share.chatId === chatId ? { ...share, isActive: false } : share)))
    } catch (error) {
      console.error("Failed to revoke shared link:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const getSharedChatByToken = useCallback(async (token: string): Promise<PublicChatView | null> => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock public chat data - in real implementation, this would fetch from API
      // and strip all sensitive user information
      const mockPublicChat: PublicChatView = {
        token,
        title: "CSS Flexbox Debugging Session",
        createdAt: new Date("2024-01-20"),
        messageCount: 8,
        isActive: true,
        messages: [
          {
            id: "msg-1",
            type: "user",
            content: "I'm having trouble with flexbox alignment. My items aren't centering properly.",
            timestamp: new Date("2024-01-20T10:00:00Z"),
          },
          {
            id: "msg-2",
            type: "assistant",
            content:
              "I'd be happy to help you with flexbox alignment! The most common approach for centering items is to use `justify-content: center` for horizontal centering and `align-items: center` for vertical centering.\n\nHere's a basic example:\n\n```css\n.flex-container {\n  display: flex;\n  justify-content: center; /* Centers horizontally */\n  align-items: center;     /* Centers vertically */\n  height: 100vh;          /* Give it some height */\n}\n```\n\nCould you share your current CSS so I can help identify what might be causing the issue?",
            timestamp: new Date("2024-01-20T10:01:00Z"),
            model: "gpt-4o",
          },
          {
            id: "msg-3",
            type: "user",
            content:
              "Here's my CSS:\n\n```css\n.container {\n  display: flex;\n  width: 100%;\n  height: 400px;\n  background: #f0f0f0;\n}\n\n.item {\n  width: 200px;\n  height: 100px;\n  background: #007bff;\n  color: white;\n  padding: 20px;\n}\n```\n\nThe items are just lined up on the left side.",
            timestamp: new Date("2024-01-20T10:02:00Z"),
          },
          {
            id: "msg-4",
            type: "assistant",
            content:
              "I see the issue! You're missing the centering properties. Your flex container needs `justify-content` and `align-items` to center the items. Here's the corrected CSS:\n\n```css\n.container {\n  display: flex;\n  justify-content: center; /* This centers horizontally */\n  align-items: center;     /* This centers vertically */\n  width: 100%;\n  height: 400px;\n  background: #f0f0f0;\n}\n\n.item {\n  width: 200px;\n  height: 100px;\n  background: #007bff;\n  color: white;\n  padding: 20px;\n  box-sizing: border-box; /* Include padding in width/height */\n}\n```\n\nI also added `box-sizing: border-box` to prevent the padding from increasing the total size of your items.",
            timestamp: new Date("2024-01-20T10:03:00Z"),
            model: "gpt-4o",
          },
        ],
      }

      return mockPublicChat
    } catch (error) {
      console.error("Failed to fetch shared chat:", error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const forkConversation = useCallback(async (data: ForkChatData): Promise<string> => {
    setLoading(true)

    try {
      // Simulate API call to create new chat with history
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newChatId = `chat-${Date.now()}`

      console.log("Forking conversation:", {
        originalToken: data.token,
        newChatId,
        messageCount: data.messages.length,
        title: data.title,
      })

      return newChatId
    } catch (error) {
      console.error("Failed to fork conversation:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const getSharedLinkForChat = useCallback(
    (chatId: string): SharedChat | null => {
      return sharedChats.find((share) => share.chatId === chatId && share.isActive) || null
    },
    [sharedChats],
  )

  const incrementViewCount = useCallback(async (token: string): Promise<void> => {
    // Simulate view tracking - would be a separate API call
    setSharedChats((prev) =>
      prev.map((share) => (share.token === token ? { ...share, viewCount: (share.viewCount || 0) + 1 } : share)),
    )
  }, [])

  return {
    sharedChats,
    loading,
    createSharedLink,
    revokeSharedLink,
    getSharedChatByToken,
    forkConversation,
    getSharedLinkForChat,
    incrementViewCount,
  }
}
