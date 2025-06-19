"use client"

import { useToast } from "@/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, dismiss } = useToast()

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={dismiss} />
    </>
  )
}
