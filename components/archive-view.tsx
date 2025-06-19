"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Archive, RotateCcw, Trash2, CheckSquare, Square } from "lucide-react"
import { useState } from "react"
import { useChatLifecycle } from "@/hooks/use-chat-lifecycle"
import { EnhancedChatItem } from "@/components/enhanced-chat-item"
import { ChatErrorBoundary } from "@/components/error-boundary"
import { useToast } from "@/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"

export function ArchiveView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set())
  const [isBulkMode, setIsBulkMode] = useState(false)
  const { archivedChats, loading, restoreFromArchive, moveToTrash, bulkRestore, bulkMoveToTrash } =
    useChatLifecycle()

  const { toasts, success, error: showError, removeToast } = useToast()

  const filteredChats = archivedChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRestore = async (chatId: string) => {
    try {
      await restoreFromArchive(chatId)
      success("Chat restored successfully")
    } catch (err) {
      showError("Failed to restore chat")
      console.error("Failed to restore chat:", err)
    }
  }

  const handleMoveToTrash = async (chatId: string) => {
    try {
      await moveToTrash(chatId)
      success("Chat moved to trash")
    } catch (err) {
      showError("Failed to move chat to trash")
      console.error("Failed to move chat to trash:", err)
    }
  }

  const handleChatSelect = (chatId: string, selected: boolean) => {
    const newSelected = new Set(selectedChats)
    if (selected) {
      newSelected.add(chatId)
    } else {
      newSelected.delete(chatId)
    }
    setSelectedChats(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedChats.size === filteredChats.length) {
      setSelectedChats(new Set())
    } else {
      setSelectedChats(new Set(filteredChats.map((chat) => chat.id)))
    }
  }

  const handleBulkRestore = async () => {
    try {
      await bulkRestore(Array.from(selectedChats))
      setSelectedChats(new Set())
      setIsBulkMode(false)
      success(`${selectedChats.size} chats restored successfully`)
    } catch (err) {
      showError("Failed to restore selected chats")
      console.error("Failed to bulk restore chats:", err)
    }
  }

  const handleBulkMoveToTrash = async () => {
    try {
      await bulkMoveToTrash(Array.from(selectedChats))
      setSelectedChats(new Set())
      setIsBulkMode(false)
      success(`${selectedChats.size} chats moved to trash`)
    } catch (err) {
      showError("Failed to move selected chats to trash")
      console.error("Failed to bulk move chats to trash:", err)
    }
  }

  const toggleBulkMode = () => {
    setIsBulkMode(!isBulkMode)
    setSelectedChats(new Set())
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
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Archive className="h-6 w-6 text-blue-400" />
              <h1 className="text-2xl font-bold text-foreground">Archive</h1>
              <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-400">
                {archivedChats.length} {archivedChats.length === 1 ? "chat" : "chats"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {isBulkMode && selectedChats.size > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkRestore}
                    className="border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore ({selectedChats.size})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkMoveToTrash}
                    className="border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Move to Trash ({selectedChats.size})
                  </Button>
                </>
              )}

              {archivedChats.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleBulkMode}
                  className={isBulkMode ? "bg-mauve-accent/20" : ""}
                >
                  {isBulkMode ? (
                    <Square className="mr-2 h-4 w-4" />
                  ) : (
                    <CheckSquare className="mr-2 h-4 w-4" />
                  )}
                  {isBulkMode ? "Cancel" : "Select"}
                </Button>
              )}
            </div>
          </div>

          <p className="mb-4 text-mauve-subtle">
            Archived chats are hidden from your main chat list but preserved indefinitely. You can
            restore them at any time.
          </p>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve-subtle" />
              <Input
                placeholder="Search archived chats..."
                className="border-mauve-dark bg-black/20 pl-9 focus-visible:ring-mauve-accent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isBulkMode && filteredChats.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedChats.size === filteredChats.length && filteredChats.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="border-mauve-dark data-[state=checked]:border-mauve-accent data-[state=checked]:bg-mauve-accent"
                />
                <span className="text-sm text-mauve-subtle">
                  Select all ({filteredChats.length} chats)
                </span>
              </div>
            )}
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
                  <div key={chat.id} className="flex items-center gap-3">
                    {isBulkMode && (
                      <Checkbox
                        checked={selectedChats.has(chat.id)}
                        onCheckedChange={(checked) => handleChatSelect(chat.id, checked as boolean)}
                        className="border-mauve-dark data-[state=checked]:border-mauve-accent data-[state=checked]:bg-mauve-accent"
                      />
                    )}
                    <div className="flex-1">
                      <EnhancedChatItem
                        chat={chat}
                        onRestore={() => handleRestore(chat.id)}
                        onMoveToTrash={() => handleMoveToTrash(chat.id)}
                        className="bg-black/10 hover:bg-black/20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ChatErrorBoundary>
  )
}
