"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, Zap, Brain, Code, Sparkles } from "lucide-react"

interface Model {
  id: string
  name: string
  provider: string
  description: string
  icon: React.ReactNode
  tier: "free" | "pro" | "premium"
}

const models: Model[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Most capable model for complex reasoning",
    icon: <Brain className="h-4 w-4" />,
    tier: "pro",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Fast and efficient for most tasks",
    icon: <Zap className="h-4 w-4" />,
    tier: "free",
  },
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Excellent for coding and analysis",
    icon: <Code className="h-4 w-4" />,
    tier: "pro",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    description: "Latest multimodal capabilities",
    icon: <Sparkles className="h-4 w-4" />,
    tier: "premium",
  },
]

interface EnhancedModelSwitcherProps {
  isOpen: boolean
  onClose: () => void
  selectedModel: string
  onModelChange: (modelId: string) => void
}

export function EnhancedModelSwitcher({ isOpen, onClose, selectedModel, onModelChange }: EnhancedModelSwitcherProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("")
      // Focus the input when dialog opens
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const filteredModels = models.filter(
    (model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId)
    onClose()
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "free":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "pro":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      case "premium":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-mauve-surface border-mauve-dark">
        <DialogHeader>
          <DialogTitle className="text-foreground">Switch Model</DialogTitle>
        </DialogHeader>

        <Command className="bg-transparent">
          <CommandInput
            ref={inputRef}
            placeholder="Search models..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="bg-mauve-dark/50 border-mauve-dark"
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No models found.</CommandEmpty>
            <CommandGroup>
              {filteredModels.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={() => handleModelSelect(model.id)}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-mauve-dark/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {model.icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{model.name}</span>
                        <Badge variant="outline" className={`text-xs ${getTierColor(model.tier)}`}>
                          {model.tier}
                        </Badge>
                      </div>
                      <p className="text-sm text-mauve-subtle/70">{model.description}</p>
                      <p className="text-xs text-mauve-subtle/50">{model.provider}</p>
                    </div>
                  </div>
                  {selectedModel === model.id && <Check className="h-4 w-4 text-mauve-accent" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        <div className="text-xs text-mauve-subtle/50 mt-2">Use ↑↓ to navigate, Enter to select, Esc to close</div>
      </DialogContent>
    </Dialog>
  )
}
