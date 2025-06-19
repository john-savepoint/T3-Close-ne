import { useState, useCallback } from "react"

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "warning" | "info"
}

interface ToastOptions {
  message?: string
  type?: "success" | "error" | "warning" | "info"
  // Legacy support
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).slice(2)

    // Handle legacy format
    let message: string
    let type: "success" | "error" | "warning" | "info"

    if (options.message) {
      message = options.message
      type = options.type || "info"
    } else if (options.title) {
      // Legacy format - convert title/description to message
      message = options.description ? `${options.title}: ${options.description}` : options.title
      type = options.variant === "destructive" ? "error" : "success"
    } else {
      message = "Notification"
      type = "info"
    }

    const newToast: Toast = {
      id,
      message,
      type,
    }

    setToasts((prev) => [...prev, newToast])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const success = useCallback(
    (message: string) => {
      toast({ message, type: "success" })
    },
    [toast]
  )

  const error = useCallback(
    (message: string) => {
      toast({ message, type: "error" })
    },
    [toast]
  )

  const warning = useCallback(
    (message: string) => {
      toast({ message, type: "warning" })
    },
    [toast]
  )

  const info = useCallback(
    (message: string) => {
      toast({ message, type: "info" })
    },
    [toast]
  )

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Alias for compatibility
  const removeToast = dismiss

  return {
    toast,
    toasts,
    dismiss,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
