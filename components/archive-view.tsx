"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Archive } from "lucide-react"
import { useState } from "react"
import { useChatLifecycle } from "@/hooks/use-chat-lifecycle"
import { EnhancedChatItem } from "@/components/enhanced-chat-item"
import { ChatErrorBoundary } from "@/components/error-boundary"

export function ArchiveView() {
  const [searchQuery, setSearchQuery] = useState("")
  const { archivedChats, loading, restoreFromArchive, moveToTrash } = useChatLifecycle()

  const filteredChats = archivedChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRestore = async (chatId: string) => {
    try {
      await restoreFromArchive(chatId)
      // TODO: Show success toast notification
    } catch (error) {
      // TODO: Show error toast notification
      console.error("Failed to restore chat:", error)
    }
  }

  const handleMoveToTrash = async (chatId: string) => {
    try {
      await moveToTrash(chatId)
      // TODO: Show success toast notification
    } catch (error) {
      // TODO: Show error toast notification
      console.error("Failed to move chat to trash:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-mauve-subtle">Loading archived chats...</div>
      </div>
    )
  }

  return (
    <ChatErrorBoundary>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-mauve-dark p-6">
          <div className="mb-4 flex items-center gap-3">
            <Archive className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-foreground">Archive</h1>
            <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-400">
              {archivedChats.length} {archivedChats.length === 1 ? "chat" : "chats"}
            </Badge>
          </div>

          <p className="mb-4 text-mauve-subtle">
            Archived chats are hidden from your main chat list but preserved indefinitely. You can
            restore them at any time.
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve-subtle" />
            <Input
              placeholder="Search archived chats..."
              className="border-mauve-dark bg-black/20 pl-9 focus-visible:ring-mauve-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {filteredChats.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <Archive className="mb-4 h-16 w-16 text-mauve-subtle/30" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {searchQuery ? "No matching archived chats" : "No archived chats"}
              </h3>
              <p className="max-w-md text-mauve-subtle">
                {searchQuery
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "When you archive chats, they'll appear here. Archived chats are hidden from your main list but can be restored anytime."}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-4">
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-2 p-4">
                {filteredChats.map((chat) => (
                  <EnhancedChatItem
                    key={chat.id}
                    chat={chat}
                    onRestore={() => handleRestore(chat.id)}
                    onMoveToTrash={() => handleMoveToTrash(chat.id)}
                    className="bg-black/10 hover:bg-black/20"
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </ChatErrorBoundary>
  )
}
