// Vercel Configuration Verification Script
// Run this in your browser console on your Vercel project page

console.log("=== VERCEL CONFIGURATION VERIFICATION ===")

// Method 1: Extract from current URL
const currentURL = window.location.href
console.log("Current URL:", currentURL)

if (currentURL.includes("vercel.com")) {
  const pathParts = window.location.pathname.split("/").filter(Boolean)
  console.log("URL Path Parts:", pathParts)

  if (pathParts.length >= 2) {
    console.log("🔍 DETECTED ORG ID:", pathParts[0])
    console.log("🔍 DETECTED PROJECT NAME:", pathParts[1])
  }
}

// Method 2: Check for project data in the page
try {
  if (window.__NEXT_DATA__ && window.__NEXT_DATA__.props) {
    const pageProps = window.__NEXT_DATA__.props.pageProps

    if (pageProps.project) {
      console.log("📊 PROJECT DATA FOUND:")
      console.log("Project ID:", pageProps.project.id)
      console.log("Project Name:", pageProps.project.name)
      console.log("Team/Org ID:", pageProps.project.accountId || pageProps.team?.id)
    }

    if (pageProps.team) {
      console.log("👥 TEAM DATA:")
      console.log("Team ID:", pageProps.team.id)
      console.log("Team Slug:", pageProps.team.slug)
    }
  }
} catch (e) {
  console.log("Could not extract project data from page")
}

// Method 3: Check localStorage for team info
try {
  const teamData = localStorage.getItem("team")
  if (teamData) {
    console.log("💾 TEAM FROM STORAGE:", JSON.parse(teamData))
  }
} catch (e) {
  console.log("No team data in localStorage")
}

// Method 4: Try to find project settings
const settingsLink = document.querySelector('a[href*="/settings"]')
if (settingsLink) {
  const settingsURL = settingsLink.href
  console.log("⚙️  Settings URL:", settingsURL)

  // Extract project ID from settings URL pattern: /team/project/settings
  const settingsMatch = settingsURL.match(/\/([^\/]+)\/([^\/]+)\/settings/)
  if (settingsMatch) {
    console.log("🔍 FROM SETTINGS - ORG:", settingsMatch[1])
    console.log("🔍 FROM SETTINGS - PROJECT:", settingsMatch[2])
  }
}

console.log("\n=== INSTRUCTIONS ===")
console.log("1. Copy the ORG ID and PROJECT values from above")
console.log("2. Go to your Vercel project Settings → General")
console.log("3. Scroll down to find the exact 'Project ID' (starts with prj_)")
console.log("4. Update your GitHub secrets with the correct values")

console.log("\n=== GITHUB SECRETS TO UPDATE ===")
console.log("Secret Name: VERCEL_ORG_ID")
console.log("Value: [ORG ID from above - usually username or team slug]")
console.log("")
console.log("Secret Name: VERCEL_PROJECT_ID")
console.log("Value: [Exact Project ID from Settings → General (starts with prj_)]")
