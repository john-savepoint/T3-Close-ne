"use client"

import { Sidebar } from "@/components/sidebar"
import { MainContent } from "@/components/main-content"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function HomePage() {
  return (
    <AuthGuard>
      <div className="main-background"></div>
      <div className="relative flex h-screen min-h-screen w-full overflow-hidden bg-mauve-deep/50">
        <Sidebar />
        <MainContent />
      </div>
    </AuthGuard>
  )
}
