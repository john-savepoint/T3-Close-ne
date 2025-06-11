"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EyeOff, Zap, Shield, MessageSquare, Keyboard } from "lucide-react"
import { useTemporaryChat } from "@/hooks/use-temporary-chat"

interface TemporaryChatStarterProps {
  onStart?: () => void
}

export function TemporaryChatStarter({ onStart }: TemporaryChatStarterProps) {
  const { startTemporaryChat } = useTemporaryChat()

  const handleStart = () => {
    startTemporaryChat()
    onStart?.()
  }

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <EyeOff className="w-5 h-5 text-orange-400" />
          Start a Temporary Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-mauve-subtle/80">
          Perfect for quick questions, sensitive topics, or when you don't want to clutter your chat history.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Not saved to history</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>Zero friction mode</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Can be saved later</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={handleStart} className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400">
            <EyeOff className="w-4 h-4 mr-2" />
            Start Temporary Chat
          </Button>

          <div className="text-xs text-mauve-subtle/70 text-center">
            <div className="flex items-center justify-center gap-1">
              <Keyboard className="w-3 h-3" />
              <span>Tip: Use</span>
              <Badge variant="outline" className="text-xs px-1 py-0">
                Cmd+Shift+T
              </Badge>
              <span>for quick access</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
