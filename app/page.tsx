"use client"

import { Suspense } from "react"
import { Sidebar } from "@/components/sidebar"
import { MainContent } from "@/components/main-content"

function MainContentWrapper() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-8 mx-auto rounded-full bg-mauve-accent/20"></div>
          </div>
          <p className="text-mauve-subtle">Loading chat...</p>
        </div>
      </div>
    }>
      <MainContent />
    </Suspense>
  )
}

export default function HomePage() {
  return (
    <div>
      <div className="main-background"></div>
      <div className="relative flex h-screen min-h-screen w-full overflow-hidden bg-mauve-deep/50">
        <Sidebar />
        <MainContentWrapper />
      </div>
    </div>
  )
}
