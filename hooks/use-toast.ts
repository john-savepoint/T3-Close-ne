"use client"

import { useState, useCallback } from "react"

export interface Toast {
  id: string
  type: "success" | "error" | "info" | "warning"
  message: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])

    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, toast.duration || 3000)

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((message: string, duration?: number) => {
    return showToast({ type: "success", message, duration })
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    return showToast({ type: "error", message, duration })
  }, [showToast])

  const info = useCallback((message: string, duration?: number) => {
    return showToast({ type: "info", message, duration })
  }, [showToast])

  const warning = useCallback((message: string, duration?: number) => {
    return showToast({ type: "warning", message, duration })
  }, [showToast])

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  }
}