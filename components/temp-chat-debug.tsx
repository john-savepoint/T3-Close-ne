"use client"

import { useTemporaryChat } from "@/hooks/use-temporary-chat"
import { Button } from "@/components/ui/button"

export function TempChatDebug() {
  const { isTemporaryMode, temporaryChat, startTemporaryChat, clearTemporaryChat } = useTemporaryChat()

  return (
    <div className="fixed top-4 right-4 z-50 p-4 bg-black/80 text-white rounded border space-y-2">
      <div className="text-xs">
        <div>Temp Mode: {isTemporaryMode ? "YES" : "NO"}</div>
        <div>Temp Chat ID: {temporaryChat?.id || "None"}</div>
        <div>Messages: {temporaryChat?.messages.length || 0}</div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={startTemporaryChat}>Start</Button>
        <Button size="sm" onClick={clearTemporaryChat} disabled={!isTemporaryMode}>Clear</Button>
      </div>
    </div>
  )
}