import { NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

// Initialize Convex client without auth for public access
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Get the public chat data from Convex
    const publicChat = await convex.query(api.sharing.getPublicChatByToken, {
      token,
    })

    if (!publicChat) {
      return NextResponse.json({ error: "Shared chat not found or no longer active" }, { status: 404 })
    }

    // Increment view count (separate mutation)
    try {
      await convex.mutation(api.sharing.incrementViewCount, { token })
    } catch (error) {
      // Don't fail the request if view count increment fails
      console.warn("Failed to increment view count:", error)
    }

    return NextResponse.json(publicChat)
  } catch (error) {
    console.error("Error fetching shared chat:", error)
    return NextResponse.json(
      { error: "Failed to fetch shared chat" },
      { status: 500 }
    )
  }
}