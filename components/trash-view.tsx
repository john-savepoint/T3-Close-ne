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
  const {
    trashedChats,
    loading,
    restoreFromTrash,
    deletePermanently,
    emptyTrash,
    getDaysUntilAutoPurge,
  } = useChatLifecycle()

  const filteredChats = trashedChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <div className="flex h-64 items-center justify-center">
        <div className="text-mauve-subtle">Loading trash...</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-mauve-dark p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trash2 className="h-6 w-6 text-red-400" />
            <h1 className="text-2xl font-bold text-foreground">Trash</h1>
            <Badge variant="outline" className="border-red-500/50 bg-red-500/10 text-red-400">
              {trashedChats.length} {trashedChats.length === 1 ? "chat" : "chats"}
            </Badge>
          </div>

          {trashedChats.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowEmptyTrashModal(true)}
              className="border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Empty Trash
            </Button>
          )}
        </div>

        <div className="mb-4 rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-400" />
            <div>
              <p className="mb-1 font-medium text-orange-400">Auto-deletion Policy</p>
              <p className="text-sm text-orange-300/80">
                Items in Trash are automatically deleted after 30 days. This helps keep your account
                storage optimized while giving you time to recover accidentally deleted chats.
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve-subtle" />
          <Input
            placeholder="Search trash..."
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
            <Trash2 className="mb-4 h-16 w-16 text-mauve-subtle/30" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {searchQuery ? "No matching items in trash" : "Trash is empty"}
            </h3>
            <p className="max-w-md text-mauve-subtle">
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
            <div className="space-y-2 p-4">
              {filteredChats.map((chat) => {
                // Adapt Convex chat to component interface
                const adaptedChat = {
                  ...chat,
                  id: chat._id || (chat as any).id,
                  messages: [],
                  createdAt: new Date(chat.createdAt),
                  updatedAt: new Date(chat.updatedAt),
                  statusChangedAt: new Date(chat.statusChangedAt),
                }
                return (
                  <EnhancedChatItem
                    key={adaptedChat.id}
                    chat={adaptedChat}
                    onRestore={() => handleRestore(adaptedChat.id)}
                    onDeletePermanently={() => handleDeletePermanently(adaptedChat.id)}
                    className="border border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                  />
                )
              })}
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
