"use client"

import { DeepResearchTool } from "@/components/tools/deep-research-tool"

export default function DeepResearchPage() {
  const handleComplete = (result: any) => {
    console.log("Deep research completed:", result)
    // In a real implementation, this might navigate to a chat with the result
    // or show a success message
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <DeepResearchTool onComplete={handleComplete} />
    </div>
  )
}
