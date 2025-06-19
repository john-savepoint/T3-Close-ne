import { NextResponse } from "next/server"
import { generateGiftEmailHTML } from "@/lib/email-templates"

export async function POST(req: Request) {
  try {
    const { gift } = await req.json()

    // In production, this would use Resend or SendGrid
    // For now, log the email details
    console.log("Sending gift email:", {
      to: gift.recipientEmail,
      subject: "You've received a Z6Chat gift! 🎁",
      html: generateGiftEmailHTML(gift),
    })

    // Mock successful send
    return NextResponse.json({ success: true, messageId: "mock-message-id" })
  } catch (error) {
    console.error("Failed to send gift email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
