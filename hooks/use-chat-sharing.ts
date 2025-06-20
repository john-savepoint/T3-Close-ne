"use client"

import { useCallback } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import type { SharedChat, PublicChatView, ShareChatData, ForkChatData } from "@/types/sharing"

export function useChatSharing() {
  // Convex queries and mutations
  const sharedLinksData = useQuery(api.sharing.getMySharedLinks)
  const createSharedLinkMutation = useMutation(api.sharing.createSharedLink)
  const revokeSharedLinkMutation = useMutation(api.sharing.revokeSharedLink)
  const forkConversationMutation = useMutation(api.sharing.forkConversation)

  // Convert Convex data to frontend types
  const sharedChats: SharedChat[] = (sharedLinksData || []).map((share: any) => ({
    id: share._id,
    chatId: share.chatId,
    ownerUserId: share.ownerUserId,
    token: share.token,
    isActive: share.isActive,
    createdAt: new Date(share.createdAt),
    viewCount: share.viewCount,
    title: share.chatTitle,
  }))

  const loading = sharedLinksData === undefined

  const createSharedLink = useCallback(
    async (data: ShareChatData): Promise<SharedChat> => {
      try {
        const result = await createSharedLinkMutation({
          chatId: data.chatId as Id<"chats">,
        })

        if (!result) throw new Error("Failed to create shared link")

        return {
          id: result._id,
          chatId: result.chatId,
          ownerUserId: result.ownerUserId,
          token: result.token,
          isActive: result.isActive,
          createdAt: new Date(result.createdAt),
          viewCount: result.viewCount,
        }
      } catch (error) {
        console.error("Failed to create shared link:", error)
        throw error
      }
    },
    [createSharedLinkMutation]
  )

  const revokeSharedLink = useCallback(
    async (chatId: string): Promise<void> => {
      try {
        await revokeSharedLinkMutation({
          chatId: chatId as Id<"chats">,
        })
      } catch (error) {
        console.error("Failed to revoke shared link:", error)
        throw error
      }
    },
    [revokeSharedLinkMutation]
  )

  const getSharedChatByToken = useCallback(
    async (token: string): Promise<PublicChatView | null> => {
      try {
        // This would be called from the public page component
        // The query is defined there since it needs to work without auth
        const response = await fetch(`/api/shared/${token}`)
        if (!response.ok) return null
        return await response.json()
      } catch (error) {
        console.error("Failed to fetch shared chat:", error)
        return null
      }
    },
    []
  )

  const forkConversation = useCallback(
    async (data: ForkChatData): Promise<string> => {
      try {
        const newChatId = await forkConversationMutation({
          token: data.token,
          title: data.title,
        })

        return newChatId
      } catch (error) {
        console.error("Failed to fork conversation:", error)
        throw error
      }
    },
    [forkConversationMutation]
  )

  const getSharedLinkForChat = useCallback(
    (chatId: string): SharedChat | null => {
      return sharedChats.find((share) => share.chatId === chatId && share.isActive) || null
    },
    [sharedChats]
  )

  // View count is incremented automatically in the query
  const incrementViewCount = useCallback(async (token: string): Promise<void> => {
    // This is now handled server-side in getPublicChatByToken
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