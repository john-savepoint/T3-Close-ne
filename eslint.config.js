import { FlatCompat } from "@eslint/eslintrc"
import { dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  // Use Next.js official config with TypeScript support
  ...compat.config({
    extends: ["next/core-web-vitals"],
    rules: {
      // Allow console.log in development
      "no-console": "off",
      // Make React hooks less strict during development
      "react-hooks/exhaustive-deps": "warn",
      // Disable overly strict rules for development speed
      "react/no-unescaped-entities": "off",
      "@next/next/no-html-link-for-pages": "warn",
    },
  }),

  // Global ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      ".convex/**",
      "convex/_generated/**",
    ],
  },
]

export default eslintConfig
