# Convex Auth Setup Guide

## Creating a new project

To start a new project from scratch with Convex and Convex Auth, run:

```bash
npm create convex@latest
```

and choose `React (Vite)` and then `Convex Auth`.

## Adding to existing project

### Install the NPM library

```bash
npm install @convex-dev/auth @auth/core@0.37.0
```

This also installs `@auth/core`, which you will use during provider configuration later.

### Run the initialization command

```bash
npx @convex-dev/auth
```

This sets up your project for authenticating via the library.

### Add authentication tables to your schema

Convex Auth assumes you have several tables set up with specific indexes.

You can add these tables to your schema via the `authTables` export:

**convex/schema.ts:**

```typescript
import { defineSchema } from "convex/server"
import { authTables } from "@convex-dev/auth/server"

const schema = defineSchema({
  ...authTables,
  // Your other tables...
})

export default schema
```

### Set up the React provider (React/Vite)

Replace `ConvexProvider` from `convex/react` with `ConvexAuthProvider` from `@convex-dev/auth/react`:

**src/main.tsx:**

```typescript
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import App from "./App.tsx";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexAuthProvider client={convex}>
      <App />
    </ConvexAuthProvider>
  </React.StrictMode>,
);
```

The initial setup is done. Next you'll choose and configure authentication methods.

---

_Scraped using Firecrawl on June 18, 2025_
