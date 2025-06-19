"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  Zap, 
  ArrowLeft,
  Crown,
  Info,
  Download,
  Calendar,
  Shield
} from "lucide-react"
import Link from "next/link"

interface PricingPlan {
  name: string
  price: string
  interval: string
  features: string[]
  highlighted?: boolean
  current?: boolean
}

const plans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    interval: "forever",
    features: [
      "5 messages per day",
      "Access to GPT-4o Mini",
      "Basic chat features",
      "7-day chat history",
    ],
    current: true,
  },
  {
    name: "Pro",
    price: "$20",
    interval: "month",
    features: [
      "Unlimited messages",
      "Access to all AI models",
      "Priority queue for responses",
      "Unlimited chat history",
      "File uploads (25MB max)",
      "API access",
      "Email support",
    ],
    highlighted: true,
  },
  {
    name: "Pro Yearly",
    price: "$200",
    interval: "year",
    features: [
      "Everything in Pro",
      "Save $40 per year",
      "Priority support",
      "Early access to new features",
      "Custom model presets",
    ],
  },
]

export default function BillingPage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  // Mock usage data
  const usage = {
    messages: { current: 3, limit: 5 },
    storage: { current: 0, limit: 100 },
    apiCalls: { current: 0, limit: 0 },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
            <p className="text-mauve-subtle/70">
              Manage your subscription and billing preferences
            </p>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Button>
          </Link>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-mauve-dark/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
            <TabsTrigger value="history">Billing History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Current Plan */}
            <Card className="border-mauve-dark bg-mauve-surface/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Free Plan</h3>
                    <p className="text-sm text-mauve-subtle/70">
                      You're using the free tier with limited features
                    </p>
                  </div>
                  <Badge className="border-gray-500/50 bg-gray-500/20 text-gray-400">
                    Active
                  </Badge>
                </div>
                <Alert className="border-blue-500/20 bg-blue-500/10">
                  <Info className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300">
                    Upgrade to Pro to unlock unlimited messages, all AI models, and premium features.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card className="border-mauve-dark bg-mauve-surface/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Zap className="h-5 w-5 text-purple-400" />
                  Usage This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Messages */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-mauve-subtle/70">Messages</span>
                    <span className="text-foreground">
                      {usage.messages.current} / {usage.messages.limit}
                    </span>
                  </div>
                  <Progress 
                    value={(usage.messages.current / usage.messages.limit) * 100} 
                    className="h-2 bg-mauve-dark"
                  />
                  <p className="text-xs text-mauve-subtle/60">
                    Resets daily at midnight UTC
                  </p>
                </div>

                {/* Storage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-mauve-subtle/70">File Storage</span>
                    <span className="text-foreground">
                      {usage.storage.current} MB / {usage.storage.limit} MB
                    </span>
                  </div>
                  <Progress 
                    value={(usage.storage.current / usage.storage.limit) * 100} 
                    className="h-2 bg-mauve-dark"
                  />
                </div>

                {/* API Calls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-mauve-subtle/70">API Calls</span>
                    <span className="text-foreground">
                      {usage.apiCalls.current} / {usage.apiCalls.limit || "—"}
                    </span>
                  </div>
                  <Progress 
                    value={0} 
                    className="h-2 bg-mauve-dark"
                  />
                  <p className="text-xs text-mauve-subtle/60">
                    Upgrade to Pro for API access
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`border-mauve-dark bg-mauve-surface/50 transition-all ${
                    plan.highlighted
                      ? "ring-2 ring-purple-500/50"
                      : ""
                  } ${
                    selectedPlan === plan.name
                      ? "bg-mauve-accent/10"
                      : "hover:bg-mauve-dark/30"
                  }`}
                  onClick={() => setSelectedPlan(plan.name)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground">{plan.name}</CardTitle>
                      {plan.highlighted && (
                        <Badge className="border-purple-500/50 bg-purple-500/20 text-purple-400">
                          Most Popular
                        </Badge>
                      )}
                      {plan.current && (
                        <Badge className="border-green-500/50 bg-green-500/20 text-green-400">
                          Current
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-mauve-subtle/70">/{plan.interval}</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                          <span className="text-sm text-mauve-subtle/90">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${
                        plan.current
                          ? "bg-mauve-accent/20 hover:bg-mauve-accent/30"
                          : plan.highlighted
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            : "bg-mauve-accent/20 hover:bg-mauve-accent/30"
                      }`}
                      disabled={plan.current}
                    >
                      {plan.current ? "Current Plan" : "Upgrade"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Payment Security */}
            <Alert className="border-green-500/20 bg-green-500/10">
              <Shield className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                <strong>Secure Payment Processing</strong><br />
                All payments are processed securely through Stripe. We never store your credit card information.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="border-mauve-dark bg-mauve-surface/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-5 w-5" />
                  Billing History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-mauve-dark bg-mauve-surface/30 p-8 text-center">
                  <CreditCard className="mx-auto mb-4 h-8 w-8 text-mauve-subtle/50" />
                  <h4 className="mb-2 text-sm font-semibold text-foreground">
                    No billing history
                  </h4>
                  <p className="text-xs text-mauve-subtle/70">
                    You haven't made any payments yet. Upgrade to Pro to start.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Download Invoices */}
            <Card className="border-mauve-dark bg-mauve-surface/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Download className="h-5 w-5" />
                  Download Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-mauve-subtle/70">
                  Once you upgrade to a paid plan, you'll be able to download invoices for your records here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}