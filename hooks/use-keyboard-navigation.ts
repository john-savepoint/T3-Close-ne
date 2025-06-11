"use client"

import { useState, useCallback, useEffect } from "react"

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
}

export function useKeyboardNavigation() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isModelSwitcherOpen, setIsModelSwitcherOpen] = useState(false)

  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true)
  }, [])

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false)
  }, [])

  const openModelSwitcher = useCallback(() => {
    setIsModelSwitcherOpen(true)
  }, [])

  const closeModelSwitcher = useCallback(() => {
    setIsModelSwitcherOpen(false)
  }, [])

  const shortcuts: KeyboardShortcut[] = [
    {
      key: "k",
      metaKey: true,
      action: openModelSwitcher,
      description: "Open model switcher",
    },
    {
      key: "k",
      ctrlKey: true,
      action: openModelSwitcher,
      description: "Open model switcher",
    },
    {
      key: "p",
      metaKey: true,
      shiftKey: true,
      action: openCommandPalette,
      description: "Open command palette",
    },
    {
      key: "p",
      ctrlKey: true,
      shiftKey: true,
      action: openCommandPalette,
      description: "Open command palette",
    },
  ]

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        return
      }

      shortcuts.forEach((shortcut) => {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
        const metaMatches = !!shortcut.metaKey === event.metaKey
        const shiftMatches = !!shortcut.shiftKey === event.shiftKey
        const altMatches = !!shortcut.altKey === event.altKey

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault()
          shortcut.action()
        }
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, []) // Removed shortcuts from the dependency array

  return {
    isCommandPaletteOpen,
    isModelSwitcherOpen,
    openCommandPalette,
    closeCommandPalette,
    openModelSwitcher,
    closeModelSwitcher,
    shortcuts,
  }
}
