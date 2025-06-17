"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ChevronDown, Zap, Brain, Gauge } from "lucide-react"

const models = [
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    category: "heavy",
    icon: Brain,
    description: "Most capable model for complex reasoning",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    category: "heavy",
    icon: Brain,
    description: "Advanced multimodal capabilities",
  },
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    category: "balanced",
    icon: Gauge,
    description: "Great balance of speed and capability",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    category: "fast",
    icon: Zap,
    description: "Fast and efficient for simple tasks",
  },
]

interface ModelSwitcherProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
}

export function ModelSwitcher({ selectedModel, onModelChange }: ModelSwitcherProps) {
  const [open, setOpen] = useState(false)
  const currentModel = models.find((m) => m.id === selectedModel) || models[0]

  const quickSelectModels = {
    heavy: models.filter((m) => m.category === "heavy")[0],
    balanced: models.filter((m) => m.category === "balanced")[0],
    fast: models.filter((m) => m.category === "fast")[0],
  }

  return (
    <div className="flex items-center gap-2">
      {/* Quick Select Buttons */}
      <div className="hidden items-center gap-1 md:flex">
        <Button
          variant="ghost"
          size="sm"
          className={`text-xs ${quickSelectModels.heavy.id === selectedModel ? "bg-mauve-accent/20" : ""}`}
          onClick={() => onModelChange(quickSelectModels.heavy.id)}
        >
          <Brain className="mr-1 h-3 w-3" />
          Heavy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`text-xs ${quickSelectModels.balanced.id === selectedModel ? "bg-mauve-accent/20" : ""}`}
          onClick={() => onModelChange(quickSelectModels.balanced.id)}
        >
          <Gauge className="mr-1 h-3 w-3" />
          Balanced
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`text-xs ${quickSelectModels.fast.id === selectedModel ? "bg-mauve-accent/20" : ""}`}
          onClick={() => onModelChange(quickSelectModels.fast.id)}
        >
          <Zap className="mr-1 h-3 w-3" />
          Fast
        </Button>
      </div>

      {/* Model Selector Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs text-mauve-subtle">
            {currentModel.name} <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="border-mauve-dark bg-mauve-surface">
          <DialogHeader>
            <DialogTitle className="text-foreground">Select Model</DialogTitle>
          </DialogHeader>
          <Command className="bg-transparent">
            <CommandInput placeholder="Search models..." className="bg-mauve-dark/50" />
            <CommandList>
              <CommandEmpty>No models found.</CommandEmpty>
              <CommandGroup>
                {models.map((model) => {
                  const Icon = model.icon
                  return (
                    <CommandItem
                      key={model.id}
                      value={model.id}
                      onSelect={() => {
                        onModelChange(model.id)
                        setOpen(false)
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-mauve-dark/50"
                    >
                      <Icon className="h-4 w-4" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {model.provider}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              model.category === "heavy"
                                ? "border-red-500/50 text-red-400"
                                : model.category === "balanced"
                                  ? "border-yellow-500/50 text-yellow-400"
                                  : "border-green-500/50 text-green-400"
                            }`}
                          >
                            {model.category}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-mauve-subtle/70">{model.description}</p>
                      </div>
                      {model.id === selectedModel && (
                        <div className="h-2 w-2 rounded-full bg-mauve-accent" />
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  )
}
