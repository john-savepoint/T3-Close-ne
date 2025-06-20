"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Pin, Archive, Trash2, FolderOpen } from "lucide-react"
import { NavigationView } from "@/hooks/use-navigation-state"

interface SidebarNavigationProps {
  currentView: NavigationView
  onNavigate: (view: NavigationView) => void
  archivedCount: number
  trashedCount: number
}

export function SidebarNavigation({
  currentView,
  onNavigate,
  archivedCount,
  trashedCount,
}: SidebarNavigationProps) {
  const navigationItems = [
    {
      id: "home" as NavigationView,
      icon: Home,
      label: "Home",
      count: 0,
    },
    {
      id: "pinned" as NavigationView,
      icon: Pin,
      label: "Pinned",
      count: 0,
    },
    {
      id: "projects" as NavigationView,
      icon: FolderOpen,
      label: "Projects",
      count: 0,
    },
    {
      id: "archive" as NavigationView,
      icon: Archive,
      label: "Archive",
      count: archivedCount,
    },
    {
      id: "trash" as NavigationView,
      icon: Trash2,
      label: "Trash",
      count: trashedCount,
    },
  ]

  return (
    <div className="border-t border-mauve-dark bg-black/10 backdrop-blur-sm">
      <div className="flex items-center justify-between px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`relative flex h-10 w-10 flex-col items-center justify-center gap-0 p-0 transition-all duration-200 ${
                isActive
                  ? "bg-mauve-accent/20 text-mauve-bright"
                  : "text-mauve-subtle hover:bg-mauve-accent/10 hover:text-mauve-bright"
              }`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <Icon className="h-4 w-4" />
              {item.count > 0 && (
                <Badge
                  variant="outline"
                  className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-xs border-mauve-accent/50 bg-mauve-accent/20 text-mauve-bright"
                >
                  {item.count}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}