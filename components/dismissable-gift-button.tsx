"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Gift, X, AlertTriangle } from "lucide-react"
import { GiftPurchaseModal } from "@/components/gift-purchase-modal"
import { useUIPreferences } from "@/hooks/use-ui-preferences"
import { useState } from "react"

export function DismissableGiftButton() {
  const { dismissElement } = useUIPreferences()
  const [isHovered, setIsHovered] = useState(false)
  const [showDismissModal, setShowDismissModal] = useState(false)

  const handleDismissClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDismissModal(true)
  }

  const handleConfirmDismiss = () => {
    dismissElement("giftProButton")
    setShowDismissModal(false)
  }

  return (
    <>
      <div 
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <GiftPurchaseModal
          trigger={
            <Button
              variant="outline"
              className="w-full justify-center border-pink-500/50 bg-gradient-to-r from-pink-500/10 to-purple-600/10 text-pink-400 hover:from-pink-500/20 hover:to-purple-600/20 relative"
            >
              <Gift className="mr-2 h-4 w-4" />
              Gift Z6Chat Pro
            </Button>
          }
        />
        {isHovered && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 bg-black/80 hover:bg-black/90 border border-mauve-dark"
            onClick={handleDismissClick}
            aria-label="Dismiss gift button"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <Dialog open={showDismissModal} onOpenChange={setShowDismissModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Hide Gift Button
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-mauve-subtle">
              This will permanently hide the Gift Z6Chat Pro button from your sidebar. 
              You can still access gifting options in the Billing section of Settings.
            </p>
            <p className="text-xs text-mauve-subtle/80">
              Note: This action cannot be undone and the button will not appear again.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDismissModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDismiss}
            >
              Hide Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}