"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
  onDismiss: (id: string) => void
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, variant = "default", onDismiss }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-auto flex w-full max-w-md items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
          variant === "default" && "border-mauve-dark bg-mauve-surface text-foreground",
          variant === "destructive" && "border-red-500/50 bg-red-500/20 text-red-400"
        )}
        data-state="open"
      >
        <div className="grid gap-1">
          <div className="text-sm font-semibold">{title}</div>
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none",
            variant === "default" && "text-mauve-subtle/50 hover:text-mauve-subtle focus:ring-mauve-accent",
            variant === "destructive" && "text-red-400/50 hover:text-red-400 focus:ring-red-500"
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }
)
Toast.displayName = "Toast"

export interface ToastContainerProps {
  toasts: Array<{
    id: string
    title: string
    description?: string
    variant?: "default" | "destructive"
  }>
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}