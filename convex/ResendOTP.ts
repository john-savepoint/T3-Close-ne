import Resend from "@auth/core/providers/resend"
import { Resend as ResendAPI } from "resend"
import { alphabet, generateRandomString } from "oslo/crypto"

export const ResendOTP = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"))
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey)
    const { error } = await resend.emails.send({
      from: "Z6Chat <chat@z6chat.savepoint.com.au>",
      to: [email],
      subject: `Sign in to Z6Chat`,
      text: "Your verification code is " + token,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Z6Chat!</h2>
          <p>Your verification code is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
            ${token}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    })

    if (error) {
      throw new Error("Could not send verification email")
    }
  },
})
