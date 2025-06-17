"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EyeOff, Save, X, Clock, Shield } from "lucide-react"
import { useTemporaryChat } from "@/hooks/use-temporary-chat"
import { SaveTemporaryChatModal } from "@/components/save-temporary-chat-modal"
import { useState } from "react"

export function TemporaryChatBanner() {
  const { temporaryChat, exitTemporaryMode, settings } = useTemporaryChat()
  const [showSaveModal, setShowSaveModal] = useState(false)

  if (!temporaryChat) return null

  const messageCount = temporaryChat.messages.length
  const duration = Math.floor((Date.now() - temporaryChat.createdAt.getTime()) / 1000 / 60) // minutes

  return (
    <>
      <Alert className="rounded-none border-x-0 border-t-0 border-orange-500/20 bg-orange-500/10">
        <EyeOff className="h-4 w-4 text-orange-400" />
        <AlertDescription className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-orange-400">Temporary Chat</span>
              <Badge variant="outline" className="border-orange-500/50 text-xs text-orange-400">
                <Shield className="mr-1 h-3 w-3" />
                Not Saved
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-orange-300/70">
              <span>{messageCount} messages</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {duration < 1 ? "Just started" : `${duration}m ago`}
              </span>
            </div>

            <div className="text-xs text-orange-300/70">
              This conversation will be lost when you close the tab or navigate away.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-orange-500/50 text-orange-400 hover:bg-orange-500/20"
              onClick={() => setShowSaveModal(true)}
              disabled={messageCount === 0}
            >
              <Save className="mr-1 h-3 w-3" />
              Save to History
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="text-orange-400 hover:bg-orange-500/20"
              onClick={exitTemporaryMode}
            >
              <X className="mr-1 h-3 w-3" />
              Exit Temp Mode
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <SaveTemporaryChatModal open={showSaveModal} onOpenChange={setShowSaveModal} />
    </>
  )
}
