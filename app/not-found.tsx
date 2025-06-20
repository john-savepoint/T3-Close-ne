import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white">404</h1>
        <p className="mt-4 text-xl text-gray-400">Page not found</p>
        <p className="mt-2 text-gray-500">The page you're looking for doesn't exist.</p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Return Home</Button>
        </Link>
      </div>
    </div>
  )
}
