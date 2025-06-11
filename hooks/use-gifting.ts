"use client"

import { useState, useCallback } from "react"
import type { GiftCode, GiftPurchaseData, GiftRedemptionData, SubscriptionPlan } from "@/types/gifting"

// Mock subscription plans
const mockPlans: SubscriptionPlan[] = [
  {
    id: "pro_monthly",
    name: "Pro Monthly",
    description: "Full access to T3Chat Pro features",
    monthlyPrice: 20,
    yearlyPrice: 200,
    features: ["Unlimited chats", "Advanced AI models", "Priority support", "Export features"],
    isGiftable: true,
  },
  {
    id: "pro_yearly",
    name: "Pro Yearly",
    description: "Full access to T3Chat Pro features (12 months)",
    monthlyPrice: 20,
    yearlyPrice: 200,
    features: ["Unlimited chats", "Advanced AI models", "Priority support", "Export features", "2 months free"],
    isGiftable: true,
  },
]

// Mock gift codes for demonstration
const mockGiftCodes: GiftCode[] = [
  {
    id: "gift-1",
    redemptionCode: "GIFT-ABCD-1234-EFGH",
    planId: "pro_yearly",
    planName: "Pro Yearly",
    durationMonths: 12,
    status: "active",
    purchaserEmail: "john@example.com",
    recipientEmail: "alex@example.com",
    personalMessage: "Hope this helps with your coding projects!",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdAt: new Date("2024-01-15"),
    value: 200,
  },
]

export function useGifting() {
  const [giftCodes, setGiftCodes] = useState<GiftCode[]>(mockGiftCodes)
  const [loading, setLoading] = useState(false)

  const generateRedemptionCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const segments = []
    for (let i = 0; i < 4; i++) {
      let segment = ""
      for (let j = 0; j < 4; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      segments.push(segment)
    }
    return `GIFT-${segments.join("-")}`
  }

  const purchaseGift = useCallback(async (data: GiftPurchaseData): Promise<GiftCode> => {
    setLoading(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const plan = mockPlans.find((p) => p.id === data.planId)
      if (!plan) throw new Error("Invalid plan selected")

      const newGiftCode: GiftCode = {
        id: `gift-${Date.now()}`,
        redemptionCode: generateRedemptionCode(),
        planId: data.planId,
        planName: plan.name,
        durationMonths: data.planId.includes("yearly") ? 12 : 1,
        status: "active",
        purchaserEmail: data.purchaserEmail,
        recipientEmail: data.recipientEmail,
        personalMessage: data.personalMessage,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days to redeem
        createdAt: new Date(),
        value: data.planId.includes("yearly") ? plan.yearlyPrice : plan.monthlyPrice,
      }

      setGiftCodes((prev) => [...prev, newGiftCode])

      // In real implementation, this would:
      // 1. Process payment via Stripe
      // 2. Send gift email to recipient
      // 3. Send confirmation email to purchaser

      return newGiftCode
    } catch (error) {
      console.error("Failed to purchase gift:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const redeemGift = useCallback(
    async (data: GiftRedemptionData): Promise<GiftCode> => {
      setLoading(true)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const giftCode = giftCodes.find(
          (code) => code.redemptionCode === data.redemptionCode && code.status === "active",
        )

        if (!giftCode) {
          throw new Error("Invalid or already redeemed gift code")
        }

        if (new Date() > giftCode.expiresAt) {
          throw new Error("Gift code has expired")
        }

        // Update gift code status
        const updatedGiftCode = {
          ...giftCode,
          status: "redeemed" as const,
          redeemedByUserId: data.userId || "anonymous",
          redeemedAt: new Date(),
        }

        setGiftCodes((prev) => prev.map((code) => (code.id === giftCode.id ? updatedGiftCode : code)))

        return updatedGiftCode
      } catch (error) {
        console.error("Failed to redeem gift:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [giftCodes],
  )

  const getGiftCodeByCode = useCallback(
    (redemptionCode: string): GiftCode | null => {
      return giftCodes.find((code) => code.redemptionCode === redemptionCode) || null
    },
    [giftCodes],
  )

  const getAvailablePlans = useCallback((): SubscriptionPlan[] => {
    return mockPlans.filter((plan) => plan.isGiftable)
  }, [])

  return {
    giftCodes,
    loading,
    purchaseGift,
    redeemGift,
    getGiftCodeByCode,
    getAvailablePlans,
  }
}
