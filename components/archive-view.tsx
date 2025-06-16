"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Archive } from "lucide-react"
import { useState } from "react"
import { useChatLifecycle } from "@/hooks/use-chat-lifecycle"
import { EnhancedChatItem } from "@/components/enhanced-chat-item"

export function ArchiveView() {
  const [searchQuery, setSearchQuery] = useState("")
  const { archivedChats, loading, restoreFromArchive, moveToTrash } = useChatLifecycle()

  const filteredChats = archivedChats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleRestore = async (chatId: string) => {
    try {
      await restoreFromArchive(chatId)
      // Show success toast
    } catch (error) {
      // Show error toast
      console.error("Failed to restore chat:", error)
    }
  }

  const handleMoveToTrash = async (chatId: string) => {
    try {
      await moveToTrash(chatId)
      // Show success toast
    } catch (error) {
      // Show error toast
      console.error("Failed to move chat to trash:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-mauve-subtle">Loading archived chats...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-mauve-dark">
        <div className="flex items-center gap-3 mb-4">
          <Archive className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-foreground">Archive</h1>
          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/50 text-blue-400">
            {archivedChats.length} {archivedChats.length === 1 ? "chat" : "chats"}
          </Badge>
        </div>

        <p className="text-mauve-subtle mb-4">
          Archived chats are hidden from your main chat list but preserved indefinitely. You can restore them at any
          time.
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mauve-subtle" />
          <Input
            placeholder="Search archived chats..."
            className="pl-9 bg-black/20 border-mauve-dark focus-visible:ring-mauve-accent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Archive className="h-16 w-16 text-mauve-subtle/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "No matching archived chats" : "No archived chats"}
            </h3>
            <p className="text-mauve-subtle max-w-md">
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
            <div className="p-4 space-y-2">
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
  )
}
