import { useState, useEffect, useCallback } from "react"

interface CollapseState {
  collapsed: Set<string>
  previousState: Set<string> | null
}

export function useCollapseState(storageKey: string = "chat-collapse-state") {
  const [state, setState] = useState<CollapseState>(() => {
    if (typeof window === "undefined") {
      return { collapsed: new Set(), previousState: null }
    }
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          collapsed: new Set(parsed.collapsed || []),
          previousState: parsed.previousState ? new Set(parsed.previousState) : null
        }
      }
    } catch (e) {
      console.error("Failed to load collapse state:", e)
    }
    
    return { collapsed: new Set(), previousState: null }
  })

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      const toStore = {
        collapsed: Array.from(state.collapsed),
        previousState: state.previousState ? Array.from(state.previousState) : null
      }
      localStorage.setItem(storageKey, JSON.stringify(toStore))
    } catch (e) {
      console.error("Failed to save collapse state:", e)
    }
  }, [state, storageKey])

  const toggleCollapse = useCallback((messageId: string) => {
    setState(prev => {
      const newCollapsed = new Set(prev.collapsed)
      if (newCollapsed.has(messageId)) {
        newCollapsed.delete(messageId)
      } else {
        newCollapsed.add(messageId)
      }
      return { ...prev, collapsed: newCollapsed }
    })
  }, [])

  const collapseAll = useCallback(() => {
    setState(prev => ({
      collapsed: new Set(),  // Empty set means all are collapsed
      previousState: new Set(prev.collapsed)  // Save current state
    }))
  }, [])

  const expandAll = useCallback(() => {
    setState(prev => {
      // If we have a previous state and currently everything is collapsed,
      // restore the previous state. Otherwise, expand everything.
      if (prev.previousState && prev.collapsed.size === 0) {
        return {
          collapsed: new Set(prev.previousState),
          previousState: null
        }
      }
      // Create a set with all message IDs to indicate they're expanded
      // Since we use the absence of an ID to mean collapsed, we need a different approach
      // Let's use a special marker
      return {
        collapsed: new Set(["__all_expanded__"]),
        previousState: null
      }
    })
  }, [])

  const isCollapsed = useCallback((messageId: string): boolean => {
    // If __all_expanded__ is in the set, nothing is collapsed
    if (state.collapsed.has("__all_expanded__")) {
      return false
    }
    // If the set is empty, everything is collapsed
    if (state.collapsed.size === 0) {
      return true
    }
    // Otherwise, check if this specific message is collapsed
    return state.collapsed.has(messageId)
  }, [state.collapsed])

  const hasCollapsedMessages = useCallback((): boolean => {
    // If everything is expanded, return false
    if (state.collapsed.has("__all_expanded__")) {
      return false
    }
    // If set is empty (all collapsed) or has any IDs, there are collapsed messages
    return state.collapsed.size === 0 || (state.collapsed.size > 0 && !state.collapsed.has("__all_expanded__"))
  }, [state.collapsed])

  const clearState = useCallback(() => {
    setState({ collapsed: new Set(), previousState: null })
  }, [])

  return {
    isCollapsed,
    toggleCollapse,
    collapseAll,
    expandAll,
    hasCollapsedMessages,
    clearState,
  }
}