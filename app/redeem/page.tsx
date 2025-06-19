"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Gift, Check, AlertTriangle, Loader2, Sparkles } from "lucide-react"
import { useGifting } from "@/hooks/use-gifting"
import Link from "next/link"

export default function RedeemGiftPage() {
  const { redeemGift, loading } = useGifting()
  const [redemptionCode, setRedemptionCode] = useState("")
  const [redemptionComplete, setRedemptionComplete] = useState(false)
  const [error, setError] = useState("")
  const [redeemedGift, setRedeemedGift] = useState<{
    durationMonths: number
    planName: string
  } | null>(null)

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!redemptionCode.trim()) {
      setError("Please enter a redemption code")
      return
    }

    try {
      const gift = await redeemGift({
        redemptionCode: redemptionCode.trim().toUpperCase(),
        userId: "demo-user", // Auth disabled for competition
      })
      setRedeemedGift(gift)
      setRedemptionComplete(true)
    } catch (error) {
      setError((error as Error).message || "Failed to redeem gift code")
    }
  }

  const formatRedemptionCode = (value: string) => {
    // Auto-format as user types: GIFT-ABCD-1234-EFGH
    const cleaned = value.replace(/[^A-Z0-9]/g, "")
    const segments = []
    for (let i = 0; i < cleaned.length; i += 4) {
      segments.push(cleaned.slice(i, i + 4))
    }
    return segments.join("-")
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRedemptionCode(e.target.value.toUpperCase())
    setRedemptionCode(formatted)
    setError("")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-mauve-deep via-mauve-dark to-black p-4">
      <div className="w-full max-w-md">
        {redemptionComplete && redeemedGift ? (
          /* Success State */
          <Card className="border-mauve-dark bg-mauve-surface/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-foreground">Gift Redeemed Successfully! 🎉</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <Alert className="border-green-500/20 bg-green-500/10">
                <Sparkles className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  <strong>Congratulations!</strong> You've received {redeemedGift.durationMonths}{" "}
                  months of T3Chat Pro access.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-sm text-mauve-subtle/70">
                  Your account has been upgraded to <strong>T3Chat Pro</strong>
                </p>
                <p className="text-xs text-mauve-subtle/60">
                  Plan: {redeemedGift.planName} • Duration: {redeemedGift.durationMonths} months
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link href="/">
                  <Button className="w-full bg-mauve-accent/20 hover:bg-mauve-accent/30">
                    Start Using T3Chat Pro
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" className="w-full">
                    View Account Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Redemption Form */
          <Card className="border-mauve-dark bg-mauve-surface/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/20">
                <Gift className="h-8 w-8 text-pink-400" />
              </div>
              <CardTitle className="text-foreground">Redeem Your T3Chat Gift</CardTitle>
              <p className="text-sm text-mauve-subtle/70">
                Enter your gift code below to activate your T3Chat Pro subscription
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRedeem} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="redemption-code">Gift Redemption Code</Label>
                  <Input
                    id="redemption-code"
                    placeholder="GIFT-ABCD-1234-EFGH"
                    value={redemptionCode}
                    onChange={handleCodeChange}
                    className="border-mauve-dark bg-mauve-dark/50 text-center font-mono text-lg tracking-wider"
                    maxLength={19} // GIFT-XXXX-XXXX-XXXX format
                  />
                  <p className="text-xs text-mauve-subtle/60">
                    Enter the code from your gift email (format: GIFT-XXXX-XXXX-XXXX)
                  </p>
                </div>

                {error && (
                  <Alert className="border-red-500/20 bg-red-500/10">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading || !redemptionCode.trim()}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redeeming Gift...
                    </>
                  ) : (
                    <>
                      <Gift className="mr-2 h-4 w-4" />
                      Redeem Gift
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 border-t border-mauve-dark pt-4">
                <p className="text-center text-xs text-mauve-subtle/60">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-mauve-accent hover:underline">
                    Sign up here
                  </Link>{" "}
                  and then redeem your gift.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
