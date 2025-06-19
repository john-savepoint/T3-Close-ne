"use client"

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Toast } from "@/hooks/use-toast"

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

export function Toast({ toast, onRemove }: ToastProps) {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case "info":
        return <Info className="h-4 w-4 text-blue-400" />
      default:
        return null
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case "success":
        return "border-green-500/50 bg-green-500/10"
      case "error":
        return "border-red-500/50 bg-red-500/10"
      case "warning":
        return "border-yellow-500/50 bg-yellow-500/10"
      case "info":
        return "border-blue-500/50 bg-blue-500/10"
      default:
        return "border-mauve-dark bg-mauve-surface"
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm",
        getBackgroundColor()
      )}
    >
      {getIcon()}
      <p className="flex-1 text-sm text-foreground">{toast.message}</p>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-mauve-subtle hover:text-foreground"
        onClick={() => onRemove(toast.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
