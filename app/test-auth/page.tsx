import { auth } from "@clerk/nextjs/server"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"

export default async function TestAuthPage() {
  const { userId } = await auth()

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold">Auth Test Page</h1>

        <div className="space-y-6">
          <div className="rounded-lg bg-slate-800 p-4">
            <h2 className="mb-4 text-xl">Authentication Status</h2>
            {/* @ts-expect-error Server Component */}
            <SignedOut>
              <div className="space-y-4">
                <p className="text-red-400">❌ Not signed in</p>
                <SignInButton>
                  <button className="rounded bg-purple-600 px-4 py-2 hover:bg-purple-700">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </SignedOut>
            {/* @ts-expect-error Server Component */}
            <SignedIn>
              <div className="space-y-4">
                <p className="text-green-400">✅ Signed in</p>
                <p className="text-slate-300">User ID: {userId}</p>
                <UserButton />
              </div>
            </SignedIn>
          </div>

          <div className="rounded-lg bg-slate-800 p-4">
            <h2 className="mb-4 text-xl">Server-side Auth Check</h2>
            {userId ? (
              <div className="space-y-2">
                <p className="text-green-400">✅ Server auth successful</p>
                <p className="text-slate-300">User ID from server: {userId}</p>
              </div>
            ) : (
              <p className="text-red-400">❌ No server authentication</p>
            )}
          </div>

          <div className="text-center">
            <a href="/" className="text-purple-400 underline hover:text-purple-300">
              ← Back to main app
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
