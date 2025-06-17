"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, MessageSquare, ExternalLink } from "lucide-react"
import type { RAGResult } from "@/types/memory"

interface RAGCitationProps {
  results: RAGResult[]
  className?: string
}

export function RAGCitation({ results, className = "" }: RAGCitationProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (results.length === 0) return null

  return (
    <div className={`mt-3 ${className}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-2 text-xs text-mauve-subtle/70 hover:text-mauve-subtle"
          >
            {isExpanded ? (
              <ChevronDown className="mr-1 h-3 w-3" />
            ) : (
              <ChevronRight className="mr-1 h-3 w-3" />
            )}
            Based on past conversations ({results.length})
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="space-y-2 rounded-lg border border-mauve-dark/50 bg-mauve-dark/20 p-3">
            <h4 className="text-xs font-medium text-mauve-accent">
              Sources from your chat history:
            </h4>
            <div className="space-y-2">
              {results.map((result) => (
                <div key={result.id} className="rounded bg-mauve-dark/30 p-2 text-xs">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3 text-mauve-subtle/70" />
                      <span className="text-mauve-subtle/70">
                        {result.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="h-4 text-xs">
                        {Math.round(result.relevanceScore * 100)}% match
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={() => {
                          // Navigate to original chat
                          console.log("Navigate to chat:", result.chatId)
                        }}
                      >
                        <ExternalLink className="h-2 w-2" />
                      </Button>
                    </div>
                  </div>
                  <p className="mb-1 text-mauve-subtle/80">
                    <span className="font-medium">Context:</span> "{result.snippet}"
                  </p>
                  <p className="text-mauve-subtle/90">
                    {result.content.length > 120
                      ? `${result.content.substring(0, 120)}...`
                      : result.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
