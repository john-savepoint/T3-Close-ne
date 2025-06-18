import { convexAuth } from "@convex-dev/auth/server"
import GitHub from "@auth/core/providers/github"
import Google from "@auth/core/providers/google"
import { Password } from "@convex-dev/auth/providers/Password"

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
        }
      },
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async redirect({ redirectTo }) {
      // Allow redirects to the configured site URL and localhost
      const siteUrl = process.env.SITE_URL || "http://localhost:3000"

      if (redirectTo.startsWith(siteUrl) || redirectTo.startsWith("http://localhost:3000")) {
        return redirectTo
      }

      // Default redirect to home page
      return siteUrl
    },
  },
})
