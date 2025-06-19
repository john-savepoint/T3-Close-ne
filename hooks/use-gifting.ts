"use client"

import { useState, useCallback } from "react"
import { useMutation, useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useToast } from "@/hooks/use-toast"
import type {
  GiftCode,
  GiftPurchaseData,
  GiftRedemptionData,
  SubscriptionPlan,
} from "@/types/gifting"

// Available subscription plans
const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "pro_monthly",
    name: "Pro Monthly",
    description: "Full access to Z6Chat Pro features",
    monthlyPrice: 20,
    yearlyPrice: 200,
    features: ["Unlimited chats", "Advanced AI models", "Priority support", "Export features"],
    isGiftable: true,
  },
  {
    id: "pro_yearly",
    name: "Pro Yearly",
    description: "Full access to Z6Chat Pro features (12 months)",
    monthlyPrice: 20,
    yearlyPrice: 200,
    features: [
      "Unlimited chats",
      "Advanced AI models",
      "Priority support",
      "Export features",
      "2 months free",
    ],
    isGiftable: true,
  },
]

export function useGifting() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Convex mutations and queries
  const purchaseGiftMutation = useMutation(api.gifts.purchaseGift)
  const redeemGiftMutation = useMutation(api.gifts.redeemGift)
  const userGiftHistory = useQuery(api.gifts.getUserGiftHistory, {
    paginationOpts: { numItems: 20, cursor: null }
  }) || { page: [], isDone: true, continueCursor: "" }
  const userReceivedGifts = useQuery(api.gifts.getUserReceivedGifts) || []
  const sendGiftEmailAction = useAction(api.gifts.sendGiftEmail)

  const purchaseGift = useCallback(
    async (data: GiftPurchaseData): Promise<GiftCode> => {
      setLoading(true)

      try {
        const plan = subscriptionPlans.find((p) => p.id === data.planId)
        if (!plan) throw new Error("Invalid plan selected")

        // In production, this would process payment via Stripe first
        // For now, we'll proceed with the gift creation

        const durationMonths = data.planId.includes("yearly") ? 12 : 1
        const value = data.planId.includes("yearly") ? plan.yearlyPrice : plan.monthlyPrice

        // Create gift in database
        const result = await purchaseGiftMutation({
          giftType: durationMonths === 12 ? "pro_year" : "pro_month",
          recipientEmail: data.recipientEmail,
          personalMessage: data.personalMessage,
          // stripePaymentIntentId would come from Stripe integration
        })

        // Send gift email
        try {
          await sendGiftEmailAction({ giftId: result.giftId as Id<"gifts"> })
        } catch (emailError) {
          console.error("Failed to send gift email:", emailError)
          // Don't fail the purchase if email fails
        }

        toast({
          title: "Gift purchased successfully!",
          description: `Gift code: ${result.claimToken}`,
        })

        // Return a GiftCode object matching the type interface
        return {
          id: result.giftId,
          redemptionCode: result.claimToken,
          planId: data.planId,
          planName: plan.name,
          durationMonths,
          status: "active",
          purchaserEmail: data.purchaserEmail,
          recipientEmail: data.recipientEmail,
          personalMessage: data.personalMessage,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          createdAt: new Date(),
          value,
        }
      } catch (error) {
        console.error("Failed to purchase gift:", error)
        toast({
          title: "Purchase failed",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [purchaseGiftMutation, sendGiftEmailAction, toast]
  )

  const redeemGift = useCallback(
    async (data: GiftRedemptionData): Promise<GiftCode> => {
      setLoading(true)

      try {
        const result = await redeemGiftMutation({
          claimToken: data.redemptionCode,
        })

        toast({
          title: "Gift redeemed successfully!",
          description: `Your Pro plan is now active!`,
        })

        // Return a simplified GiftCode object
        return {
          id: "redeemed",
          redemptionCode: data.redemptionCode,
          planId: "pro",
          planName: "Pro",
          durationMonths: result.durationMonths,
          status: "redeemed",
          purchaserEmail: "",
          recipientEmail: "",
          personalMessage: "",
          expiresAt: new Date(),
          createdAt: new Date(),
          value: 0,
          redeemedAt: new Date(),
          redeemedByUserId: data.userId,
        }
      } catch (error) {
        console.error("Failed to redeem gift:", error)
        toast({
          title: "Redemption failed",
          description:
            error instanceof Error ? error.message : "Please check your code and try again",
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [redeemGiftMutation, toast]
  )

  const validateGiftCode = useCallback(
    async (
      redemptionCode: string
    ): Promise<{ valid: boolean; error?: string; gift?: Partial<GiftCode> }> => {
      // For now, we'll do basic validation on the format
      // In production, this would be a separate API call
      if (!redemptionCode || redemptionCode.length !== 15) {
        return { valid: false, error: "Invalid code format" }
      }

      const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
      if (!pattern.test(redemptionCode)) {
        return { valid: false, error: "Invalid code format" }
      }

      // You could make this an action or separate API endpoint
      return { valid: true }
    },
    []
  )

  const getAvailablePlans = useCallback((): SubscriptionPlan[] => {
    return subscriptionPlans.filter((plan) => plan.isGiftable)
  }, [])

  // Convert gift history to GiftCode format  
  const giftCodes: GiftCode[] = userGiftHistory.page.map((gift: any) => ({
    id: gift.id,
    redemptionCode: gift.claimToken,
    planId: gift.giftType === "pro_year" ? "pro_yearly" : "pro_monthly",
    planName: gift.giftType === "pro_year" ? "Pro Yearly" : "Pro Monthly",
    durationMonths: gift.giftType === "pro_year" ? 12 : 1,
    status: gift.status,
    purchaserEmail: "", // Not available from query
    recipientEmail: gift.recipientEmail,
    personalMessage: "", // Not returned for privacy
    expiresAt: new Date(), // Not returned from query
    createdAt: new Date(gift.createdAt),
    value: gift.amount,
    redeemedAt: gift.redeemedAt ? new Date(gift.redeemedAt) : undefined,
  }))

  return {
    giftCodes,
    userReceivedGifts,
    loading,
    purchaseGift,
    redeemGift,
    validateGiftCode,
    getAvailablePlans,
  }
}
