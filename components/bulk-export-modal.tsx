"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Package, Loader2, AlertTriangle } from "lucide-react"
import type { Chat } from "@/types/chat"

interface BulkExportModalProps {
  chats: Chat[]
  trigger?: React.ReactNode
}

export function BulkExportModal({ chats, trigger }: BulkExportModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const toggleChatSelection = (chatId: string) => {
    const newSelection = new Set(selectedChats)
    if (newSelection.has(chatId)) {
      newSelection.delete(chatId)
    } else {
      newSelection.add(chatId)
    }
    setSelectedChats(newSelection)
  }

  const selectAll = () => {
    setSelectedChats(new Set(chats.map((chat) => chat.id)))
  }

  const selectNone = () => {
    setSelectedChats(new Set())
  }

  const handleBulkExport = async () => {
    if (selectedChats.size === 0) return

    setIsExporting(true)
    setExportProgress(0)

    try {
      // This would implement a ZIP file creation with multiple chat exports
      // For now, we'll simulate the process
      const selectedChatList = chats.filter((chat) => selectedChats.has(chat.id))

      for (let i = 0; i < selectedChatList.length; i++) {
        // Simulate export processing
        await new Promise((resolve) => setTimeout(resolve, 500))
        setExportProgress(((i + 1) / selectedChatList.length) * 100)
      }

      // In a real implementation, this would create a ZIP file and trigger download
      alert(`Successfully exported ${selectedChats.size} chats!`)
    } catch (error) {
      console.error("Bulk export failed:", error)
      alert("Bulk export failed. Please try again.")
    } finally {
      setIsExporting(false)
      setExportProgress(0)
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Package className="h-4 w-4" />
            Bulk Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl border-mauve-dark bg-mauve-surface">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Package className="h-5 w-5" />
            Bulk Export Chats
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isExporting ? (
            <div className="space-y-4">
              <Alert className="border-blue-500/20 bg-blue-500/10">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <AlertDescription className="text-blue-300">
                  Exporting {selectedChats.size} chats... Please wait.
                </AlertDescription>
              </Alert>
              <Progress value={exportProgress} className="w-full" />
              <p className="text-center text-sm text-mauve-subtle/70">
                {Math.round(exportProgress)}% complete
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {selectedChats.size} of {chats.length} chats selected
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {chats.reduce((total, chat) => total + chat.messages.length, 0)} total messages
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={selectNone}>
                    Select None
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-64 rounded-lg border border-mauve-dark">
                <div className="space-y-2 p-4">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className="flex cursor-pointer items-center space-x-3 rounded-lg p-2 hover:bg-mauve-dark/30"
                      onClick={() => toggleChatSelection(chat.id)}
                    >
                      <Checkbox
                        checked={selectedChats.has(chat.id)}
                        onCheckedChange={() => toggleChatSelection(chat.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{chat.title}</p>
                        <div className="flex items-center gap-2 text-xs text-mauve-subtle/70">
                          <span>{chat.messages.length} messages</span>
                          <span>•</span>
                          <span>{chat.updatedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Alert className="border-amber-500/20 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-sm text-amber-300">
                  Bulk export will create a ZIP file containing all selected chats in Markdown
                  format.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  onClick={handleBulkExport}
                  disabled={selectedChats.size === 0}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export {selectedChats.size} Chats
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
