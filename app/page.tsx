"use client"

import { Sidebar } from "@/components/sidebar"
import { MainContent } from "@/components/main-content"

export default function HomePage() {
  return (
    <div>
      <div className="main-background"></div>
      <div className="relative flex h-screen min-h-screen w-full overflow-hidden bg-mauve-deep/50">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  )
}
