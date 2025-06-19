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
import { useChats } from "@/hooks/use-chats"
import { useAuth } from "@/hooks/use-auth"
import { toChatId, ensureStringId, toProjectId } from "@/types/chat"
import { Separator } from "@/components/ui/separator"
import { UserProfile } from "@/components/user-profile"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Helper function to format timestamp
const formatTimestamp = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

// Helper function to group chats by time
const groupChatsByTime = (chats: any[]) => {
  const now = Date.now()
  const today = new Date(now).setHours(0, 0, 0, 0)
  const yesterday = today - 24 * 60 * 60 * 1000
  const weekAgo = today - 7 * 24 * 60 * 60 * 1000

  const pinnedThreads: any[] = []
  const todayThreads: any[] = []
  const yesterdayThreads: any[] = []
  const thisWeekThreads: any[] = []
  const olderThreads: any[] = []

  chats.forEach((chat) => {
    const chatTime = chat.lastActivity || chat.updatedAt

    // Note: In a real app, pinned status would be stored in the database
    if (chatTime >= today) {
      todayThreads.push(chat)
    } else if (chatTime >= yesterday) {
      yesterdayThreads.push(chat)
    } else if (chatTime >= weekAgo) {
      thisWeekThreads.push(chat)
    } else {
      olderThreads.push(chat)
    }
  })

  return {
    pinnedThreads,
    todayThreads,
    yesterdayThreads,
    thisWeekThreads,
    olderThreads,
  }
}

interface ThreadItemProps {
  chat: any
  parent?: boolean
  isActive?: boolean
}

// Thread Item Component
const ThreadItem = ({
  chat,
  parent = false,
  isActive = false,
  onMoveToTrash,
  onMoveToArchive,
}: ThreadItemProps & {
  onMoveToTrash: (chatId: string) => Promise<void>
  onMoveToArchive: (chatId: string) => Promise<void>
}) => {
  const handleMoveToTrash = async () => {
    await onMoveToTrash(ensureStringId(chat._id))
  }

  const handleMoveToArchive = async () => {
    await onMoveToArchive(ensureStringId(chat._id))
  }

  return (
    <EnhancedChatItem
      chat={{
        ...chat,
        id: chat._id,
        timestamp: formatTimestamp(chat.lastActivity || chat.updatedAt),
      }}
      isActive={isActive}
      onMoveToTrash={handleMoveToTrash}
      onMoveToArchive={handleMoveToArchive}
      onRestore={() => {}}
      onDeletePermanently={() => {}}
      showParentIcon={parent}
    />
  )
}

interface GroupLabelProps {
  label: string
}

