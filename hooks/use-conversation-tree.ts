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

  // Early return if no messages
  if (messages.length === 0) {
    return {
      conversationTree: { nodes: new Map(), branches: new Map() },
      selectedBranch: [],
      setSelectedBranch,
      addMessage: () => {},
      updateMessage: () => {},
      deleteMessage: () => {},
      renameBranch: () => {},
      getMessagePath: () => [],
      getAvailableBranches: () => [],
      switchToBranch: () => {},
      createBranchFromMessage: () => {},
      getBranchingPoints: () => [],
      getLinearPath: () => [],
      optimizeConversationTree: () => {},
    }
  }

  // Build conversation tree
  const conversationTree = useMemo(() => {
    const nodes = new Map<string, ChatMessage>()
    const branches = new Map<string, ConversationBranch>()

    messages.forEach((message: ChatMessage) => {
      nodes.set(message.id, message)
    })

    return { nodes, branches }
  }, [messages])

  // Get available branches from a message
  const getAvailableBranches = useCallback(
    (messageId: string): string[] => {
      return messages
        .filter(msg => msg.parentId === messageId)
        .map(msg => msg.id)
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
        const message = messages.find(m => m.id === currentId)
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

    messages.forEach(message => {
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
    return [...messages].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }, [messages, activeLeafId, getMessagePath])

  // Placeholder functions for compatibility
  const addMessage = useCallback(() => {}, [])
  const updateMessage = useCallback(() => {}, [])
  const deleteMessage = useCallback(() => {}, [])
  const renameBranch = useCallback(() => {}, [])
  const optimizeConversationTree = useCallback(() => {}, [])

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