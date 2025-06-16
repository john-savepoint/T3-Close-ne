"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Trash2, Menu, EyeOff, Plus, Gift, Archive } from "lucide-react"
import { T3Logo } from "@/components/t3-logo"
import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { ProjectList } from "@/components/project-list"
import { useProjects } from "@/hooks/use-projects"
import { useTemporaryChat } from "@/hooks/use-temporary-chat"
import { GiftPurchaseModal } from "@/components/gift-purchase-modal"
import { EnhancedChatItem } from "@/components/enhanced-chat-item"
import { useChatLifecycle } from "@/hooks/use-chat-lifecycle"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

// Mock data for standalone chats (not in projects)
const pinnedThreads = [
  {
    id: "1",
    title: "Gmail Chrome Extension Project Brief: Labeling...",
    timestamp: "2 hours ago",
    status: "active" as const,
    statusChangedAt: new Date(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Next.js SaaS website and mobile project brief...",
    timestamp: "Yesterday",
    status: "active" as const,
    statusChangedAt: new Date(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
const todayThreads = [
  {
    id: "3",
    title: "Free Adobe Acrobat Reader Alternative",
    timestamp: "Today",
    status: "active" as const,
    statusChangedAt: new Date(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    title: "T3Chat Feature Requests Documentation Project",
    timestamp: "Today",
    status: "active" as const,
    statusChangedAt: new Date(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    title: "Removing a threaded Shimano chain pin",
    parent: true,
    timestamp: "Today",
    status: "active" as const,
    statusChangedAt: new Date(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
const yesterdayThreads = [
  {
    id: "6",
    title: "How to optimize React performance",
    timestamp: "Yesterday",
    status: "active" as const,
    statusChangedAt: new Date(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    title: "Best practices for API design",
    timestamp: "Yesterday",
    status: "active" as const,
    statusChangedAt: new Date(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Thread Item Component
const ThreadItem = ({ chat, parent = false, isActive = false }) => {
  const { moveToTrash, moveToArchive } = useChatLifecycle()

  return (
    <EnhancedChatItem
      chat={chat}
      isActive={isActive}
      onMoveToTrash={() => moveToTrash(chat.id)}
      onMoveToArchive={() => moveToArchive(chat.id)}
      onRestore={() => {}}
      onDeletePermanently={() => {}}
      showParentIcon={parent}
    />
  )
}

// Group Label Component
const GroupLabel = ({ label }) => (
  <div className="px-3 py-2 text-xs font-semibold text-mauve-accent uppercase tracking-wider">{label}</div>
)

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()
  const [searchQuery, setSearchQuery] = useState("")
  const { activeProject } = useProjects()
  const { startTemporaryChat, isTemporaryMode } = useTemporaryChat()
  const { archivedChats, trashedChats } = useChatLifecycle()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault()
        // Open model switcher
      }
      if (e.ctrlKey && e.key === "'") {
        e.preventDefault()
        // Quick model switch
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "T") {
        e.preventDefault()
        startTemporaryChat()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [startTemporaryChat])

  // For mobile: collapsed sidebar unless opened
  // For desktop: always show sidebar
  const showSidebar = !isMobile || isOpen

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-mauve-surface/50 text-mauve-bright"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {showSidebar && (
        <aside
          className={`${isMobile ? "fixed inset-y-0 left-0 z-40 w-64" : "w-64 flex-shrink-0"} bg-black/30 backdrop-blur-sm border-r border-mauve-dark p-2 flex flex-col transition-all duration-300 ease-in-out`}
        >
          {/* Header */}
          <div className="flex flex-col space-y-2 pb-2">
            <div className="px-2 py-1">
              <T3Logo className="h-6 text-foreground" />
            </div>

            {/* Chat Creation Buttons */}
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-center bg-mauve-accent/20 hover:bg-mauve-accent/30 text-mauve-bright font-semibold"
                disabled={isTemporaryMode}
              >
                <Plus className="w-4 h-4 mr-2" />
                {activeProject ? `New Chat in ${activeProject.name}` : "New Chat"}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-center bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/50"
                onClick={startTemporaryChat}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Temporary Chat
              </Button>

              <GiftPurchaseModal
                trigger={
                  <Button
                    variant="outline"
                    className="w-full justify-center bg-gradient-to-r from-pink-500/10 to-purple-600/10 hover:from-pink-500/20 hover:to-purple-600/20 text-pink-400 border-pink-500/50"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Gift T3Chat Pro
                  </Button>
                }
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mauve-subtle" />
              <Input
                placeholder="Search your threads..."
                className="pl-9 bg-black/20 border-mauve-dark focus-visible:ring-mauve-accent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 -mr-2 pr-2">
            <nav className="flex flex-col gap-1 py-2">
              {/* Projects Section */}
              <ProjectList
                onChatSelect={(chatId, projectId) => {
                  console.log("Selected chat:", chatId, "in project:", projectId)
                }}
              />

              {/* Standalone Chats */}
              <div className="mt-4">
                <GroupLabel label="Pinned" />
                {pinnedThreads.map((thread) => (
                  <ThreadItem key={thread.id} chat={thread} />
                ))}

                <GroupLabel label="Today" />
                {todayThreads.map((thread) => (
                  <ThreadItem key={thread.id} chat={thread} parent={thread.parent} />
                ))}

                <GroupLabel label="Yesterday" />
                {yesterdayThreads.map((thread) => (
                  <ThreadItem key={thread.id} chat={thread} />
                ))}
              </div>
            </nav>
          </ScrollArea>

          {/* Archive & Trash Navigation */}
          <div className="mt-auto pt-2 border-t border-mauve-dark space-y-2">
            <div className="space-y-1">
              <Link href="/archive">
                <Button variant="ghost" className="w-full justify-start text-mauve-subtle hover:text-mauve-bright">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                  {archivedChats.length > 0 && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {archivedChats.length}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link href="/trash">
                <Button variant="ghost" className="w-full justify-start text-mauve-subtle hover:text-mauve-bright">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Trash
                  {trashedChats.length > 0 && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {trashedChats.length}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>

            <Separator className="bg-mauve-dark" />

            {/* User Profile */}
            <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@johndoe" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">John Zealand-Doyle</span>
                <Badge
                  variant="outline"
                  className="w-fit text-xs bg-mauve-accent/20 border-mauve-accent/50 text-mauve-bright"
                >
                  Pro
                </Badge>
              </div>
            </a>
          </div>
        </aside>
      )}
    </>
  )
}
