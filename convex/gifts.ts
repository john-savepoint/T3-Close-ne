import { v } from "convex/values"
import { mutation, query, action } from "./_generated/server"
import { Id } from "./_generated/dataModel"

// Generate a unique claim token for gifts
function generateClaimToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let token = ""
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) token += "-"
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  return token
}

// Purchase a gift subscription
export const purchaseGift = mutation({
  args: {
    giftType: v.union(v.literal("pro_month"), v.literal("pro_year")),
    recipientEmail: v.string(),
    personalMessage: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Must be logged in to purchase a gift")
    }

    // Get the user making the purchase
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    // Generate unique claim token
    let claimToken: string
    let tokenExists = true

    while (tokenExists) {
      claimToken = generateClaimToken()
      const existingGift = await ctx.db
        .query("gifts")
        .withIndex("by_claim_token", (q) => q.eq("claimToken", claimToken))
        .first()
      tokenExists = !!existingGift
    }

    // Calculate amount based on gift type
    const amount = args.giftType === "pro_year" ? 200 : 20

    const giftId = await ctx.db.insert("gifts", {
      fromUserId: user._id,
      toEmail: args.recipientEmail,
      giftType: args.giftType,
      amount,
      message: args.personalMessage,
      status: "pending",
      claimToken: claimToken!,
      purchasedAt: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year expiry
    })

    return { giftId, claimToken: claimToken! }
  },
})

// Redeem a gift code
export const redeemGift = mutation({
  args: {
    claimToken: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Must be logged in to redeem a gift")
    }

    // Find the gift by claim token
    const gift = await ctx.db
      .query("gifts")
      .withIndex("by_claim_token", (q) => q.eq("claimToken", args.claimToken))
      .first()

    if (!gift) {
      throw new Error("Invalid gift code")
    }

    // Check if gift is still valid
    if (gift.status !== "pending") {
      throw new Error(`This gift has already been ${gift.status}`)
    }

    // Check if gift has expired
    if (gift.expiresAt < Date.now()) {
      await ctx.db.patch(gift._id, { status: "expired" })
      throw new Error("This gift has expired")
    }

    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    // Update user's plan
    const durationMonths = gift.giftType === "pro_year" ? 12 : 1

    await ctx.db.patch(user._id, {
      plan: "pro",
    })

    // Mark gift as claimed
    await ctx.db.patch(gift._id, {
      status: "claimed",
      toUserId: user._id,
      claimedAt: Date.now(),
    })

    return {
      success: true,
      plan: "pro",
      durationMonths,
    }
  },
})

// Validate a gift code (check if it's valid without redeeming)
export const validateGiftCode = query({
  args: {
    claimToken: v.string(),
  },
  handler: async (ctx, args) => {
    const gift = await ctx.db
      .query("gifts")
      .withIndex("by_claim_token", (q) => q.eq("claimToken", args.claimToken))
      .first()

    if (!gift) {
      return { valid: false, error: "Invalid gift code" }
    }

    if (gift.status !== "pending") {
      return { valid: false, error: `This gift has already been ${gift.status}` }
    }

    if (gift.expiresAt < Date.now()) {
      return { valid: false, error: "This gift has expired" }
    }

    return {
      valid: true,
      giftType: gift.giftType,
      message: gift.message,
    }
  },
})

// Get user's gift history (purchased gifts)
export const getUserGiftHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user) {
      return []
    }

    const gifts = await ctx.db
      .query("gifts")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", user._id))
      .order("desc")
      .collect()

    return gifts.map((gift) => ({
      id: gift._id,
      claimToken: gift.claimToken,
      giftType: gift.giftType,
      amount: gift.amount,
      recipientEmail: gift.toEmail,
      status: gift.status,
      createdAt: new Date(gift.purchasedAt).toISOString(),
      redeemedAt: gift.claimedAt ? new Date(gift.claimedAt).toISOString() : undefined,
    }))
  },
})

// Get user's received gifts
export const getUserReceivedGifts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user) {
      return []
    }

    const gifts = await ctx.db
      .query("gifts")
      .withIndex("by_to_user", (q) => q.eq("toUserId", user._id))
      .order("desc")
      .collect()

    return gifts.map((gift) => ({
      id: gift._id,
      giftType: gift.giftType,
      amount: gift.amount,
      message: gift.message,
      claimedAt: gift.claimedAt ? new Date(gift.claimedAt).toISOString() : undefined,
    }))
  },
})

// Send gift email notification (action that can call external APIs)
export const sendGiftEmail = action({
  args: {
    giftId: v.id("gifts"),
  },
  handler: async (ctx, args) => {
    // In a real action, we would use ctx.runQuery with api.gifts.getGiftById
    // For now, we'll just log the gift ID
    console.log("Would send email for gift:", args.giftId)

    // In production, this would:
    // 1. Query the gift details
    // 2. Call the email API (Resend/SendGrid)
    // 3. Update gift status if needed

    return { success: true }
  },
})