// Group Label Component
const GroupLabel = ({ label }: GroupLabelProps) => (
  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-mauve-accent">
    {label}
  </div>
)

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { activeProject } = useProjects()
  const { startTemporaryChat, isTemporaryMode } = useTemporaryChat()
  const { archivedChats, trashedChats } = useChatLifecycle()
  const { user } = useAuth()

  // Get archived and trashed chat counts
  const { chats: archivedChatsData } = useChats({
    userId: user?._id,
    status: "archived",
  })

  const { chats: trashedChatsData } = useChats({
    userId: user?._id,
    status: "trashed",
  })

  // Get real chat data from Convex
  const {
    chats: activeChats,
    isLoading: chatsLoading,
    createChat,
    moveToArchive,
    moveToTrash,
  } = useChats({
    userId: user?._id,
    status: "active",
  })

  // Filter chats based on search query
  const filteredActiveChats = activeChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter archived chats for search results
  const filteredArchivedChats = searchQuery
    ? archivedChatsData.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  // Group chats by time periods
  const { pinnedThreads, todayThreads, yesterdayThreads, thisWeekThreads, olderThreads } =
    groupChatsByTime(filteredActiveChats)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleCreateNewChat = async () => {
    if (!user?._id) return

    try {
      const chatId = await createChat(
        activeProject ? `New Chat in ${activeProject.name}` : "New Chat",
        activeProject?.id ? toProjectId(activeProject.id) : undefined
      )
      if (chatId) {
        // Navigate to the new chat
        router.push(`/`)
        console.log("Created new chat:", chatId)
      }
    } catch (error) {
      console.error("Failed to create chat:", error)
    }
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
          className="fixed left-4 top-4 z-50 bg-mauve-surface/50 text-mauve-bright"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {showSidebar && (
        <aside
          className={`${isMobile ? "fixed inset-y-0 left-0 z-40 w-64" : "w-64 flex-shrink-0"} flex flex-col border-r border-mauve-dark bg-black/30 p-2 backdrop-blur-sm transition-all duration-300 ease-in-out`}
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
                className="w-full justify-center bg-mauve-accent/20 font-semibold text-mauve-bright hover:bg-mauve-accent/30"
                disabled={isTemporaryMode || !user?._id}
                onClick={handleCreateNewChat}
              >
                <Plus className="mr-2 h-4 w-4" />
                {activeProject ? `New Chat in ${activeProject.name}` : "New Chat"}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-center border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                onClick={startTemporaryChat}
              >
                <EyeOff className="mr-2 h-4 w-4" />
                Temporary Chat
              </Button>

              <GiftPurchaseModal
                trigger={
                  <Button
                    variant="outline"
                    className="w-full justify-center border-pink-500/50 bg-gradient-to-r from-pink-500/10 to-purple-600/10 text-pink-400 hover:from-pink-500/20 hover:to-purple-600/20"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Gift T3Chat Pro
                  </Button>
                }
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve-subtle" />
              <Input
                placeholder="Search your threads..."
                className="border-mauve-dark bg-black/20 pl-9 focus-visible:ring-mauve-accent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="-mr-2 flex-1 pr-2">
            <nav className="flex flex-col gap-1 py-2">
              {/* Projects Section */}
              <ProjectList
                onChatSelect={(chatId, projectId) => {
                  console.log("Selected chat:", chatId, "in project:", projectId)
                }}
              />

              {/* Standalone Chats */}
              <div className="mt-4">
                {chatsLoading ? (
                  <div className="px-3 py-2 text-sm text-mauve-subtle">Loading chats...</div>
                ) : (
                  <>
                    {pinnedThreads.length > 0 && (
                      <>
                        <GroupLabel label="Pinned" />
                        {pinnedThreads.map((thread) => (
                          <ThreadItem
                            key={thread._id}
                            chat={thread}
                            onMoveToTrash={(chatId) => moveToTrash(toChatId(chatId))}
                            onMoveToArchive={(chatId) => moveToArchive(toChatId(chatId))}
                          />
                        ))}
                      </>
                    )}

                    {todayThreads.length > 0 && (
                      <>
                        <GroupLabel label="Today" />
                        {todayThreads.map((thread) => (
                          <ThreadItem
                            key={thread._id}
                            chat={thread}
                            onMoveToTrash={(chatId) => moveToTrash(toChatId(chatId))}
                            onMoveToArchive={(chatId) => moveToArchive(toChatId(chatId))}
                          />
                        ))}
                      </>
                    )}

                    {yesterdayThreads.length > 0 && (
                      <>
                        <GroupLabel label="Yesterday" />
                        {yesterdayThreads.map((thread) => (
                          <ThreadItem
                            key={thread._id}
                            chat={thread}
                            onMoveToTrash={(chatId) => moveToTrash(toChatId(chatId))}
                            onMoveToArchive={(chatId) => moveToArchive(toChatId(chatId))}
                          />
                        ))}
                      </>
                    )}

                    {thisWeekThreads.length > 0 && (
                      <>
                        <GroupLabel label="This Week" />
                        {thisWeekThreads.map((thread) => (
                          <ThreadItem
                            key={thread._id}
                            chat={thread}
                            onMoveToTrash={(chatId) => moveToTrash(toChatId(chatId))}
                            onMoveToArchive={(chatId) => moveToArchive(toChatId(chatId))}
                          />
                        ))}
                      </>
                    )}

                    {olderThreads.length > 0 && (
                      <>
                        <GroupLabel label="Older" />
                        {olderThreads.map((thread) => (
                          <ThreadItem
                            key={thread._id}
                            chat={thread}
                            onMoveToTrash={(chatId) => moveToTrash(toChatId(chatId))}
                            onMoveToArchive={(chatId) => moveToArchive(toChatId(chatId))}
                          />
                        ))}
                      </>
                    )}

                    {/* Archived Search Results */}
                    {searchQuery && filteredArchivedChats.length > 0 && (
                      <>
                        <Separator className="my-3 bg-mauve-dark" />
                        <GroupLabel label="Archived Results" />
                        {filteredArchivedChats.map((thread) => (
                          <div key={thread._id} className="relative">
                            <ThreadItem
                              chat={thread}
                              onMoveToTrash={(chatId) => moveToTrash(toChatId(chatId))}
                              onMoveToArchive={(chatId) => moveToArchive(toChatId(chatId))}
                            />
                            <Badge
                              variant="outline"
                              className="absolute right-2 top-2 border-blue-500/50 bg-blue-500/10 text-xs text-blue-400"
                            >
                              Archived
                            </Badge>
                          </div>
                        ))}
                      </>
                    )}

                    {filteredActiveChats.length === 0 &&
                      filteredArchivedChats.length === 0 &&
                      !chatsLoading && (
                        <div className="px-3 py-8 text-center text-sm text-mauve-subtle">
                          {searchQuery ? "No chats found" : "No chats yet. Create your first chat!"}
                        </div>
                      )}
                  </>
                )}
              </div>
            </nav>
          </ScrollArea>

          {/* Archive & Trash Navigation */}
          <div className="mt-auto space-y-2 border-t border-mauve-dark pt-2">
            <div className="space-y-1">
              <Link href="/archive">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-mauve-subtle hover:text-mauve-bright"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                  {archivedChatsData.length > 0 && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {archivedChatsData.length}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link href="/trash">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-mauve-subtle hover:text-mauve-bright"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Trash
                  {trashedChatsData.length > 0 && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {trashedChatsData.length}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>

            <Separator className="bg-mauve-dark" />

            {/* User Profile */}
            <UserProfile />
          </div>
        </aside>
      )}
    </>
  )
}
