import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { ConvexClientProvider } from "@/components/convex-client-provider"
import { AuthErrorBoundary } from "@/components/auth-error-boundary"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/toast-provider"

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
<<<<<<< HEAD
    <html lang="en">
      <body className="bg-slate-950">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
=======
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
>>>>>>> 528abe5 (feat(auth): complete Convex Auth to Clerk migration with production-ready implementation)
  )
}
