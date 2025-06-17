# Vercel Setup Guide

## Finding Your Vercel Org ID

The deployment is failing because `VERCEL_ORG_ID` is missing. Here's how to find it:

### Method 1: Vercel Dashboard URL

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Look at the URL - it will be one of these formats:
   - Personal account: `https://vercel.com/[your-username]`
   - Team account: `https://vercel.com/[team-name]`

### Method 2: Vercel Account Settings

1. Click your profile picture in Vercel dashboard
2. Go to "Settings"
3. If you have teams, you'll see a "Teams" section
4. The Org ID appears in the URL when you click on a team

### Method 3: Use the Browser Console

1. Go to your Vercel project page
2. Open browser DevTools (F12)
3. Paste this in the console:

```javascript
// This will extract your Org ID from the page
if (window.location.hostname === "vercel.com") {
  const pathParts = window.location.pathname.split("/")
  console.log("Team/Org from URL:", pathParts[1])

  // For personal accounts, the org ID might be your username
  // For team accounts, it's the team slug
}
```

### Method 4: Vercel CLI (if installed)

```bash
vercel whoami
vercel team ls
```

## What You Need to Add to GitHub Secrets

Based on the error, you need to add:

| Secret Name         | Where to Find It           | Required                  |
| ------------------- | -------------------------- | ------------------------- |
| `VERCEL_TOKEN`      | Vercel Settings → Tokens   | ✅ (You likely have this) |
| `VERCEL_ORG_ID`     | See methods above          | ✅ (MISSING)              |
| `VERCEL_PROJECT_ID` | Project Settings → General | ✅ (You have this)        |

## Common Values for VERCEL_ORG_ID

- **Personal Account**: Usually your Vercel username
- **Team Account**: The team slug from the URL

## Next Steps

1. Find your `VERCEL_ORG_ID` using one of the methods above
2. Go to your GitHub repository → Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add:
   - Name: `VERCEL_ORG_ID`
   - Value: [Your org ID from above]
5. Click "Add secret"

## Verify Your Setup

After adding the secret, you can verify all secrets are set by checking the Actions tab. The deployment should show all three Vercel secrets as `***` in the logs.

## Trigger a New Deployment

Once you've added `VERCEL_ORG_ID`, you can:

1. Push any small change to trigger a new deployment
2. Or go to Actions → Deploy → Run workflow

## Troubleshooting

If you're still having issues:

1. Double-check the secret names match exactly (case-sensitive)
2. Ensure there are no extra spaces in the secret values
3. For personal accounts, try your Vercel username as the org ID
4. Check if your Vercel project is under a team or personal account
