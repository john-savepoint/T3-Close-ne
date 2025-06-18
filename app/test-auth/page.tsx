import { auth } from "@clerk/nextjs/server"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"

export default async function TestAuthPage() {
  const { userId } = await auth()
  
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Auth Test Page</h1>
        
        <div className="space-y-6">
          <div className="p-4 bg-slate-800 rounded-lg">
            <h2 className="text-xl mb-4">Authentication Status</h2>
            {/* @ts-expect-error Server Component */}
            <SignedOut>
              <div className="space-y-4">
                <p className="text-red-400">❌ Not signed in</p>
                <SignInButton>
                  <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded">
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
          
          <div className="p-4 bg-slate-800 rounded-lg">
            <h2 className="text-xl mb-4">Server-side Auth Check</h2>
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
            <a 
              href="/"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              ← Back to main app
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}