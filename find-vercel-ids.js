// Run this in your browser console while on your Vercel project page

// Method 1: From URL
console.log("Project ID from URL:", window.location.pathname.split("/")[3])

// Method 2: From page data
if (window.__NEXT_DATA__) {
  const data = JSON.parse(window.__NEXT_DATA__.props.pageProps.projectData || "{}")
  console.log("Org ID:", data.team?.id || "Check URL - might be personal account")
  console.log("Project ID:", data.project?.id)
}

// Method 3: Check localStorage
console.log("Team from storage:", localStorage.getItem("team"))
