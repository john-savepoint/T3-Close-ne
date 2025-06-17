"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTools } from "@/hooks/use-tools"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Instagram, Twitter, Linkedin, Facebook, Send, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SocialMediaGeneratorPage() {
  const router = useRouter()
  const { generatePrompt } = useTools()
  const [platform, setPlatform] = useState<
    "twitter" | "instagram" | "linkedin" | "facebook" | "tiktok"
  >("instagram")
  const [audience, setAudience] = useState("")
  const [topic, setTopic] = useState("")
  const [callToAction, setCallToAction] = useState("")
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([])

  const handleGenerate = async () => {
    if (!audience || !topic) return

    setIsGenerating(true)

    try {
      // In a real implementation, this would call your AI service
      const prompt = generatePrompt("social-media-generator", {
        platform,
        audience,
        topic,
        callToAction,
        includeHashtags,
      })

      console.log("Generated prompt:", prompt)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Sample responses
      const samplePosts = {
        instagram: [
          `✨ Introducing our revolutionary Smart Headphones! 🎧\n\nDesigned for tech-savvy individuals who demand both style AND performance. These wireless wonders deliver crystal-clear sound while automatically adjusting to your environment.\n\nTap to learn more about how these headphones can transform your audio experience!\n\n#SmartAudio #TechLaunch #SoundRevolution #NextGenHeadphones`,

          `Sound that adapts to YOU. 🎧✨\n\nOur new smart headphones just dropped and they're changing the game! With adaptive noise cancellation and 24-hour battery life, they're perfect for your on-the-go lifestyle.\n\nDouble tap to experience sound like never before.\n\n#SoundEvolution #TechDrop #SmartHeadphones`,

          `The wait is OVER! 🙌\n\nAfter months of anticipation, our smart headphones have officially launched! Immersive sound, voice assistant integration, and a design that turns heads.\n\nWhich color will you choose? Black, Silver, or the limited edition Cosmic Blue?\n\n#NewLaunch #AudioTech #SmartSound #HeadphoneRevolution`,
        ],
        twitter: [
          `Just launched: Our Smart Headphones deliver studio-quality sound that adapts to your environment in real-time. The future of audio is here. #TechLaunch #SmartAudio`,

          `Noise cancellation that knows when you need to hear the world around you. Battery that lasts all day. Sound that moves you. Our new Smart Headphones are available now! #AudioTech`,

          `"These are the most intelligent headphones I've ever tested" - @TechReviewer\n\nExperience our new Smart Headphones today: [link] #SmartSound #NewLaunch`,
        ],
        linkedin: [
          `Excited to announce the launch of our new Smart Headphones, representing a significant breakthrough in audio technology.\n\nThese headphones feature our proprietary adaptive sound algorithm that analyzes your environment 4,000 times per second to deliver the optimal audio experience in any situation.\n\nFor professionals who move between quiet offices, busy commutes, and everything in between, these headphones automatically adjust to provide the perfect sound profile.\n\nLearn more about how we're revolutionizing the audio experience for professionals worldwide: [Link]\n\n#ProductLaunch #AudioTechnology #Innovation #SmartHeadphones`,

          `Proud to introduce our latest innovation: Smart Headphones designed for the modern professional.\n\nAfter 3 years of R&D and collaboration with audio engineers from across the industry, we've created headphones that don't just play sound—they understand it.\n\nKey features:\n• Adaptive noise cancellation that responds to your environment\n• 24-hour battery life for all-day productivity\n• AI-powered sound optimization\n• Seamless integration with productivity tools\n\nInterested in learning how these can enhance your work experience? Let's connect.\n\n#ProductInnovation #ProfessionalAudio #TechLaunch`,

          `Today marks a milestone for our company as we launch our Smart Headphones, bringing enterprise-grade audio technology to professionals everywhere.\n\nIn today's hybrid work environment, clear communication is more important than ever. Our Smart Headphones use a 6-microphone array and AI noise suppression to ensure you're heard perfectly on every call, whether you're in a quiet home office or a busy café.\n\nI'd like to thank our incredible engineering team who turned this vision into reality, and our beta testers who provided invaluable feedback throughout the development process.\n\nAvailable now for enterprise orders. #ProductLaunch #WorkTechnology #AudioInnovation`,
        ],
        facebook: [
          `🎧 NEW PRODUCT ALERT! 🎧\n\nWe're thrilled to introduce our Smart Headphones - the perfect blend of style, comfort, and cutting-edge technology!\n\nWhat makes them special?\n✅ Adaptive sound that adjusts to your environment\n✅ 24-hour battery life\n✅ Touch controls for easy navigation\n✅ Voice assistant compatible\n\nPerfect for music lovers, gamers, and anyone who appreciates premium audio quality!\n\nTag someone who needs to upgrade their headphone game! 👇\n\n#NewProduct #SmartHeadphones #MusicLovers`,

          `We've got some EXCITING NEWS! 🎉\n\nOur Smart Headphones are finally here, and they're going to change how you experience sound forever!\n\nImagine headphones that know when you're on a call, listening to music, or watching a movie - and automatically adjust to give you the perfect sound.\n\nEarly reviews are calling them "revolutionary" and "a game-changer" - and we can't wait for you to try them!\n\nNow available in our online store and select retailers. Link in comments!\n\n#ProductLaunch #SmartTech #AudioLovers`,

          `SOUND THAT ADAPTS TO YOU 🎧✨\n\nExcited to announce our Smart Headphones are now available!\n\nThese aren't just ordinary headphones. They learn your preferences, adjust to your environment, and deliver personalized sound that's perfect for YOU.\n\nSpecial launch offer: Get 15% off when you order this week + free shipping!\n\nWho's ready to experience the future of sound? Comment below!\n\n#NewLaunch #SmartHeadphones #AudioTechnology`,
        ],
        tiktok: [
          `POV: You just put on our new Smart Headphones for the first time 🤯🎧 #SmartAudio #TechTok #HeadphoneReview`,

          `The moment you realize your old headphones were living in 2010 💀 #SmartHeadphones #TechUpgrade #FYP`,

          `Testing our new Smart Headphones in 3 IMPOSSIBLE environments! You won't believe what happened in test #3 🔊 #ProductTest #AudioTech #HeadphoneChallenge`,
        ],
      }

      setGeneratedPosts(samplePosts[platform])
    } catch (error) {
      console.error("Error generating posts:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleContinueInChat = () => {
    // In a real implementation, this would create a new chat with the context
    router.push(`/chat/new`)
  }

  const getPlatformIcon = () => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-8 w-8" />
      case "twitter":
        return <Twitter className="h-8 w-8" />
      case "linkedin":
        return <Linkedin className="h-8 w-8" />
      case "facebook":
        return <Facebook className="h-8 w-8" />
      case "tiktok":
        return <span className="text-2xl">TikTok</span>
      default:
        return <Instagram className="h-8 w-8" />
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
          {getPlatformIcon()}
          <span>Social Media Generator</span>
        </h1>
        <p className="text-mauve-subtle/70">Create engaging posts for any platform and audience.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Platform</label>
                  <Select value={platform} onValueChange={(value: any) => setPlatform(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Target Audience</label>
                  <Input
                    placeholder="e.g., Tech-savvy young adults, Business professionals"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Topic or Product</label>
                  <Textarea
                    placeholder="What are you posting about? Be specific."
                    className="min-h-[100px]"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Call to Action (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Visit our website, Sign up now"
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hashtags"
                    checked={includeHashtags}
                    onCheckedChange={setIncludeHashtags}
                  />
                  <Label htmlFor="hashtags">Include relevant hashtags</Label>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isGenerating || !audience || !topic}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate Posts
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardContent className="flex h-full flex-col p-6">
              <h3 className="mb-4 font-medium">Generated Posts</h3>

              {generatedPosts.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-mauve-subtle/20 p-8">
                  <div className="text-center text-mauve-subtle/50">
                    {getPlatformIcon()}
                    <p className="mt-4">Your generated posts will appear here</p>
                  </div>
                </div>
              ) : (
                <>
                  <Tabs defaultValue="0" className="flex flex-1 flex-col">
                    <TabsList className="mb-4">
                      {generatedPosts.map((_, index) => (
                        <TabsTrigger key={index} value={index.toString()}>
                          Option {index + 1}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {generatedPosts.map((post, index) => (
                      <TabsContent
                        key={index}
                        value={index.toString()}
                        className="flex flex-1 flex-col"
                      >
                        <div className="mb-4 flex-1 overflow-auto whitespace-pre-wrap rounded-lg border border-mauve-subtle/20 p-4">
                          {post}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const activeTab = document.querySelector('[role="tabpanel"]:not([hidden])')
                        const activeContent = activeTab?.textContent || ""
                        navigator.clipboard.writeText(activeContent)
                      }}
                    >
                      Copy Selected
                    </Button>
                    <Button className="flex-1" onClick={handleContinueInChat}>
                      Continue in Chat
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
