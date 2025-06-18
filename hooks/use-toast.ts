import { useState, useCallback } from "react"

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
}

interface ToastOptions {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).slice(2)
    const newToast: Toast = {
      id,
      ...options,
    }

    setToasts((prev) => [...prev, newToast])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toast, toasts, dismiss }
}