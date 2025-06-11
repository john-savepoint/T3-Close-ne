"use client"

import { useEffect } from "react"
import { useChatSharing } from "@/hooks/use-chat-sharing"
import { useRouter } from "next/navigation"

export function ForkHandler() {
  const router = useRouter()
  const { forkConversation } = useChatSharing()

  useEffect(() => {
    const handlePendingFork = async () => {
      const pendingFork = sessionStorage.getItem("pendingFork")

      if (pendingFork) {
        try {
          const forkData = JSON.parse(pendingFork)

          // Clear the pending fork
          sessionStorage.removeItem("pendingFork")

          // Create the forked conversation
          const newChatId = await forkConversation(forkData)

          // Redirect to the new chat
          router.push(`/chat/${newChatId}`)
        } catch (error) {
          console.error("Failed to complete fork:", error)
          // Could show a toast notification here
        }
      }
    }

    // Run on component mount (after login)
    handlePendingFork()
  }, [forkConversation, router])

  return null // This component doesn't render anything
}
