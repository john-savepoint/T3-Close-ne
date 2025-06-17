// Find the exact Vercel Project ID
// Run this on your Vercel project Settings page

console.log("=== FINDING PROJECT ID ===")

// Method 1: Look for project ID in the page data
try {
  if (window.__NEXT_DATA__ && window.__NEXT_DATA__.props && window.__NEXT_DATA__.props.pageProps) {
    const pageProps = window.__NEXT_DATA__.props.pageProps

    if (pageProps.project && pageProps.project.id) {
      console.log("✅ FOUND PROJECT ID:", pageProps.project.id)
      console.log("Project Name:", pageProps.project.name)
      console.log("Account ID:", pageProps.project.accountId)
    }
  }
} catch (e) {
  console.log("Could not find project data in page props")
}

// Method 2: Look for it in the DOM
const projectIdElements = [...document.querySelectorAll("*")].filter((el) => {
  const text = el.textContent || ""
  return text.includes("prj_") && text.length < 100
})

if (projectIdElements.length > 0) {
  console.log("🔍 Found elements containing project ID:")
  projectIdElements.forEach((el) => {
    const text = el.textContent.trim()
    const match = text.match(/prj_[a-zA-Z0-9]+/)
    if (match) {
      console.log("✅ PROJECT ID FOUND IN DOM:", match[0])
    }
  })
}

// Method 3: Check for the project ID in any script tags or data attributes
const scripts = document.querySelectorAll("script")
let foundInScript = false

scripts.forEach((script) => {
  if (script.textContent && script.textContent.includes("prj_")) {
    const matches = script.textContent.match(/prj_[a-zA-Z0-9]+/g)
    if (matches) {
      console.log("🔍 Found project IDs in script:", [...new Set(matches)])
      foundInScript = true
    }
  }
})

console.log("\n=== SUMMARY ===")
console.log("Based on your URL, your configuration should be:")
console.log("VERCEL_ORG_ID: john-savepoints-projects")
console.log("VERCEL_PROJECT_ID: [Look for the prj_ ID above]")
console.log("\nIf you don't see the project ID above:")
console.log("1. Make sure you're on the Settings → General page")
console.log("2. Scroll down to find 'Project ID' in the settings")
console.log("3. It will be a string starting with 'prj_'")
