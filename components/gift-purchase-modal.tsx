"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Gift, Heart, Sparkles, Loader2, Check, CreditCard } from "lucide-react"
import { useGifting } from "@/hooks/use-gifting"
import type { GiftPurchaseData } from "@/types/gifting"

interface GiftPurchaseModalProps {
  trigger?: React.ReactNode
}

export function GiftPurchaseModal({ trigger }: GiftPurchaseModalProps) {
  const { purchaseGift, getAvailablePlans, loading } = useGifting()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [purchaseComplete, setPurchaseComplete] = useState(false)
  const [formData, setFormData] = useState<GiftPurchaseData>({
    planId: "",
    recipientEmail: "",
    personalMessage: "",
    purchaserName: "",
    purchaserEmail: "",
  })

  const plans = getAvailablePlans()
  const selectedPlan = plans.find((p) => p.id === selectedPlanId)

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId)
    setFormData((prev) => ({ ...prev, planId }))
  }

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPlan || !formData.recipientEmail || !formData.purchaserEmail) return

    try {
      await purchaseGift(formData)
      setPurchaseComplete(true)
    } catch (error) {
      console.error("Purchase failed:", error)
      alert("Purchase failed. Please try again.")
    }
  }

  const resetModal = () => {
    setSelectedPlanId("")
    setFormData({
      planId: "",
      recipientEmail: "",
      personalMessage: "",
      purchaserName: "",
      purchaserEmail: "",
    })
    setPurchaseComplete(false)
  }

  const handleClose = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setTimeout(resetModal, 300) // Reset after modal closes
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            <Gift className="mr-2 h-4 w-4" />
            Gift Z6Chat Pro
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-mauve-dark bg-mauve-surface">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Gift className="h-5 w-5 text-pink-400" />
            Gift Z6Chat Pro
          </DialogTitle>
        </DialogHeader>

        {purchaseComplete ? (
          /* Success State */
          <div className="space-y-6 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                Gift Sent Successfully! 🎉
              </h3>
              <p className="text-mauve-subtle/70">
                Your gift has been sent to <strong>{formData.recipientEmail}</strong>
              </p>
              <p className="mt-2 text-sm text-mauve-subtle/60">
                They'll receive an email with their redemption code and your personal message.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => handleClose(false)}
                className="bg-mauve-accent/20 hover:bg-mauve-accent/30"
              >
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetModal()
                  setPurchaseComplete(false)
                }}
              >
                <Gift className="mr-2 h-4 w-4" />
                Send Another Gift
              </Button>
            </div>
          </div>
        ) : (
          /* Purchase Flow */
          <div className="space-y-6">
            {/* Plan Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Choose a Gift Plan</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer transition-all ${
                      selectedPlanId === plan.id
                        ? "border-mauve-accent bg-mauve-accent/20"
                        : "border-mauve-dark bg-mauve-dark/30 hover:bg-mauve-dark/50"
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        {plan.name}
                        {plan.id.includes("yearly") && (
                          <Badge className="border-green-500/50 bg-green-500/20 text-green-400">
                            Popular
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-foreground">
                          ${plan.id.includes("yearly") ? plan.yearlyPrice : plan.monthlyPrice}
                        </div>
                        <p className="text-sm text-mauve-subtle/70">{plan.description}</p>
                        {plan.id.includes("yearly") && (
                          <div className="flex items-center gap-1 text-xs text-green-400">
                            <Sparkles className="h-3 w-3" />
                            Save $40 vs monthly
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {selectedPlan && (
              <form onSubmit={handlePurchase} className="space-y-4">
                {/* Recipient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Gift Details</h3>

                  <div className="space-y-2">
                    <Label htmlFor="recipient-email">Recipient's Email *</Label>
                    <Input
                      id="recipient-email"
                      type="email"
                      placeholder="friend@email.com"
                      value={formData.recipientEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, recipientEmail: e.target.value }))
                      }
                      className="border-mauve-dark bg-mauve-dark/50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="personal-message">Personal Message (Optional)</Label>
                    <Textarea
                      id="personal-message"
                      placeholder="Hope this helps with your projects! 🚀"
                      value={formData.personalMessage}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, personalMessage: e.target.value }))
                      }
                      className="min-h-[80px] border-mauve-dark bg-mauve-dark/50"
                      rows={3}
                    />
                    <p className="text-xs text-mauve-subtle/60">
                      This message will be included in the gift email.
                    </p>
                  </div>
                </div>

                {/* Purchaser Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Your Information</h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="purchaser-name">Your Name *</Label>
                      <Input
                        id="purchaser-name"
                        placeholder="Your name"
                        value={formData.purchaserName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, purchaserName: e.target.value }))
                        }
                        className="border-mauve-dark bg-mauve-dark/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaser-email">Your Email *</Label>
                      <Input
                        id="purchaser-email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.purchaserEmail}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, purchaserEmail: e.target.value }))
                        }
                        className="border-mauve-dark bg-mauve-dark/50"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <Alert className="border-blue-500/20 bg-blue-500/10">
                  <Heart className="h-4 w-4 text-pink-400" />
                  <AlertDescription className="text-blue-300">
                    <strong>Order Summary:</strong> {selectedPlan.name} gift for{" "}
                    <strong>
                      $
                      {selectedPlan.id.includes("yearly")
                        ? selectedPlan.yearlyPrice
                        : selectedPlan.monthlyPrice}
                    </strong>
                    <br />
                    <span className="text-sm">
                      Your recipient will receive{" "}
                      {selectedPlan.id.includes("yearly") ? "12 months" : "1 month"} of Z6Chat Pro
                      access.
                    </span>
                  </AlertDescription>
                </Alert>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || !formData.recipientEmail || !formData.purchaserEmail}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Gift...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Purchase Gift - $
                      {selectedPlan.id.includes("yearly")
                        ? selectedPlan.yearlyPrice
                        : selectedPlan.monthlyPrice}
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
