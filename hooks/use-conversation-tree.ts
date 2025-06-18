"use client"

import { useState, useCallback, useMemo } from "react"
import type { ChatMessage, ConversationBranch, ConversationTree } from "@/types/chat"

interface UseConversationTreeProps {
  messages: ChatMessage[]
  activeLeafId?: string | null
}

export function useConversationTree(props: UseConversationTreeProps) {
  const { messages, activeLeafId } = props
  const [selectedBranch, setSelectedBranch] = useState<string[]>([])

  // Build conversation tree
  const conversationTree = useMemo(() => {
    const nodes = new Map<string, ChatMessage>()
    const branches = new Map<string, ConversationBranch>()

    if (messages.length === 0) {
      return { nodes, branches }
    }

    const branchingPoints = new Set<string>()

    // First pass: create nodes and identify branching points
    messages.forEach((message: ChatMessage) => {
      nodes.set(message.id, message)
    })

    // Find messages with multiple children (branching points)
    const childCounts = new Map<string, number>()
    messages.forEach((message) => {
      if (message.parentId || message.parentMessageId) {
        const parentId = message.parentId || message.parentMessageId || ""
        childCounts.set(parentId, (childCounts.get(parentId) || 0) + 1)
      }
    })

    childCounts.forEach((count, messageId) => {
      if (count > 1) {
        branchingPoints.add(messageId)
      }
    })

    // Build branches from leaf nodes
    const visitedMessages = new Set<string>()

    // Find all leaf messages (messages without children)
    const leafMessages = messages.filter(
      (msg) =>
        !messages.some((other) => other.parentId === msg.id || other.parentMessageId === msg.id)
    )

    // Build a branch for each unique path from root to leaf
    leafMessages.forEach((leafMessage, index) => {
      const branch: ConversationBranch = {
        id: `branch-${index}`,
        name: `Branch ${index + 1}`,
        messages: [],
        isActive: leafMessage.id === activeLeafId,
        depth: 0,
      }

      // Trace back from leaf to root
      let currentMessage: ChatMessage | undefined = leafMessage
      const branchMessages: ChatMessage[] = []

      while (currentMessage) {
        branchMessages.unshift(currentMessage)
        visitedMessages.add(currentMessage.id)

        const parentId: string | null | undefined =
          currentMessage.parentId || currentMessage.parentMessageId
        currentMessage = parentId ? nodes.get(parentId) : undefined
      }

      branch.messages = branchMessages
      branch.depth = 0 // Root level branch
      branches.set(branch.id, branch)
    })

    return { nodes, branches }
  }, [messages, activeLeafId])

  // Get available branches from a message
  const getAvailableBranches = useCallback(
    (messageId: string): string[] => {
      return messages.filter((msg) => msg.parentId === messageId).map((msg) => msg.id)
    },
    [messages]
  )

  // Switch to a specific branch
  const switchToBranch = useCallback((branchPath: string[]) => {
    setSelectedBranch(branchPath)
  }, [])

  // Get message path from root to specific message
  const getMessagePath = useCallback(
    (messageId: string): ChatMessage[] => {
      const path: ChatMessage[] = []
      let currentId = messageId

      while (currentId) {
        const message = messages.find((m) => m.id === currentId)
        if (message) {
          path.unshift(message)
          currentId = message.parentId || ""
        } else {
          break
        }
      }

      return path
    },
    [messages]
  )

  // Create branch from message
  const createBranchFromMessage = useCallback(
    (messageId: string, content: string, type: "user" | "assistant") => {
      // This would integrate with the persistence layer
      console.log("Creating branch from message:", messageId, content, type)
    },
    []
  )

  // Get branching points in conversation
  const getBranchingPoints = useCallback((): string[] => {
    const branchingPoints: string[] = []
    const childCounts = new Map<string, number>()

    messages.forEach((message) => {
      if (message.parentId) {
        childCounts.set(message.parentId, (childCounts.get(message.parentId) || 0) + 1)
      }
    })

    childCounts.forEach((count, messageId) => {
      if (count > 1) {
        branchingPoints.push(messageId)
      }
    })

    return branchingPoints
  }, [messages])

  // Get linear path (main conversation thread)
  const getLinearPath = useCallback((): ChatMessage[] => {
    if (activeLeafId) {
      return getMessagePath(activeLeafId)
    }

    // Return chronological order if no active leaf
    return [...messages].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }, [messages, activeLeafId, getMessagePath])

  // Rename branch functionality
  const renameBranch = useCallback((branchId: string, newName: string) => {
    // In a real implementation, this would persist to the database
    // For now, we'll just update the local state through a callback
    console.log("Rename branch:", branchId, newName)
  }, [])

  // Placeholder functions for compatibility
  const addMessage = useCallback(() => {}, [])
  const updateMessage = useCallback(() => {}, [])
  const deleteMessage = useCallback(() => {}, [])
  const optimizeConversationTree = useCallback(() => {}, [])

  // Handle empty messages case
  if (messages.length === 0) {
    return {
      conversationTree: { nodes: new Map(), branches: [] },
      selectedBranch: [],
      setSelectedBranch,
      addMessage,
      updateMessage,
      deleteMessage,
      renameBranch,
      getMessagePath,
      getAvailableBranches,
      switchToBranch,
      createBranchFromMessage,
      getBranchingPoints,
      getLinearPath,
      optimizeConversationTree,
    }
  }

  return {
    conversationTree,
    selectedBranch,
    setSelectedBranch,
    addMessage,
    updateMessage,
    deleteMessage,
    renameBranch,
    getMessagePath,
    getAvailableBranches,
    switchToBranch,
    createBranchFromMessage,
    getBranchingPoints,
    getLinearPath,
    optimizeConversationTree,
  }
}
