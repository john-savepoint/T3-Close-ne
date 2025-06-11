"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, X, Check } from "lucide-react"
import { useMemory } from "@/hooks/use-memory"
import type { MemorySuggestion } from "@/types/memory"

interface MemorySuggestionBannerProps {
  suggestion: MemorySuggestion
  onAccept?: () => void
  onDismiss?: () => void
}

export function MemorySuggestionBanner({ suggestion, onAccept, onDismiss }: MemorySuggestionBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const { acceptSuggestion, dismissSuggestion } = useMemory()

  const handleAccept = async () => {
    await acceptSuggestion(suggestion.id)
    setIsVisible(false)
    onAccept?.()
  }

  const handleDismiss = async () => {
    await dismissSuggestion(suggestion.id)
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Remember this for future chats?</p>
                <p className="text-sm text-mauve-subtle/80 mt-1">{suggestion.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-500/50">
                    <Lightbulb className="w-3 h-3 mr-1" />
                    AI Suggestion
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(suggestion.confidence * 100)}% confidence
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={handleDismiss}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={handleDismiss} className="text-xs">
                Not now
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/50 text-xs"
              >
                <Check className="w-3 h-3 mr-1" />
                Save Memory
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
