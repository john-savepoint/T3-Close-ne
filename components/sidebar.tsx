"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Menu, EyeOff, Plus } from "lucide-react"
import { T3Logo } from "@/components/t3-logo"
import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { ProjectList } from "@/components/project-list"
import { useProjects } from "@/hooks/use-projects"
import { useTemporaryChat } from "@/hooks/use-temporary-chat"
import { DismissableGiftButton } from "@/components/dismissable-gift-button"
import { NewChatButtonGroup } from "@/components/new-chat-button-group"
import { EnhancedChatItem } from "@/components/enhanced-chat-item"
import { useChatLifecycle } from "@/hooks/use-chat-lifecycle"
import { useChats } from "@/hooks/use-chats"
import { useAuth } from "@/hooks/use-auth"
import { toChatId, ensureStringId, toProjectId } from "@/types/chat"
import { Separator } from "@/components/ui/separator"
import { UserProfile } from "@/components/user-profile"
import { useRouter } from "next/navigation"
import { useUIPreferences } from "@/hooks/use-ui-preferences"
import { useChatPinning } from "@/hooks/use-chat-pinning"
import { ShareChatModal } from "@/components/share-chat-modal"
import { useNavigationState } from "@/hooks/use-navigation-state"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { DndProvider } from "@/components/providers/dnd-provider"
import { DraggableChatItem } from "@/components/draggable-chat-item"
import { DroppableProject } from "@/components/droppable-project"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { DragEndEvent, DragOverEvent } from "@dnd-kit/core"

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

    // Separate pinned chats
    if (chat.isPinned) {
      pinnedThreads.push(chat)
    } else if (chatTime >= today) {
      todayThreads.push(chat)
    } else if (chatTime >= yesterday) {
      yesterdayThreads.push(chat)
    } else if (chatTime >= weekAgo) {
      thisWeekThreads.push(chat)
    } else {
      olderThreads.push(chat)
    }
  })

  // Sort pinned threads by pinnedAt date
  pinnedThreads.sort((a, b) => (b.pinnedAt || 0) - (a.pinnedAt || 0))

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

