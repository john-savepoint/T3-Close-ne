"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Brain,
  Edit,
  Trash2,
  MoreHorizontal,
  Sparkles,
  Globe,
  Folder,
  BarChart3,
  Search,
  Lightbulb,
} from "lucide-react"
import { useMemory } from "@/hooks/use-memory"
import { useProjects } from "@/hooks/use-projects"
import type { UserMemory, CreateMemoryData } from "@/types/memory"

const categoryIcons = {
  preference: Sparkles,
  fact: Globe,
  instruction: Brain,
  style: Edit,
}

const categoryColors = {
  preference: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  fact: "bg-green-500/20 text-green-400 border-green-500/50",
  instruction: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  style: "bg-orange-500/20 text-orange-400 border-orange-500/50",
}

export function MemorySettings() {
  const {
    memories,
    suggestions,
    loading,
    createMemory,
    updateMemory,
    deleteMemory,
    acceptSuggestion,
    dismissSuggestion,
    getMemoryStats,
  } = useMemory()
  const { projects } = useProjects()
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingMemory, setEditingMemory] = useState<UserMemory | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const stats = getMemoryStats()

  const filteredMemories = memories.filter((memory) => {
    const matchesProject =
      selectedProject === "all" ||
      (selectedProject === "global" && !memory.projectId) ||
      memory.projectId === selectedProject

    const matchesSearch =
      !searchQuery || memory.content.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesProject && matchesSearch
  })

  const handleCreateMemory = async (data: CreateMemoryData) => {
    await createMemory(data)
    setIsCreateModalOpen(false)
  }

  const handleUpdateMemory = async (id: string, updates: Partial<UserMemory>) => {
    await updateMemory(id, updates)
    setEditingMemory(null)
  }

  const handleDeleteMemory = async (id: string) => {
    if (confirm("Are you sure you want to delete this memory?")) {
      await deleteMemory(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI Memory</h2>
          <p className="text-sm text-mauve-subtle/70">
            Manage what your AI remembers about you and your preferences
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-mauve-accent/20 hover:bg-mauve-accent/30"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Memory
        </Button>
      </div>

      <Tabs defaultValue="memories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-mauve-dark/50">
          <TabsTrigger value="memories">
            Memories
            <Badge variant="secondary" className="ml-2 h-4 text-xs">
              {stats.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            Suggestions
            <Badge variant="secondary" className="ml-2 h-4 text-xs">
              {suggestions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="memories" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve-subtle" />
                <Input
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-mauve-dark bg-mauve-dark/50 pl-9"
                />
              </div>
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48 border-mauve-dark bg-mauve-dark/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-mauve-dark bg-mauve-surface">
                <SelectItem value="all">All Memories</SelectItem>
                <SelectItem value="global">Global Only</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Memory List */}
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredMemories.length === 0 ? (
                <div className="py-8 text-center">
                  <Brain className="mx-auto mb-4 h-12 w-12 text-mauve-subtle/50" />
                  <p className="text-mauve-subtle/70">
                    {searchQuery ? "No memories match your search" : "No memories found"}
                  </p>
                </div>
              ) : (
                filteredMemories.map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    projects={projects}
                    onEdit={setEditingMemory}
                    onDelete={handleDeleteMemory}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="space-y-3">
            {suggestions.length === 0 ? (
              <div className="py-8 text-center">
                <Lightbulb className="mx-auto mb-4 h-12 w-12 text-mauve-subtle/50" />
                <p className="text-mauve-subtle/70">No memory suggestions at the moment</p>
                <p className="text-xs text-mauve-subtle/50">
                  The AI will suggest memories based on your conversations
                </p>
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="border-mauve-dark bg-mauve-surface/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{suggestion.content}</p>
                        <p className="mt-1 text-xs text-mauve-subtle/70">{suggestion.context}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </Badge>
                          <div className="ml-auto flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => dismissSuggestion(suggestion.id)}
                            >
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              className="bg-mauve-accent/20 hover:bg-mauve-accent/30"
                              onClick={() => acceptSuggestion(suggestion.id)}
                            >
                              Save Memory
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-mauve-dark bg-mauve-surface/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border-mauve-dark bg-mauve-surface/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Global</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.global}</div>
              </CardContent>
            </Card>

            <Card className="border-mauve-dark bg-mauve-surface/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Project-Specific</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.projectSpecific}</div>
              </CardContent>
            </Card>

            <Card className="border-mauve-dark bg-mauve-surface/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Auto-Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.autoGenerated}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-mauve-dark bg-mauve-surface/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Memory Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byCategory).map(([category, count]) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons] || Brain
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm capitalize">{category}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Memory Modal */}
      <CreateMemoryModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateMemory}
        projects={projects}
      />

      {/* Edit Memory Modal */}
      {editingMemory && (
        <EditMemoryModal
          memory={editingMemory}
          projects={projects}
          onSubmit={(updates) => handleUpdateMemory(editingMemory.id, updates)}
          onClose={() => setEditingMemory(null)}
        />
      )}
    </div>
  )
}

interface MemoryCardProps {
  memory: UserMemory
  projects: any[]
  onEdit: (memory: UserMemory) => void
  onDelete: (id: string) => void
}

function MemoryCard({ memory, projects, onEdit, onDelete }: MemoryCardProps) {
  const project = projects.find((p) => p.id === memory.projectId)
  const Icon = categoryIcons[memory.category || "preference"]
  const categoryColor = categoryColors[memory.category || "preference"]

  return (
    <Card className="border-mauve-dark bg-mauve-surface/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-mauve-accent" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm">{memory.content}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-mauve-dark bg-mauve-surface">
                  <DropdownMenuItem onClick={() => onEdit(memory)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(memory.id)}
                    className="text-red-400 focus:text-red-300"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${categoryColor}`}>
                {memory.category || "preference"}
              </Badge>
              {memory.projectId ? (
                <Badge variant="outline" className="text-xs">
                  <Folder className="mr-1 h-3 w-3" />
                  {project?.name || "Unknown Project"}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <Globe className="mr-1 h-3 w-3" />
                  Global
                </Badge>
              )}
              {memory.isAutoGenerated && (
                <Badge variant="outline" className="border-blue-500/50 text-xs text-blue-400">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Auto
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface CreateMemoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateMemoryData) => Promise<void>
  projects: any[]
}

function CreateMemoryModal({ open, onOpenChange, onSubmit, projects }: CreateMemoryModalProps) {
  const [formData, setFormData] = useState<CreateMemoryData>({
    content: "",
    category: "preference",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.content.trim()) return

    setLoading(true)
    try {
      await onSubmit(formData)
      setFormData({ content: "", category: "preference" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-mauve-dark bg-mauve-surface">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Memory</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Memory Content</Label>
            <Textarea
              id="content"
              placeholder="e.g., I prefer TypeScript over JavaScript for all projects"
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              className="min-h-[100px] border-mauve-dark bg-mauve-dark/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value as any }))
                }
              >
                <SelectTrigger className="border-mauve-dark bg-mauve-dark/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-mauve-dark bg-mauve-surface">
                  <SelectItem value="preference">Preference</SelectItem>
                  <SelectItem value="fact">Fact</SelectItem>
                  <SelectItem value="instruction">Instruction</SelectItem>
                  <SelectItem value="style">Style</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project (Optional)</Label>
              <Select
                value={formData.projectId || "global"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    projectId: value === "global" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger className="border-mauve-dark bg-mauve-dark/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-mauve-dark bg-mauve-surface">
                  <SelectItem value="global">Global</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.content.trim()}>
              {loading ? "Saving..." : "Save Memory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditMemoryModalProps {
  memory: UserMemory
  projects: any[]
  onSubmit: (updates: Partial<UserMemory>) => Promise<void>
  onClose: () => void
}

function EditMemoryModal({ memory, projects, onSubmit, onClose }: EditMemoryModalProps) {
  const [formData, setFormData] = useState({
    content: memory.content,
    category: memory.category || "preference",
    projectId: memory.projectId,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.content.trim()) return

    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="border-mauve-dark bg-mauve-surface">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Memory</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-content">Memory Content</Label>
            <Textarea
              id="edit-content"
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              className="min-h-[100px] border-mauve-dark bg-mauve-dark/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value as any }))
                }
              >
                <SelectTrigger className="border-mauve-dark bg-mauve-dark/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-mauve-dark bg-mauve-surface">
                  <SelectItem value="preference">Preference</SelectItem>
                  <SelectItem value="fact">Fact</SelectItem>
                  <SelectItem value="instruction">Instruction</SelectItem>
                  <SelectItem value="style">Style</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-project">Project</Label>
              <Select
                value={formData.projectId || "global"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    projectId: value === "global" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger className="border-mauve-dark bg-mauve-dark/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-mauve-dark bg-mauve-surface">
                  <SelectItem value="global">Global</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.content.trim()}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
