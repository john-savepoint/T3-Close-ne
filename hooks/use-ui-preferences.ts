"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@clerk/nextjs"

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
  isLoaded: boolean
}

const defaultPreferences: UIPreferences = {
  dismissedElements: {},
}

export function useUIPreferences(): UseUIPreferencesReturn {
  const { isSignedIn } = useAuth()
  const [localPreferences, setLocalPreferences] = useState<UIPreferences>(defaultPreferences)
  const [isLocalLoaded, setIsLocalLoaded] = useState(false)
  
  // Convex queries and mutations
  const convexPreferences = useQuery(api.userPreferences.get, isSignedIn ? {} : "skip")
  const dismissElementMutation = useMutation(api.userPreferences.dismissElement)
  const resetDismissedMutation = useMutation(api.userPreferences.resetDismissed)
  const resetAllMutation = useMutation(api.userPreferences.resetAll)

  // Load preferences from localStorage on mount (fallback for non-authenticated users)
  useEffect(() => {
    if (!isSignedIn) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          setLocalPreferences({ ...defaultPreferences, ...parsed })
        }
        setIsLocalLoaded(true)
      } catch (error) {
        console.warn("Failed to load UI preferences from localStorage:", error)
        setIsLocalLoaded(true)
      }
    }
  }, [isSignedIn])

  // Use Convex preferences when signed in, localStorage otherwise
  const preferences = isSignedIn && convexPreferences ? convexPreferences : localPreferences
  const isLoaded = isSignedIn ? convexPreferences !== undefined : isLocalLoaded

  const isDismissed = useCallback(
    (elementId: keyof UIPreferences["dismissedElements"]) => {
      return preferences.dismissedElements[elementId] === true
    },
    [preferences]
  )

  const dismissElement = useCallback(async (elementId: keyof UIPreferences["dismissedElements"]) => {
    console.log("DISMISSING ELEMENT:", elementId)
    
    if (isSignedIn) {
      // Use Convex for authenticated users
      try {
        await dismissElementMutation({ elementId })
        console.log("Saved to Convex:", elementId)
      } catch (error) {
        console.error("Failed to save dismissal to Convex:", error)
      }
    } else {
      // Use localStorage for non-authenticated users
      const newPreferences = {
        dismissedElements: {
          ...localPreferences.dismissedElements,
          [elementId]: true,
        },
      }
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences))
        console.log("Saved to localStorage:", newPreferences)
        setLocalPreferences(newPreferences)
      } catch (error) {
        console.error("Failed to save dismissal to localStorage:", error)
      }
    }
  }, [isSignedIn, localPreferences, dismissElementMutation])

  const resetDismissed = useCallback(
    async (elementId?: keyof UIPreferences["dismissedElements"]) => {
      if (isSignedIn) {
        // Use Convex for authenticated users
        try {
          await resetDismissedMutation({ elementId })
        } catch (error) {
          console.error("Failed to reset dismissal in Convex:", error)
        }
      } else {
        // Use localStorage for non-authenticated users
        if (elementId) {
          const newDismissedElements = { ...localPreferences.dismissedElements }
          delete newDismissedElements[elementId]
          const newPreferences = {
            ...localPreferences,
            dismissedElements: newDismissedElements,
          }
          setLocalPreferences(newPreferences)
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences))
          } catch (error) {
            console.error("Failed to save reset to localStorage:", error)
          }
        } else {
          const newPreferences = {
            ...localPreferences,
            dismissedElements: {},
          }
          setLocalPreferences(newPreferences)
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences))
          } catch (error) {
            console.error("Failed to save reset to localStorage:", error)
          }
        }
      }
    },
    [isSignedIn, localPreferences, resetDismissedMutation]
  )

  const resetAll = useCallback(async () => {
    if (isSignedIn) {
      // Use Convex for authenticated users
      try {
        await resetAllMutation()
      } catch (error) {
        console.error("Failed to reset all preferences in Convex:", error)
      }
    } else {
      // Use localStorage for non-authenticated users
      setLocalPreferences(defaultPreferences)
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.error("Failed to remove preferences from localStorage:", error)
      }
    }
  }, [isSignedIn, resetAllMutation])

  return {
    preferences,
    isDismissed,
    dismissElement,
    resetDismissed,
    resetAll,
    isLoaded,
  }
}