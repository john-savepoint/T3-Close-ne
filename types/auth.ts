import { Doc } from "@/convex/_generated/dataModel"

export type User = Doc<"users">

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthActions {
  signIn: (provider: string, credentials?: SignInCredentials | OAuthCredentials) => Promise<void>
  signOut: () => Promise<void>
}

export interface SignInCredentials {
  email: string
  password: string
  flow: "signIn" | "signUp"
  name?: string
}

export interface OAuthCredentials {
  provider: "github" | "google"
  redirectTo?: string
}

export interface UserUpdateData {
  name?: string
  image?: string
}

export interface AuthError {
  code: string
  message: string
  details?: string
}
