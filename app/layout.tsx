import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { ConvexClientProvider } from "@/components/convex-client-provider"
import { AuthErrorBoundary } from "@/components/auth-error-boundary"
import { ThemeProvider } from "@/components/theme-provider"
import { validateClerkConfig } from "@/lib/clerk-config"

export const metadata: Metadata = {
  title: "Z6Chat - AI-Powered Conversations",
  description: "Chat with multiple AI models in a modern, feature-rich interface",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Validate Clerk configuration on app start
  try {
    validateClerkConfig()
  } catch (error) {
    console.error('Clerk configuration error:', error)
    // The error will be caught by AuthErrorBoundary
    throw error
  }

  return (
    <AuthErrorBoundary>
      {/* @ts-expect-error Server Component - React 19 compatibility */}
      <ClerkProvider>
        <html lang="en">
          <body className="bg-slate-950">
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              <ConvexClientProvider>{children}</ConvexClientProvider>
            </ThemeProvider>
          </body>
        </html>
      </ClerkProvider>
    </AuthErrorBoundary>
  )
}
