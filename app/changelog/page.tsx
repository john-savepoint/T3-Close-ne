"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GitCommit, Star, Bug, Sparkles, Wrench, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ChangelogEntry {
  version: string
  date: string
  type: "major" | "minor" | "patch"
  changes: {
    category: "features" | "improvements" | "bugfixes" | "breaking"
    items: string[]
  }[]
}

const changelog: ChangelogEntry[] = [
  {
    version: "0.3.1",
    date: "2024-06-18",
    type: "minor",
    changes: [
      {
        category: "features",
        items: [
          "Real-time chat persistence with database integration",
          "Archive and trash functionality for chat management",
          "Time-based chat grouping in sidebar (Today, Yesterday, This Week, Older)",
          "Live badge counts for archived and trashed chats",
          "Production-ready TypeScript with ID conversion utilities",
        ],
      },
      {
        category: "improvements",
        items: [
          "Enhanced error boundaries with ChatErrorBoundary component",
          "Optimistic updates for immediate user feedback",
          "Professional loading states and empty state messaging",
          "Full-text search integration with persisted chat data",
        ],
      },
    ],
  },
  {
    version: "0.3.0",
    date: "2024-06-17",
    type: "minor",
    changes: [
      {
        category: "features",
        items: [
          "Multi-model chat support via OpenRouter API (50+ models)",
          "Comprehensive file upload system with drag & drop",
          "Convex authentication with email verification, GitHub, and Google OAuth",
          "Stream recovery system with Upstash Redis integration",
        ],
      },
      {
        category: "improvements",
        items: [
          "Complete dark theme UI with mauve color palette",
          "Enhanced model switcher with cost calculation",
          "40+ custom React hooks for state management",
          "Edge runtime optimization for faster performance",
        ],
      },
    ],
  },
  {
    version: "0.2.0",
    date: "2024-06-16",
    type: "minor",
    changes: [
      {
        category: "features",
        items: [
          "Initial Convex database setup with complete schema",
          "Basic chat interface with message streaming",
          "File validation system for attachments",
          "Team management dashboard",
        ],
      },
      {
        category: "improvements",
        items: [
          "TypeScript strict mode enabled across the project",
          "Comprehensive error handling setup",
          "Git workflow automation with Husky hooks",
          "Documentation structure established",
        ],
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2024-06-15",
    type: "minor",
    changes: [
      {
        category: "features",
        items: [
          "Initial project setup with Next.js 15 and React 19",
          "Basic routing structure established",
          "ShadCN UI component library integration",
          "Tailwind CSS configuration with custom design system",
        ],
      },
    ],
  },
]

const categoryConfig = {
  features: {
    icon: Sparkles,
    color: "border-green-500/50 bg-green-500/20 text-green-400",
    title: "New Features",
  },
  improvements: {
    icon: Star,
    color: "border-blue-500/50 bg-blue-500/20 text-blue-400",
    title: "Improvements",
  },
  bugfixes: {
    icon: Bug,
    color: "border-orange-500/50 bg-orange-500/20 text-orange-400",
    title: "Bug Fixes",
  },
  breaking: {
    icon: Wrench,
    color: "border-red-500/50 bg-red-500/20 text-red-400",
    title: "Breaking Changes",
  },
}

const versionTypeConfig = {
  major: "border-red-500/50 bg-red-500/20 text-red-400",
  minor: "border-purple-500/50 bg-purple-500/20 text-purple-400",
  patch: "border-green-500/50 bg-green-500/20 text-green-400",
}

export default function ChangelogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Changelog</h1>
            <p className="text-mauve-subtle/70">
              Track all updates, improvements, and fixes to Z6Chat
            </p>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Button>
          </Link>
        </div>

        {/* Version Timeline */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-8">
            {changelog.map((entry, index) => (
              <Card
                key={entry.version}
                className="border-mauve-dark bg-mauve-surface/50"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GitCommit className="h-5 w-5 text-mauve-accent" />
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        Version {entry.version}
                        <Badge
                          variant="outline"
                          className={versionTypeConfig[entry.type]}
                        >
                          {entry.type}
                        </Badge>
                      </CardTitle>
                    </div>
                    <span className="text-sm text-mauve-subtle/70">{entry.date}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {entry.changes.map((changeGroup) => {
                    const config = categoryConfig[changeGroup.category]
                    const Icon = config.icon
                    return (
                      <div key={changeGroup.category} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <h3 className="text-sm font-semibold text-foreground">
                            {config.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`text-xs ${config.color}`}
                          >
                            {changeGroup.items.length}
                          </Badge>
                        </div>
                        <ul className="ml-6 space-y-2">
                          {changeGroup.items.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className="text-sm text-mauve-subtle/90"
                            >
                              <span className="mr-2 text-mauve-subtle/50">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </CardContent>
                {index < changelog.length - 1 && (
                  <Separator className="mt-6 bg-mauve-dark/50" />
                )}
              </Card>
            ))}
          </div>

          {/* Coming Soon */}
          <Card className="mt-8 border-dashed border-mauve-dark bg-mauve-surface/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground/70">
                <Sparkles className="h-5 w-5" />
                Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="text-sm text-mauve-subtle/70">
                  <span className="mr-2 text-mauve-subtle/50">•</span>
                  Voice input and transcription
                </li>
                <li className="text-sm text-mauve-subtle/70">
                  <span className="mr-2 text-mauve-subtle/50">•</span>
                  Advanced prompt templates library
                </li>
                <li className="text-sm text-mauve-subtle/70">
                  <span className="mr-2 text-mauve-subtle/50">•</span>
                  Team collaboration features
                </li>
                <li className="text-sm text-mauve-subtle/70">
                  <span className="mr-2 text-mauve-subtle/50">•</span>
                  Mobile app for iOS and Android
                </li>
                <li className="text-sm text-mauve-subtle/70">
                  <span className="mr-2 text-mauve-subtle/50">•</span>
                  Plugin ecosystem for custom extensions
                </li>
              </ul>
            </CardContent>
          </Card>
        </ScrollArea>
      </div>
    </div>
  )
}