import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { ConvexClientProvider } from "@/components/convex-client-provider"
import { ClerkHeader } from "@/components/clerk-header"
import { AuthErrorBoundary } from "@/components/auth-error-boundary"

export const metadata: Metadata = {
  title: "Z6Chat - AI-Powered Conversations",
  description: "Chat with multiple AI models in a modern, feature-rich interface",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <AuthErrorBoundary>
        {/* @ts-expect-error Server Component */}
        <ClerkProvider dynamic>
          <html lang="en">
            <body className="bg-slate-950">
              <ClerkHeader />
              <ConvexClientProvider>{children}</ConvexClientProvider>
            </body>
          </html>
        </ClerkProvider>
      </AuthErrorBoundary>
    </>
  )
}
