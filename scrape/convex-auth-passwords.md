# Convex Auth Password Configuration

## Overview

Password-based authentication requires users to remember (or store in a password manager) a secret password.

**Requirements for production**:

- Password reset flow (usually via email or text)
- Optional email verification during signup

## Email + Password Setup

### 1. Provider Configuration

Add the Password provider to your `convex/auth.ts`:

```typescript
import { Password } from "@convex-dev/auth/providers/Password"
import { convexAuth } from "@convex-dev/auth/server"

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
})
```

### 2. Sign-in Form Implementation

The Password provider assumes separate sign-up and sign-in flows via the `flow` field:

**src/SignIn.tsx:**

```typescript
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signUp" | "signIn">("signIn");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        void signIn("password", formData);
      }}
    >
      <input name="email" placeholder="Email" type="text" />
      <input name="password" placeholder="Password" type="password" />
      <input name="flow" type="hidden" value={step} />
      <button type="submit">{step === "signIn" ? "Sign in" : "Sign up"}</button>
      <button
        type="button"
        onClick={() => {
          setStep(step === "signIn" ? "signUp" : "signIn");
        }}
      >
        {step === "signIn" ? "Sign up instead" : "Sign in instead"}
      </button>
    </form>
  );
}
```

## Email Reset Setup

Password reset is a two-step flow:

1. User requests reset link/code sent to email
2. User provides code/link + new password

### 1. Create Email Provider

First install dependencies: `npm i resend oslo`

**convex/ResendOTPPasswordReset.ts:**

```typescript
import Resend from "@auth/core/providers/resend"
import { Resend as ResendAPI } from "resend"
import { alphabet, generateRandomString } from "oslo/crypto"

export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"))
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey)
    const { error } = await resend.emails.send({
      from: "My App <onboarding@resend.dev>",
      to: [email],
      subject: `Reset your password in My App`,
      text: "Your password reset code is " + token,
    })

    if (error) {
      throw new Error("Could not send")
    }
  },
})
```

### 2. Configure Password Provider with Reset

**convex/auth.ts:**

```typescript
import { Password } from "@convex-dev/auth/providers/Password"
import { convexAuth } from "@convex-dev/auth/server"
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset"

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({ reset: ResendOTPPasswordReset })],
})
```

### 3. Password Reset Form

**src/PasswordReset.tsx:**

```typescript
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function PasswordReset() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"forgot" | { email: string }>("forgot");

  return step === "forgot" ? (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        void signIn("password", formData).then(() =>
          setStep({ email: formData.get("email") as string })
        );
      }}
    >
      <input name="email" placeholder="Email" type="text" />
      <input name="flow" type="hidden" value="reset" />
      <button type="submit">Send code</button>
    </form>
  ) : (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        void signIn("password", formData);
      }}
    >
      <input name="code" placeholder="Code" type="text" />
      <input name="newPassword" placeholder="New password" type="password" />
      <input name="email" value={step.email} type="hidden" />
      <input name="flow" value="reset-verification" type="hidden" />
      <button type="submit">Continue</button>
      <button type="button" onClick={() => setStep("forgot")}>
        Cancel
      </button>
    </form>
  );
}
```

## Email Verification Setup

### 1. Create Email Verification Provider

**convex/ResendOTP.ts:**

```typescript
import Resend from "@auth/core/providers/resend"
import { Resend as ResendAPI } from "resend"
import { alphabet, generateRandomString } from "oslo/crypto"

export const ResendOTP = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"))
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey)
    const { error } = await resend.emails.send({
      from: "My App <onboarding@resend.dev>",
      to: [email],
      subject: `Sign in to My App`,
      text: "Your code is " + token,
    })

    if (error) {
      throw new Error("Could not send")
    }
  },
})
```

### 2. Configure Password Provider with Verification

**convex/auth.ts:**

```typescript
import { Password } from "@convex-dev/auth/providers/Password"
import { convexAuth } from "@convex-dev/auth/server"
import { ResendOTP } from "./ResendOTP"

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({ verify: ResendOTP })],
})
```

### 3. Sign-in Form with Verification

**src/SignIn.tsx:**

```typescript
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | "signUp" | { email: string }>("signIn");

  return step === "signIn" || step === "signUp" ? (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        void signIn("password", formData).then(() =>
          setStep({ email: formData.get("email") as string })
        );
      }}
    >
      <input name="email" placeholder="Email" type="text" />
      <input name="password" placeholder="Password" type="password" />
      <input name="flow" value={step} type="hidden" />
      <button type="submit">{step === "signIn" ? "Sign in" : "Sign up"}</button>
      <button
        type="button"
        onClick={() => {
          setStep(step === "signIn" ? "signUp" : "signIn");
        }}
      >
        {step === "signIn" ? "Sign up instead" : "Sign in instead"}
      </button>
    </form>
  ) : (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        void signIn("password", formData);
      }}
    >
      <input name="code" placeholder="Code" type="text" />
      <input name="flow" type="hidden" value="email-verification" />
      <input name="email" value={step.email} type="hidden" />
      <button type="submit">Continue</button>
      <button type="button" onClick={() => setStep("signIn")}>
        Cancel
      </button>
    </form>
  );
}
```

## Validation Customization

### Email Address Validation

Use the `profile` option with Zod validation:

```typescript
import { ConvexError } from "convex/values"
import { Password } from "@convex-dev/auth/providers/Password"
import { z } from "zod"

const ParamsSchema = z.object({
  email: z.string().email(),
})

export default Password({
  profile(params) {
    const { error, data } = ParamsSchema.safeParse(params)
    if (error) {
      throw new ConvexError(error.format())
    }
    return { email: data.email }
  },
})
```

### Password Validation

Use `validatePasswordRequirements`:

```typescript
import { ConvexError } from "convex/values"
import { Password } from "@convex-dev/auth/providers/Password"

export default Password({
  validatePasswordRequirements: (password: string) => {
    if (
      password.length < 8 ||
      !/\d/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password)
    ) {
      throw new ConvexError("Invalid password.")
    }
  },
})
```

### Custom User Information

Add additional fields to user documents:

```typescript
import { Password } from "@convex-dev/auth/providers/Password"
import { DataModel } from "./_generated/dataModel"

export default Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: params.name as string,
      role: params.role as string, // Custom field
    }
  },
})
```

**Important**: Parametrizing `Password` with your `DataModel` gives you strict type checking.

## Password Flow Values

- `"signIn"` - Sign in with existing account
- `"signUp"` - Create new account
- `"reset"` - Request password reset (step 1)
- `"reset-verification"` - Complete password reset (step 2)
- `"email-verification"` - Verify email during signup

---

_Scraped using Firecrawl on June 18, 2025_
