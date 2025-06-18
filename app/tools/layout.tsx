"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <AuthGuard>
      <div className="flex h-screen flex-col">
        <header className="border-b border-mauve-subtle/20 p-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => router.push("/new")}
          >
            <ChevronLeft size={16} />
            <span>Back to Tools</span>
          </Button>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </AuthGuard>
  )
}
