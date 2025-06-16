"use client"

import { useState, useCallback, useMemo } from "react"
import type { ChatMessage, ConversationBranch, ConversationTree } from "@/types/chat"

export function useConversationTree(messages: ChatMessage[], activeLeafId?: string | null) {
  const [branchNames, setBranchNames] = useState<Record<string, string>>({})

  // Build the conversation tree from flat message array
  const conversationTree = useMemo((): ConversationTree => {
    if (messages.length === 0) {
      return { branches: [], activeBranchId: "" }
    }

    // Create a map of message ID to message for quick lookup
    const messageMap = new Map<string, ChatMessage>()
    messages.forEach((msg) => messageMap.set(msg.id, msg))

    // Find all root messages (messages with no parent)
    const rootMessages = messages.filter((msg) => !msg.parentMessageId)

    // Build branches by traversing from each root
    const branches: ConversationBranch[] = []
    let activeBranchId = ""

    const buildBranch = (startMessage: ChatMessage, depth = 0): ConversationBranch[] => {
      const branchMessages: ChatMessage[] = [startMessage]
      let currentMessage = startMessage

      // Follow the linear path from this starting point
      while (true) {
        const children = messages.filter((msg) => msg.parentMessageId === currentMessage.id)

        if (children.length === 0) break

        if (children.length === 1) {
          // Single child - continue the linear path
          currentMessage = children[0]
          branchMessages.push(currentMessage)
        } else {
          // Multiple children - this creates branches
          const childBranches: ConversationBranch[] = []

          children.forEach((child, index) => {
            const childBranchMessages = [...branchMessages, child]
            const childBranch: ConversationBranch = {
              id: `${startMessage.id}-${child.id}`,
              name: branchNames[child.id] || `Branch ${index + 1}`,
              messages: childBranchMessages,
              isActive: activeLeafId === child.id,
              depth: depth + 1,
            }

            if (activeLeafId === child.id) {
              activeBranchId = childBranch.id
            }

            childBranches.push(childBranch)

            // Recursively build branches from this child
            const nestedBranches = buildBranch(child, depth + 1)
            childBranches.push(...nestedBranches)
          })

          return childBranches
        }
      }

      // Create the main branch
      const mainBranch: ConversationBranch = {
        id: `main-${startMessage.id}`,
        name: branchNames[startMessage.id] || "Main conversation",
        messages: branchMessages,
        isActive: activeLeafId === currentMessage.id,
        depth,
      }

      if (activeLeafId === currentMessage.id) {
        activeBranchId = mainBranch.id
      }

      return [mainBranch]
    }

    // Build branches from all root messages
    rootMessages.forEach((root) => {
      const rootBranches = buildBranch(root)
      branches.push(...rootBranches)
    })

    return { branches, activeBranchId }
  }, [messages, activeLeafId, branchNames])

  const renameBranch = useCallback((messageId: string, newName: string) => {
    setBranchNames((prev) => ({
      ...prev,
      [messageId]: newName,
    }))
  }, [])

  const getActiveBranch = useCallback((): ConversationBranch | null => {
    return conversationTree.branches.find((branch) => branch.isActive) || null
  }, [conversationTree])

  const getMessagePath = useCallback(
    (messageId: string): ChatMessage[] => {
      // Find the path from root to the specified message
      const message = messages.find((msg) => msg.id === messageId)
      if (!message) return []

      const path: ChatMessage[] = []
      let currentMessage: ChatMessage | undefined = message

      // Traverse up to the root
      while (currentMessage) {
        path.unshift(currentMessage)
        currentMessage = currentMessage.parentMessageId
          ? messages.find((msg) => msg.id === currentMessage!.parentMessageId)
          : undefined
      }

      return path
    },
    [messages]
  )

  return {
    conversationTree,
    renameBranch,
    getActiveBranch,
    getMessagePath,
  }
}
