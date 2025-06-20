import type { Metadata } from "next"
import { PublicChatView } from "@/components/public-chat-view"

interface PageProps {
  params: Promise<{ token: string }>
}

// This would normally fetch from your API
async function getSharedChat(token: string) {
  // Simulate API call - in real implementation, this would be a server-side call
  // to your tRPC endpoint or direct database query
  await new Promise((resolve) => setTimeout(resolve, 100))

  return {
    token,
    title: "CSS Flexbox Debugging Session",
    createdAt: new Date("2024-01-20"),
    messageCount: 4,
    isActive: true,
    messages: [
      {
        id: "msg-1",
        type: "user" as const,
        content: "I'm having trouble with flexbox alignment. My items aren't centering properly.",
        timestamp: new Date("2024-01-20T10:00:00Z"),
      },
      {
        id: "msg-2",
        type: "assistant" as const,
        content:
          "I'd be happy to help you with flexbox alignment! The most common approach for centering items is to use `justify-content: center` for horizontal centering and `align-items: center` for vertical centering.\n\nHere's a basic example:\n\n```css\n.flex-container {\n  display: flex;\n  justify-content: center; /* Centers horizontally */\n  align-items: center;     /* Centers vertically */\n  height: 100vh;          /* Give it some height */\n}\n```\n\nCould you share your current CSS so I can help identify what might be causing the issue?",
        timestamp: new Date("2024-01-20T10:01:00Z"),
        model: "gpt-4o",
      },
      {
        id: "msg-3",
        type: "user" as const,
        content:
          "Here's my CSS:\n\n```css\n.container {\n  display: flex;\n  width: 100%;\n  height: 400px;\n  background: #f0f0f0;\n}\n\n.item {\n  width: 200px;\n  height: 100px;\n  background: #007bff;\n  color: white;\n  padding: 20px;\n}\n```\n\nThe items are just lined up on the left side.",
        timestamp: new Date("2024-01-20T10:02:00Z"),
      },
      {
        id: "msg-4",
        type: "assistant" as const,
        content:
          "I see the issue! You're missing the centering properties. Your flex container needs `justify-content` and `align-items` to center the items. Here's the corrected CSS:\n\n```css\n.container {\n  display: flex;\n  justify-content: center; /* This centers horizontally */\n  align-items: center;     /* This centers vertically */\n  width: 100%;\n  height: 400px;\n  background: #f0f0f0;\n}\n\n.item {\n  width: 200px;\n  height: 100px;\n  background: #007bff;\n  color: white;\n  padding: 20px;\n  box-sizing: border-box; /* Include padding in width/height */\n}\n```\n\nI also added `box-sizing: border-box` to prevent the padding from increasing the total size of your items.",
        timestamp: new Date("2024-01-20T10:03:00Z"),
        model: "gpt-4o",
      },
    ],
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const chat = await getSharedChat(token)

  if (!chat?.isActive) {
    return {
      title: "Shared Chat Not Found - Z6Chat",
      description: "This shared chat link is no longer active.",
    }
  }

  const firstUserMessage = chat.messages.find((m) => m.type === "user")?.content || ""
  const preview =
    firstUserMessage.length > 150 ? firstUserMessage.substring(0, 150) + "..." : firstUserMessage

  return {
    title: `${chat.title} - Shared on Z6Chat`,
    description: preview || "View this AI conversation shared on Z6Chat",
    openGraph: {
      title: chat.title,
      description: preview,
      type: "article",
      siteName: "Z6Chat",
    },
    twitter: {
      card: "summary",
      title: chat.title,
      description: preview,
    },
  }
}

export default async function SharedChatPage({ params }: PageProps) {
  const { token } = await params
  const chat = await getSharedChat(token)

  if (!chat?.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Chat Not Found</h1>
          <p className="text-mauve-subtle/70">
            This shared chat link is no longer active or doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  return <PublicChatView chat={chat} />
}
