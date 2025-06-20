"use client"

import { Button } from "@/components/ui/button"
import { Gift, X } from "lucide-react"
import { GiftPurchaseModal } from "@/components/gift-purchase-modal"
import { useUIPreferences } from "@/hooks/use-ui-preferences"
import { useState } from "react"

export function DismissableGiftButton() {
  const { dismissElement } = useUIPreferences()
  const [isHovered, setIsHovered] = useState(false)

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    dismissElement("giftProButton")
  }

  return (
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
            Gift T3Chat Pro
          </Button>
        }
      />
      {isHovered && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 bg-black/80 hover:bg-black/90 border border-mauve-dark"
          onClick={handleDismiss}
          aria-label="Dismiss gift button"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}