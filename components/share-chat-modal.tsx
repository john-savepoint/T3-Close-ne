"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Share2, Copy, Eye, EyeOff, ExternalLink, BarChart3, Globe, Loader2, Check, AlertTriangle } from "lucide-react"
import { useChatSharing } from "@/hooks/use-chat-sharing"

interface ShareChatModalProps {
  chatId: string
  chatTitle?: string
  messageCount?: number
  trigger?: React.ReactNode
}

export function ShareChatModal({ chatId, chatTitle, messageCount = 0, trigger }: ShareChatModalProps) {
  const { createSharedLink, revokeSharedLink, getSharedLinkForChat, loading } = useChatSharing()
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const existingShare = getSharedLinkForChat(chatId)
  const shareUrl = existingShare ? `${window.location.origin}/s/${existingShare.token}` : null

  const handleCreateLink = async () => {
    try {
      await createSharedLink({ chatId, title: chatTitle })
    } catch (error) {
      console.error("Failed to create share link:", error)
    }
  }

  const handleRevokeLink = async () => {
    if (
      confirm(
        "Are you sure you want to revoke this shared link? Anyone with the link will no longer be able to access it.",
      )
    ) {
      try {
        await revokeSharedLink(chatId)
      } catch (error) {
        console.error("Failed to revoke share link:", error)
      }
    }
  }

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenLink = () => {
    if (shareUrl) {
      window.open(shareUrl, "_blank")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-mauve-subtle">
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-mauve-surface border-mauve-dark max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Chat Info */}
          <Card className="bg-mauve-dark/30 border-mauve-dark">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-mauve-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-mauve-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm truncate">{chatTitle || "Untitled Conversation"}</h3>
                  <div className="flex items-center gap-4 text-xs text-mauve-subtle/70 mt-1">
                    <span>{messageCount} messages</span>
                    {existingShare && <span>{existingShare.viewCount || 0} views</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!existingShare ? (
            /* Create Link State */
            <div className="space-y-4">
              <Alert className="bg-blue-500/10 border-blue-500/20">
                <AlertTriangle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  <strong>Public Sharing:</strong> Anyone with the link will be able to view this entire conversation.
                  Make sure it doesn't contain sensitive information.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">What happens when you share:</h4>
                <ul className="text-xs text-mauve-subtle/70 space-y-1 list-disc list-inside">
                  <li>A public, read-only link will be created</li>
                  <li>Visitors can view the conversation without signing up</li>
                  <li>They can "fork" the conversation to continue it in their own account</li>
                  <li>You can revoke access at any time</li>
                </ul>
              </div>

              <Button
                onClick={handleCreateLink}
                disabled={loading}
                className="w-full bg-mauve-accent/20 hover:bg-mauve-accent/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Link...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Create Public Link
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* Existing Link State */
            <div className="space-y-4">
              <Alert className="bg-green-500/10 border-green-500/20">
                <Eye className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  <strong>Link Active:</strong> This conversation is currently public and shareable.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="share-url" className="text-sm font-medium">
                  Share URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={shareUrl || ""}
                    readOnly
                    className="bg-mauve-dark/50 border-mauve-dark font-mono text-xs"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopyLink} className="flex-shrink-0">
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleOpenLink} className="flex-shrink-0">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {existingShare.viewCount !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="w-4 h-4 text-mauve-subtle" />
                  <span className="text-mauve-subtle/70">
                    {existingShare.viewCount} {existingShare.viewCount === 1 ? "view" : "views"}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Since {existingShare.createdAt.toLocaleDateString()}
                  </Badge>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopyLink} className="flex-1">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRevokeLink}
                  disabled={loading}
                  className="flex-1 text-red-400 hover:text-red-300 border-red-500/50 hover:bg-red-500/10"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <EyeOff className="w-4 h-4 mr-2" />}
                  Revoke Access
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
