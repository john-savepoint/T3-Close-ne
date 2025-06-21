import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { ConvexClientProvider } from "@/components/convex-client-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { GlobalErrorBoundary } from "@/components/global-error-boundary"
import { TemporaryChatProvider } from "@/contexts/temporary-chat-context"
import { UIPreferencesProvider } from "@/components/ui-preferences-provider"

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
    <html lang="en">
      <body className="bg-slate-950">
        {/* @ts-expect-error Server Component - React 19 compatibility */}
        <ClerkProvider 
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          signInUrl="/login"
          signUpUrl="/signup"
          afterSignInUrl="/"
          afterSignUpUrl="/"
        >
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <ConvexClientProvider>
              <UIPreferencesProvider>
                <TemporaryChatProvider>
                  <GlobalErrorBoundary>
                    {children}
                  </GlobalErrorBoundary>
                </TemporaryChatProvider>
              </UIPreferencesProvider>
            </ConvexClientProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
