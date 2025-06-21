"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

const STORAGE_KEY = "z6chat-ui-preferences"
const MIGRATION_KEY = "z6chat-ui-preferences-migrated"

/**
 * Hook to migrate UI preferences from localStorage to Convex when user signs in
 * This ensures a smooth transition from anonymous to authenticated state
 */
export function useMigrateUIPreferences() {
  const { isSignedIn, userId } = useAuth()
  const dismissElementMutation = useMutation(api.userPreferences.dismissElement)
  const hasMigratedRef = useRef(false)

  useEffect(() => {
    if (!isSignedIn || !userId || hasMigratedRef.current) {
      return
    }

    // Check if we've already migrated for this user
    const migrationKey = `${MIGRATION_KEY}-${userId}`
    const hasMigrated = localStorage.getItem(migrationKey)
    
    if (hasMigrated) {
      hasMigratedRef.current = true
      return
    }

    // Attempt to migrate preferences
    const migratePreferences = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          const dismissedElements = parsed.dismissedElements || {}
          
          // Migrate each dismissed element to Convex
          for (const [elementId, isDismissed] of Object.entries(dismissedElements)) {
            if (isDismissed === true) {
              await dismissElementMutation({ elementId })
            }
          }
          
          // Mark as migrated
          localStorage.setItem(migrationKey, "true")
          hasMigratedRef.current = true
          
          // Optionally clean up localStorage after successful migration
          // localStorage.removeItem(STORAGE_KEY)
          
          console.log("Successfully migrated UI preferences to Convex")
        }
      } catch (error) {
        console.error("Failed to migrate UI preferences:", error)
      }
    }

    migratePreferences()
  }, [isSignedIn, userId, dismissElementMutation])
}