"use client"

import { useState, useCallback } from "react"

export type NavigationView = "home" | "pinned" | "archive" | "trash" | "projects"

export function useNavigationState() {
  const [currentView, setCurrentView] = useState<NavigationView>("home")

  const navigateToView = useCallback((view: NavigationView) => {
    setCurrentView(view)
  }, [])

  const isCurrentView = useCallback((view: NavigationView) => {
    return currentView === view
  }, [currentView])

  return {
    currentView,
    navigateToView,
    isCurrentView,
  }
}