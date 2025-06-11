export interface GiftCode {
  id: string
  redemptionCode: string
  planId: string
  planName: string
  durationMonths: number
  status: "active" | "redeemed" | "expired"
  purchaserUserId?: string
  purchaserEmail?: string
  recipientEmail: string
  personalMessage?: string
  redeemedByUserId?: string
  redeemedAt?: Date
  expiresAt: Date
  createdAt: Date
  value: number // Price paid for the gift
}

export interface GiftPurchaseData {
  planId: string
  recipientEmail: string
  personalMessage?: string
  purchaserName?: string
  purchaserEmail?: string
}

export interface GiftRedemptionData {
  redemptionCode: string
  userId?: string // If user is logged in
}

export interface Team {
  id: string
  ownerUserId: string
  stripeSubscriptionId?: string
  name: string
  planType: "family" | "team"
  maxSeats: number
  usedSeats: number
  monthlyPrice: number
  status: "active" | "cancelled" | "past_due"
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  teamId: string
  userId: string
  userEmail: string
  userName: string
  role: "owner" | "member"
  joinedAt: Date
  status: "active" | "pending" | "removed"
}

export interface TeamInvitation {
  id: string
  teamId: string
  inviterUserId: string
  inviteeEmail: string
  invitationCode: string
  status: "pending" | "accepted" | "declined" | "expired"
  expiresAt: Date
  createdAt: Date
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  isGiftable: boolean
  maxTeamSize?: number
}
