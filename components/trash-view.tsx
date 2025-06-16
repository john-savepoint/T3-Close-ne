"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2, AlertTriangle, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useChatLifecycle } from "@/hooks/use-chat-lifecycle"
import { EnhancedChatItem } from "@/components/enhanced-chat-item"
import { ConfirmationModal } from "@/components/confirmation-modal"

export function TrashView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false)
  const { trashedChats, loading, restoreFromTrash, deletePermanently, emptyTrash, getDaysUntilAutoPurge } =
    useChatLifecycle()

  const filteredChats = trashedChats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleRestore = async (chatId: string) => {
    try {
      await restoreFromTrash(chatId)
      // Show success toast
    } catch (error) {
      // Show error toast
      console.error("Failed to restore chat:", error)
    }
  }

  const handleDeletePermanently = async (chatId: string) => {
    try {
      await deletePermanently(chatId)
      // Show success toast
    } catch (error) {
      // Show error toast
      console.error("Failed to permanently delete chat:", error)
    }
  }

  const handleEmptyTrash = async () => {
    try {
      await emptyTrash()
      setShowEmptyTrashModal(false)
      // Show success toast
    } catch (error) {
      // Show error toast
      console.error("Failed to empty trash:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-mauve-subtle">Loading trash...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-mauve-dark">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trash2 className="h-6 w-6 text-red-400" />
            <h1 className="text-2xl font-bold text-foreground">Trash</h1>
            <Badge variant="outline" className="bg-red-500/10 border-red-500/50 text-red-400">
              {trashedChats.length} {trashedChats.length === 1 ? "chat" : "chats"}
            </Badge>
          </div>

          {trashedChats.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowEmptyTrashModal(true)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Empty Trash
            </Button>
          )}
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-400 font-medium mb-1">Auto-deletion Policy</p>
              <p className="text-orange-300/80 text-sm">
                Items in Trash are automatically deleted after 30 days. This helps keep your account storage optimized
                while giving you time to recover accidentally deleted chats.
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mauve-subtle" />
          <Input
            placeholder="Search trash..."
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
            <Trash2 className="h-16 w-16 text-mauve-subtle/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "No matching items in trash" : "Trash is empty"}
            </h3>
            <p className="text-mauve-subtle max-w-md">
              {searchQuery
                ? "Try adjusting your search terms to find what you're looking for."
                : "When you delete chats, they'll appear here for 30 days before being permanently removed."}
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
                  onDeletePermanently={() => handleDeletePermanently(chat.id)}
                  className="bg-red-500/5 hover:bg-red-500/10 border border-red-500/20"
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Empty Trash Confirmation Modal */}
      <ConfirmationModal
        isOpen={showEmptyTrashModal}
        onClose={() => setShowEmptyTrashModal(false)}
        onConfirm={handleEmptyTrash}
        title="Empty Trash"
        description={`This will permanently delete all ${trashedChats.length} chats in your trash. This action cannot be undone.`}
        confirmText="Empty Trash"
        confirmVariant="destructive"
        icon={<AlertTriangle className="h-6 w-6 text-red-400" />}
      />
    </div>
  )
}
