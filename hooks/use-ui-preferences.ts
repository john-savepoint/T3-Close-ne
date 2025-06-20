"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "z6chat-ui-preferences"

interface UIPreferences {
  dismissedElements: {
    temporaryChatStarter?: boolean
    giftProButton?: boolean
  }
}

interface UseUIPreferencesReturn {
  preferences: UIPreferences
  isDismissed: (elementId: keyof UIPreferences["dismissedElements"]) => boolean
  dismissElement: (elementId: keyof UIPreferences["dismissedElements"]) => void
  resetDismissed: (elementId?: keyof UIPreferences["dismissedElements"]) => void
  resetAll: () => void
}

const defaultPreferences: UIPreferences = {
  dismissedElements: {},
}

export function useUIPreferences(): UseUIPreferencesReturn {
  const [preferences, setPreferences] = useState<UIPreferences>(defaultPreferences)

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setPreferences({ ...defaultPreferences, ...parsed })
      }
    } catch (error) {
      console.warn("Failed to load UI preferences:", error)
    }
  }, [])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    } catch (error) {
      console.warn("Failed to save UI preferences:", error)
    }
  }, [preferences])

  const isDismissed = useCallback(
    (elementId: keyof UIPreferences["dismissedElements"]) => {
      return preferences.dismissedElements[elementId] === true
    },
    [preferences]
  )

  const dismissElement = useCallback((elementId: keyof UIPreferences["dismissedElements"]) => {
    setPreferences((prev) => ({
      ...prev,
      dismissedElements: {
        ...prev.dismissedElements,
        [elementId]: true,
      },
    }))
  }, [])

  const resetDismissed = useCallback(
    (elementId?: keyof UIPreferences["dismissedElements"]) => {
      if (elementId) {
        setPreferences((prev) => ({
          ...prev,
          dismissedElements: {
            ...prev.dismissedElements,
            [elementId]: false,
          },
        }))
      } else {
        setPreferences((prev) => ({
          ...prev,
          dismissedElements: {},
        }))
      }
    },
    []
  )

  const resetAll = useCallback(() => {
    setPreferences(defaultPreferences)
  }, [])

  return {
    preferences,
    isDismissed,
    dismissElement,
    resetDismissed,
    resetAll,
  }
}