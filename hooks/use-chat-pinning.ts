"use client"

import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useCallback } from "react"
import { toast } from "sonner"

export function useChatPinning() {
  const pinChatMutation = useMutation(api.chats.pinChat)
  const unpinChatMutation = useMutation(api.chats.unpinChat)

  const pinChat = useCallback(
    async (chatId: Id<"chats">) => {
      try {
        await pinChatMutation({ chatId })
        toast.success("Chat pinned")
      } catch (error) {
        console.error("Failed to pin chat:", error)
        toast.error("Failed to pin chat")
      }
    },
    [pinChatMutation]
  )

  const unpinChat = useCallback(
    async (chatId: Id<"chats">) => {
      try {
        await unpinChatMutation({ chatId })
        toast.success("Chat unpinned")
      } catch (error) {
        console.error("Failed to unpin chat:", error)
        toast.error("Failed to unpin chat")
      }
    },
    [unpinChatMutation]
  )

  const togglePin = useCallback(
    async (chatId: Id<"chats">, isPinned: boolean) => {
      if (isPinned) {
        await unpinChat(chatId)
      } else {
        await pinChat(chatId)
      }
    },
    [pinChat, unpinChat]
  )

  return {
    pinChat,
    unpinChat,
    togglePin,
  }
}