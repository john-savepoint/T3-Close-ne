"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface SocialMediaToolProps {
  onComplete: (result: { content: string }) => void
}

export function SocialMediaTool({ onComplete }: SocialMediaToolProps) {
  const [platform, setPlatform] = useState("twitter")
  const [topic, setTopic] = useState("")
  const [audience, setAudience] = useState("")
  const [callToAction, setCallToAction] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [posts, setPosts] = useState<string[]>([])

  const handleGenerate = async () => {
    if (!topic) return

    setIsLoading(true)

    try {
      // In a real application, this would make an API call
      // For this example, we'll simulate a response after a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock generated posts
      let generatedPosts: string[] = []

      if (platform === "twitter") {
        generatedPosts = [
          `Just tried the new AI-powered workflow tools from @TechCorp and I'm blown away! 🤯 The time-saving automation alone doubled my productivity. #ProductivityHacks #AI #WorkflowAutomation`,
          `Exciting news! @TechCorp's latest AI tools have transformed how our team collaborates. From concept to delivery in half the time. Anyone else experiencing these game-changing results? #FutureOfWork #AI`,
          `The smartest investment we made this quarter? @TechCorp's workflow tools. ROI was visible within DAYS, not months. If you're still using manual processes, you're falling behind. #BusinessTools #Productivity`,
        ]
      } else if (platform === "instagram") {
        generatedPosts = [
          `✨ Transforming the way we work, one AI solution at a time ✨\n\nWe've integrated @techcorp's new workflow tools into our daily operations, and the results have been nothing short of magical. Our team is saving 20+ hours weekly, allowing us to focus on what truly matters: creativity and innovation.\n\n#AITools #WorkflowAutomation #ProductivityHacks #FutureOfWork #TechInnovation`,
          `The future of work isn't coming—it's already here. 🚀\n\nSwipe to see the before/after of our project timelines since implementing @techcorp's revolutionary AI workflow tools. The difference is striking, and our clients are noticing!\n\n#WorkSmarter #AIRevolution #BusinessTransformation #ProductivityTools #TechSolutions`,
          `Mondays used to overwhelm us. Now they excite us. ☕️💻✨\n\nThe difference? @techcorp's intelligent workflow assistant handling our repetitive tasks while we focus on strategic thinking. Sometimes the best team member isn't human!\n\n#MondayMotivation #AIAssistant #WorkflowAutomation #BusinessTools #WorkLifeBalance`,
        ]
      } else if (platform === "linkedin") {
        generatedPosts = [
          `I'm excited to share that our implementation of TechCorp's AI-powered workflow tools has resulted in a 37% increase in team productivity in just the first month.\n\nThe integration was seamless, and the learning curve was minimal thanks to their exceptional customer success team. The ROI metrics have already exceeded our projections for the entire quarter.\n\nKey benefits we've experienced:\n• 15 hours saved weekly per team member on administrative tasks\n• 42% reduction in project delivery timelines\n• 28% improvement in client satisfaction scores\n\nI'd highly recommend exploring these solutions if your organization is looking to optimize operations while empowering your team to focus on high-value work.\n\n#ProductivityTools #AIImplementation #WorkflowOptimization #DigitalTransformation`,
          `After evaluating numerous workflow automation platforms over the past year, our organization finally implemented TechCorp's enterprise solution last quarter. The results have exceeded our expectations in every metric we track.\n\nParticularly impressive is how the AI adapts to our specific industry needs without requiring custom development. The predictive analytics feature has already identified three major efficiency opportunities that weren't on our radar.\n\nFor those hesitant about AI implementation, I can confirm that adoption has been enthusiastic across departments. The most common feedback from our team: "Why didn't we do this sooner?"\n\nI'm happy to connect with anyone considering similar solutions to share more specific ROI data and implementation learnings.\n\n#AIAdoption #EnterpriseAI #WorkflowAutomation #DigitalTransformation #LeadershipInsights`,
          `Today marks 100 days since we rolled out TechCorp's workflow automation platform across our organization of 500+ employees. I wanted to share some tangible results and key learnings:\n\nMeasurable outcomes:\n✅ $1.2M in projected annual savings from reduced manual processing\n✅ Customer response times improved by 64%\n✅ Employee satisfaction scores up 22% in departments using the platform\n\nImplementation lessons:\n1. Executive sponsorship was crucial for cross-departmental adoption\n2. Starting with a pilot group created internal champions\n3. Custom training by department yielded better results than general sessions\n\nThe most valuable insight: this technology isn't replacing jobs—it's eliminating the tasks our team members disliked most, allowing them to apply their expertise to more meaningful work.\n\nWould love to connect with others leveraging AI for operational excellence.\n\n#OperationalExcellence #AIImplementation #DigitalTransformation #WorkplaceFuture`,
        ]
      }

      setPosts(generatedPosts)
      setIsLoading(false)
    } catch (error) {
      console.error("Error generating posts:", error)
      setIsLoading(false)
    }
  }

  const handleSelectPost = (post: string) => {
    // Format with platform context
    const platformContext =
      platform === "twitter" ? "Twitter" : platform === "instagram" ? "Instagram" : "LinkedIn"

    const contentWithContext = `**${platformContext} Post:**\n\n${post}`
    onComplete({ content: contentWithContext })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Topic/Product</label>
            <Input
              placeholder="What are you posting about?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Target Audience</label>
            <Input
              placeholder="Who is your audience?"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Call to Action (Optional)</label>
            <Input
              placeholder="What action should readers take?"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
            />
          </div>

          <Button onClick={handleGenerate} disabled={!topic || isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              "Generate Posts"
            )}
          </Button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Generated Posts</label>

          {posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post, index) => (
                <Card key={index} className="bg-mauve-surface/30 p-3">
                  <p className="mb-2 whitespace-pre-line text-sm">{post}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSelectPost(post)}
                  >
                    Use This Post
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center rounded-md border bg-mauve-surface/10 text-sm text-mauve-subtle/70">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="mb-2 h-5 w-5 animate-spin" />
                  <p>Crafting your social posts...</p>
                </div>
              ) : (
                "Generated posts will appear here"
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