// Thread Item Component - Now just a wrapper for DraggableChatItem
const ThreadItem = ({
  chat,
  parent = false,
  isActive = false,
  onMoveToTrash,
  onMoveToArchive,
  onRename,
  onTogglePin,
  onShare,
}: ThreadItemProps & {
  onMoveToTrash: (chatId: string) => Promise<void>
  onMoveToArchive: (chatId: string) => Promise<void>
  onRename: (chatId: string, newTitle: string) => Promise<void>
  onTogglePin: (chatId: string, isPinned: boolean) => Promise<void>
  onShare: (chatId: string) => void
}) => {
  const router = useRouter()
  const handleMoveToTrash = async () => {
    await onMoveToTrash(ensureStringId(chat._id))
  }

  const handleMoveToArchive = async () => {
    await onMoveToArchive(ensureStringId(chat._id))
  }
  
  const handleTogglePin = async () => {
    await onTogglePin(ensureStringId(chat._id), chat.isPinned)
  }
  
  const handleShare = () => {
    onShare(ensureStringId(chat._id))
  }

  const handleRestore = () => {
    // This would be handled by the parent component
    console.log("Restore chat:", chat._id)
  }

  const handleDeletePermanent = () => {
    // This would be handled by the parent component
    console.log("Delete permanently:", chat._id)
  }

  const handleChatClick = () => {
    router.push(`/?chatId=${chat._id}`)
  }

  const handleRename = async (newTitle: string) => {
    if (newTitle && newTitle.trim() !== chat.title) {
      await onRename(ensureStringId(chat._id), newTitle.trim())
    }
  }

  return (
    <DraggableChatItem
      chat={chat}
      isActive={isActive}
      onMoveToTrash={handleMoveToTrash}
      onMoveToArchive={handleMoveToArchive}
      onRename={handleRename}
      onTogglePin={handleTogglePin}
      onShare={handleShare}
      onClick={handleChatClick}
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
  const { isDismissed } = useUIPreferences()
  const { togglePin } = useChatPinning()
  const { activeProject, projects } = useProjects()
  const { startTemporaryChat, isTemporaryMode } = useTemporaryChat()
  const { archivedChats, trashedChats } = useChatLifecycle()
  const { user, clerkUser, isAuthenticated, isAuthenticating, syncError } = useAuth()
  const { currentView, navigateToView, isCurrentView } = useNavigationState()
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  // Get archived and trashed chat counts
  const { chats: archivedChatsData } = useChats({
    userId: user?._id,
    status: "archived",
  })

  const { chats: trashedChatsData } = useChats({
    userId: user?._id,
    status: "trashed",
  })

  // Get real chat data from Convex - only if user is properly synced
  const {
    chats: activeChats,
    isLoading: chatsLoading,
    createChat,
    updateChat,
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

  // Group archived chats by time
  const archivedChatGroups = groupChatsByTime(archivedChatsData)
  
  // Group trashed chats by time  
  const trashedChatGroups = groupChatsByTime(trashedChatsData)

  // Filter chats based on current view
  const getFilteredChats = () => {
    switch (currentView) {
      case "pinned":
        return { pinnedThreads, todayThreads: [], yesterdayThreads: [], thisWeekThreads: [], olderThreads: [] }
      case "archive":
        return archivedChatGroups
      case "trash":
        return trashedChatGroups
      case "projects":
        return { pinnedThreads: [], todayThreads: [], yesterdayThreads: [], thisWeekThreads: [], olderThreads: [] }
      default: // home
        return { pinnedThreads, todayThreads, yesterdayThreads, thisWeekThreads, olderThreads }
    }
  }

  const filteredChatGroups = getFilteredChats()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleCreateNewChat = async () => {
    // Create a new chat
    console.log("New chat button clicked")
    try {
      if (!user?._id) {
        console.error("Cannot create chat: user not authenticated")
        return
      }
      
      // Clear the current chat by removing chatId from URL
      router.push('/')
      
      // If there's an active project, the new chat will be created in that project
      // The actual chat creation happens when the first message is sent
    } catch (error) {
      console.error("Failed to create new chat:", error)
    }
  }

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    try {
      await updateChat(toChatId(chatId), { title: newTitle })
    } catch (error) {
      console.error("Failed to rename chat:", error)
    }
  }

  const [shareModalChatId, setShareModalChatId] = useState<string | null>(null)

  const handleShareChat = (chatId: string) => {
    setShareModalChatId(chatId)
  }

  const handleRestoreChat = async (chatId: string) => {
    try {
      // This would restore from archive/trash back to active
      // Since updateChat doesn't support status, we'll use a placeholder for now
      console.log("Restore chat:", chatId, "- This would restore the chat from archive/trash")
      // TODO: Implement actual restore functionality when backend supports it
    } catch (error) {
      console.error("Failed to restore chat:", error)
    }
  }

  const handleDeletePermanently = async (chatId: string) => {
    try {
      // This would permanently delete the chat
      console.log("Permanently delete chat:", chatId)
      // await deleteChat(toChatId(chatId))
    } catch (error) {
      console.error("Failed to permanently delete chat:", error)
    }
  }

  // Helper function to get proper handlers based on current view
  const getItemHandlers = (chatId: string) => {
    if (currentView === "archive") {
      return {
        onMoveToTrash: () => handleDeletePermanently(chatId),
        onMoveToArchive: () => handleRestoreChat(chatId),
        onRestore: () => handleRestoreChat(chatId),
        onDeletePermanently: () => handleDeletePermanently(chatId),
      }
    } else if (currentView === "trash") {
      return {
        onMoveToTrash: () => handleDeletePermanently(chatId),
        onMoveToArchive: () => handleRestoreChat(chatId),
        onRestore: () => handleRestoreChat(chatId),
        onDeletePermanently: () => handleDeletePermanently(chatId),
      }
    } else {
      return {
        onMoveToTrash: () => moveToTrash(toChatId(chatId)),
        onMoveToArchive: () => moveToArchive(toChatId(chatId)),
        onRestore: () => handleRestoreChat(chatId),
        onDeletePermanently: () => handleDeletePermanently(chatId),
      }
    }
  }

  // Handle drag end event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const activeData = active.data.current
    const overData = over.data.current
    
    // Check if we're dropping a chat onto a project
    if (activeData?.type === "chat" && overData?.type === "project") {
      const chatId = active.id as string
      const projectId = overData.projectId as string
      
      try {
        // Update the chat to move it to the project
        await updateChat(toChatId(chatId), { projectId: toProjectId(projectId) })
        console.log(`Moved chat ${chatId} to project ${projectId}`)
      } catch (error) {
        console.error("Failed to move chat to project:", error)
      }
    }
  }

  // Handle drag over event (for visual feedback)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const activeData = active.data.current
    const overData = over.data.current
    
    // Auto-expand project when dragging over it
    if (activeData?.type === "chat" && overData?.type === "project") {
      const projectId = overData.projectId as string
      if (!expandedProjects.has(projectId)) {
        setExpandedProjects(prev => new Set(prev).add(projectId))
      }
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
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
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
              <NewChatButtonGroup 
                onCreateNewChat={handleCreateNewChat}
              />

              {!isDismissed("giftProButton") && <DismissableGiftButton />}
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
          <DndProvider onDragEnd={handleDragEnd} onDragOver={handleDragOver} renderDragOverlay={(active) => {
            const chat = active.data?.current?.chat
            if (!chat) return null
            return (
              <div className="opacity-80">
                <EnhancedChatItem
                  chat={{
                    ...chat,
                    id: chat._id,
                    timestamp: formatTimestamp(chat.lastActivity || chat.updatedAt),
                  }}
                  isActive={false}
                  onClick={() => {}}
                  onMoveToTrash={async () => {}}
                  onMoveToArchive={async () => {}}
                  onRename={() => {}}
                  onRestore={() => {}}
                  onDeletePermanently={() => {}}
                  onPin={async () => {}}
                  onShare={() => {}}
                  showParentIcon={false}
                />
              </div>
            )
          }}>
            <ScrollArea className="-mr-2 flex-1 pr-2">
              <nav className="flex flex-col gap-1 py-2">
              {/* Projects Section - Only show on home view */}
              {currentView === "home" && (
                <ProjectList
                  onChatSelect={(chatId, projectId) => {
                    router.push(`/?chatId=${chatId}`)
                  }}
                />
              )}

              {/* Projects-only view - Takes full space */}
              {currentView === "projects" && (
                <ProjectList
                  onChatSelect={(chatId, projectId) => {
                    router.push(`/?chatId=${chatId}`)
                  }}
                />
              )}

              {/* Content based on current view */}
              <div className={currentView === "home" ? "mt-4" : ""}>
                {currentView === "projects" ? (
                  // Projects content is handled by ProjectList component above
                  null
                ) : isAuthenticating ? (
                  <div className="px-3 py-2 text-sm text-mauve-subtle">Syncing user account...</div>
                ) : syncError ? (
                  <div className="px-3 py-2 text-sm text-yellow-400">
                    <p className="font-medium">Sync Error</p>
                    <p className="text-xs">Please refresh the page</p>
                  </div>
                ) : chatsLoading ? (
                  <div className="px-3 py-2 text-sm text-mauve-subtle">Loading chats...</div>
                ) : (
                  <>
                    {filteredChatGroups.pinnedThreads.length > 0 && (
                      <>
                        <GroupLabel label="Pinned" />
                        <SortableContext 
                          items={filteredChatGroups.pinnedThreads.map(t => t._id)} 
                          strategy={verticalListSortingStrategy}
                        >
                          {filteredChatGroups.pinnedThreads.map((thread) => {
                            const handlers = getItemHandlers(ensureStringId(thread._id))
                            return (
                              <ThreadItem
                                key={thread._id}
                                chat={thread}
                                onMoveToTrash={handlers.onMoveToTrash}
                                onMoveToArchive={handlers.onMoveToArchive}
                                onRename={handleRenameChat}
                                onTogglePin={(chatId, isPinned) => togglePin(toChatId(chatId), isPinned)}
                                onShare={handleShareChat}
                              />
                            )
                          })}
                        </SortableContext>
                      </>
                    )}

                    {filteredChatGroups.todayThreads.length > 0 && (
                      <>
                        <GroupLabel label="Today" />
                        <SortableContext 
                          items={filteredChatGroups.todayThreads.map(t => t._id)} 
                          strategy={verticalListSortingStrategy}
                        >
                          {filteredChatGroups.todayThreads.map((thread) => {
                            const handlers = getItemHandlers(ensureStringId(thread._id))
                            return (
                              <ThreadItem
                                key={thread._id}
                                chat={thread}
                                onMoveToTrash={handlers.onMoveToTrash}
                                onMoveToArchive={handlers.onMoveToArchive}
                                onRename={handleRenameChat}
                                onTogglePin={(chatId, isPinned) => togglePin(toChatId(chatId), isPinned)}
                                onShare={handleShareChat}
                              />
                            )
                          })}
                        </SortableContext>
                      </>
                    )}

                    {filteredChatGroups.yesterdayThreads.length > 0 && (
                      <>
                        <GroupLabel label="Yesterday" />
                        <SortableContext 
                          items={filteredChatGroups.yesterdayThreads.map(t => t._id)} 
                          strategy={verticalListSortingStrategy}
                        >
                          {filteredChatGroups.yesterdayThreads.map((thread) => {
                            const handlers = getItemHandlers(ensureStringId(thread._id))
                            return (
                              <ThreadItem
                                key={thread._id}
                                chat={thread}
                                onMoveToTrash={handlers.onMoveToTrash}
                                onMoveToArchive={handlers.onMoveToArchive}
                                onRename={handleRenameChat}
                                onTogglePin={(chatId, isPinned) => togglePin(toChatId(chatId), isPinned)}
                                onShare={handleShareChat}
                              />
                            )
                          })}
                        </SortableContext>
                      </>
                    )}

                    {filteredChatGroups.thisWeekThreads.length > 0 && (
                      <>
                        <GroupLabel label="This Week" />
                        <SortableContext 
                          items={filteredChatGroups.thisWeekThreads.map(t => t._id)} 
                          strategy={verticalListSortingStrategy}
                        >
                          {filteredChatGroups.thisWeekThreads.map((thread) => {
                            const handlers = getItemHandlers(ensureStringId(thread._id))
                            return (
                              <ThreadItem
                                key={thread._id}
                                chat={thread}
                                onMoveToTrash={handlers.onMoveToTrash}
                                onMoveToArchive={handlers.onMoveToArchive}
                                onRename={handleRenameChat}
                                onTogglePin={(chatId, isPinned) => togglePin(toChatId(chatId), isPinned)}
                                onShare={handleShareChat}
                              />
                            )
                          })}
                        </SortableContext>
                      </>
                    )}

                    {filteredChatGroups.olderThreads.length > 0 && (
                      <>
                        <GroupLabel label="Older" />
                        <SortableContext 
                          items={filteredChatGroups.olderThreads.map(t => t._id)} 
                          strategy={verticalListSortingStrategy}
                        >
                          {filteredChatGroups.olderThreads.map((thread) => {
                            const handlers = getItemHandlers(ensureStringId(thread._id))
                            return (
                              <ThreadItem
                                key={thread._id}
                                chat={thread}
                                onMoveToTrash={handlers.onMoveToTrash}
                                onMoveToArchive={handlers.onMoveToArchive}
                                onRename={handleRenameChat}
                                onTogglePin={(chatId, isPinned) => togglePin(toChatId(chatId), isPinned)}
                                onShare={handleShareChat}
                              />
                            )
                          })}
                        </SortableContext>
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
                              onRename={handleRenameChat}
                              onTogglePin={(chatId, isPinned) => togglePin(toChatId(chatId), isPinned)}
                              onShare={handleShareChat}
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

                    {/* Empty state */}
                    {Object.values(filteredChatGroups).every(group => group.length === 0) &&
                      filteredArchivedChats.length === 0 &&
                      !chatsLoading && (
                        <div className="px-3 py-8 text-center text-sm text-mauve-subtle">
                          {searchQuery ? "No chats found" : 
                           currentView === "archive" ? "No archived chats" :
                           currentView === "trash" ? "No chats in trash" :
                           currentView === "pinned" ? "No pinned chats" :
                           "No chats yet. Create your first chat!"}
                        </div>
                      )}
                  </>
                )}
              </div>
            </nav>
          </ScrollArea>
          </DndProvider>

          {/* Bottom Navigation */}
          <div className="mt-auto">
            <SidebarNavigation
              currentView={currentView}
              onNavigate={navigateToView}
              archivedCount={archivedChatsData.length}
              trashedCount={trashedChatsData.length}
            />
            
            {/* User Profile */}
            <div className="p-2">
              <UserProfile />
            </div>
          </div>
        </aside>
      )}

      {/* Share Modal */}
      <ShareChatModal
        chatId={shareModalChatId || ""}
        chatTitle={
          shareModalChatId
            ? [...pinnedThreads, ...todayThreads, ...yesterdayThreads, ...thisWeekThreads, ...olderThreads]
                .find(chat => chat._id === shareModalChatId)?.title || "Untitled Chat"
            : ""
        }
        messageCount={
          shareModalChatId
            ? [...pinnedThreads, ...todayThreads, ...yesterdayThreads, ...thisWeekThreads, ...olderThreads]
                .find(chat => chat._id === shareModalChatId)?.messageCount || 0
            : 0
        }
        open={!!shareModalChatId}
        onOpenChange={(open) => !open && setShareModalChatId(null)}
      />

    </>
  )
}
