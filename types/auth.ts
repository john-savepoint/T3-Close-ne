import { Doc } from "@/convex/_generated/dataModel";

export type User = Doc<"users">;

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  signIn: (provider: string, credentials?: any) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface SignInCredentials {
  email: string;
  password: string;
  flow: "signIn" | "signUp";
  name?: string;
}