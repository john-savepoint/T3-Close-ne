"use client"

import { useState, useEffect, useCallback } from "react"
import type {
  TemporaryChat,
  TemporaryChatMessage,
  SaveTempChatData,
  TemporaryChatSettings,
} from "@/types/temporary-chat"

const TEMP_CHAT_STORAGE_KEY = "z6chat_temporary_session"

// Mock settings
const defaultSettings: TemporaryChatSettings = {
  includeMemoryInTempChats: false,
  autoDeletePolicy: "session",
  showTempChatWarnings: true,
}

export function useTemporaryChat() {
  const [temporaryChat, setTemporaryChat] = useState<TemporaryChat | null>(null)
  const [settings, setSettings] = useState<TemporaryChatSettings>(defaultSettings)
  const [isTemporaryMode, setIsTemporaryMode] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  // Load temporary chat from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(TEMP_CHAT_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setTemporaryChat({
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          messages: parsed.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        })
        setIsTemporaryMode(true)
      } catch (error) {
        console.error("Failed to parse temporary chat from storage:", error)
        sessionStorage.removeItem(TEMP_CHAT_STORAGE_KEY)
      }
    }
  }, [])

  // Save temporary chat to sessionStorage whenever it changes
  useEffect(() => {
    if (temporaryChat && isTemporaryMode) {
      sessionStorage.setItem(TEMP_CHAT_STORAGE_KEY, JSON.stringify(temporaryChat))
    }
  }, [temporaryChat, isTemporaryMode])

  // Clear temporary chat when leaving temporary mode
  useEffect(() => {
    if (!isTemporaryMode) {
      sessionStorage.removeItem(TEMP_CHAT_STORAGE_KEY)
    }
  }, [isTemporaryMode])

  const startTemporaryChat = useCallback(() => {
    const newTempChat: TemporaryChat = {
      id: `temp-${Date.now()}`,
      messages: [],
      createdAt: new Date(),
      isTemporary: true,
    }

    setTemporaryChat(newTempChat)
    setIsTemporaryMode(true)
  }, [])

  const addMessageToTemporaryChat = useCallback(
    (content: string, type: "user" | "assistant", model?: string): string | undefined => {
      if (!temporaryChat) return undefined

      const newMessage: TemporaryChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        content,
        timestamp: new Date(),
        model,
      }

      setTemporaryChat((prev) => {
        if (!prev) return null
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
        }
      })
      
      return newMessage.id
    },
    [temporaryChat]
  )

  const updateTemporaryChatMessage = useCallback(
    (messageId: string, content: string) => {
      if (!temporaryChat) return

      setTemporaryChat((prev) => {
        if (!prev) return null
        return {
          ...prev,
          messages: prev.messages.map((msg) => (msg.id === messageId ? { ...msg, content } : msg)),
        }
      })
    },
    [temporaryChat]
  )

  const deleteTemporaryChatMessage = useCallback(
    (messageId: string) => {
      if (!temporaryChat) return

      setTemporaryChat((prev) => {
        if (!prev) return null
        return {
          ...prev,
          messages: prev.messages.filter((msg) => msg.id !== messageId),
        }
      })
    },
    [temporaryChat]
  )

  // Note: The actual save functionality is implemented in SaveTemporaryChatModal
  // This is kept for backward compatibility but the modal handles the Convex mutation directly

  const clearTemporaryChat = useCallback(() => {
    setTemporaryChat(null)
    setIsTemporaryMode(false)
    sessionStorage.removeItem(TEMP_CHAT_STORAGE_KEY)
  }, [])

  const exitTemporaryMode = useCallback(() => {
    if (temporaryChat && temporaryChat.messages.length > 0) {
      const confirmed = confirm(
        "You have an unsaved temporary chat. Are you sure you want to exit? This conversation will be lost forever."
      )
      if (!confirmed) return false
    }

    clearTemporaryChat()
    return true
  }, [temporaryChat, clearTemporaryChat])

  const updateSettings = useCallback((newSettings: Partial<TemporaryChatSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  return {
    temporaryChat,
    isTemporaryMode,
    settings,
    isStreaming,
    setIsStreaming,
    startTemporaryChat,
    addMessageToTemporaryChat,
    updateTemporaryChatMessage,
    deleteTemporaryChatMessage,
    clearTemporaryChat,
    exitTemporaryMode,
    updateSettings,
  }
}
