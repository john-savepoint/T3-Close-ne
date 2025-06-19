"use client"

import { X, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Toast } from "@/hooks/use-toast"

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

export function Toast({ toast, onRemove }: ToastProps) {
  const getIcon = () => {
    switch (toast.variant) {
      case "destructive":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (toast.variant) {
      case "destructive":
        return "border-red-500/50 bg-red-500/10"
      default:
        return "border-green-500/50 bg-green-500/10"
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
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && <p className="text-xs text-muted-foreground">{toast.description}</p>}
      </div>
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
