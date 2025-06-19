/**
 * Clerk Configuration Validation
 * Ensures all required Clerk environment variables are present
 */

export function validateClerkConfig() {
  const requiredEnvVars = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  }

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Clerk environment variables: ${missingVars.join(', ')}\n` +
      'Please ensure these are set in your .env.local file:\n' +
      '- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...\n' +
      '- CLERK_SECRET_KEY=sk_test_...'
    )
  }

  // Validate format
  const publishableKey = requiredEnvVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!
  if (!publishableKey.startsWith('pk_')) {
    throw new Error('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with "pk_"')
  }

  // Only check secret key format in server environment
  if (typeof window === 'undefined') {
    const secretKey = requiredEnvVars.CLERK_SECRET_KEY!
    if (!secretKey.startsWith('sk_')) {
      throw new Error('CLERK_SECRET_KEY must start with "sk_"')
    }
  }

  return true
}

/**
 * Safe config getter with validation
 */
export function getClerkConfig() {
  validateClerkConfig()
  
  return {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    secretKey: process.env.CLERK_SECRET_KEY!,
  }
}