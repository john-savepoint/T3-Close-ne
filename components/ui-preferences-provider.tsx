"use client"

import { useMigrateUIPreferences } from "@/hooks/use-migrate-ui-preferences"

export function UIPreferencesProvider({ children }: { children: React.ReactNode }) {
  // This hook will handle migrating preferences from localStorage to Convex
  useMigrateUIPreferences()
  
  return <>{children}</>
}