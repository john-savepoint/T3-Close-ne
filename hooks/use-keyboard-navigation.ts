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
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(-1)

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

  const navigateToMessage = useCallback((index: number) => {
    setCurrentMessageIndex(index)
    const messages = document.querySelectorAll('[id^="message-"]')

    if (messages[index]) {
      // Smooth scroll to message with improved centering
      messages[index].scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      })

      // Add focus/highlight effect with animation
      const element = messages[index] as HTMLElement
      element.classList.add("ring-2", "ring-mauve-accent", "transition-all", "duration-300")

      // Remove highlight after animation
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-mauve-accent", "transition-all", "duration-300")
      }, 1500)

      // Focus the element for accessibility
      element.focus({ preventScroll: true })
    }
  }, [])

  const navigateNext = useCallback(() => {
    const messages = document.querySelectorAll('[id^="message-"]')
    const nextIndex = Math.min(currentMessageIndex + 1, messages.length - 1)
    navigateToMessage(nextIndex)
  }, [currentMessageIndex, navigateToMessage])

  const navigatePrevious = useCallback(() => {
    const nextIndex = Math.max(currentMessageIndex - 1, 0)
    navigateToMessage(nextIndex)
  }, [currentMessageIndex, navigateToMessage])

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
    // Message navigation shortcuts
    {
      key: "j",
      action: navigateNext,
      description: "Navigate to next message",
    },
    {
      key: "k",
      action: navigatePrevious,
      description: "Navigate to previous message",
    },
    // Vim-style navigation in lists (for Post-MVP)
    {
      key: "n",
      ctrlKey: true,
      action: navigateNext,
      description: "Navigate to next item (Vim-style)",
    },
    {
      key: "p",
      ctrlKey: true,
      action: navigatePrevious,
      description: "Navigate to previous item (Vim-style)",
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

      // Check for model switcher shortcut
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && !event.shiftKey) {
        event.preventDefault()
        openModelSwitcher()
        return
      }

      // Check for command palette shortcut
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault()
        openCommandPalette()
        return
      }

      // Check for navigation shortcuts
      if (event.key === "j" && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
        event.preventDefault()
        navigateNext()
        return
      }

      if (event.key === "k" && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
        event.preventDefault()
        navigatePrevious()
        return
      }

      // Vim-style navigation
      if (event.ctrlKey && event.key === "n") {
        event.preventDefault()
        navigateNext()
        return
      }

      if (event.ctrlKey && event.key === "p") {
        event.preventDefault()
        navigatePrevious()
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [openModelSwitcher, openCommandPalette, navigateNext, navigatePrevious])

  return {
    isCommandPaletteOpen,
    isModelSwitcherOpen,
    openCommandPalette,
    closeCommandPalette,
    openModelSwitcher,
    closeModelSwitcher,
    currentMessageIndex,
    navigateToMessage,
    navigateNext,
    navigatePrevious,
    shortcuts,
  }
}
