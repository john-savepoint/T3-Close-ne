"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Zap, Gauge, Brain, ChevronDown } from "lucide-react"
import { ChatModel } from "@/types/models"
import { cn } from "@/lib/utils"

interface QuickModelSelectorProps {
  quickSelectModels: {
    fast?: ChatModel
    balanced?: ChatModel
    heavy?: ChatModel
  }
  currentModel: ChatModel | null
  onModelSelect: (model: ChatModel) => void
  className?: string
}

type ModelType = "fast" | "balanced" | "heavy"

const modelConfig = {
  fast: {
    icon: Zap,
    label: "Fast",
    color: "text-green-500",
  },
  balanced: {
    icon: Gauge,
    label: "Balanced",
    color: "text-blue-500",
  },
  heavy: {
    icon: Brain,
    label: "Heavy",
    color: "text-purple-500",
  },
}

export function QuickModelSelector({
  quickSelectModels,
  currentModel,
  onModelSelect,
  className,
}: QuickModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Determine which type is currently selected
  const getCurrentType = (): ModelType | null => {
    if (!currentModel) return null
    if (currentModel.id === quickSelectModels.fast?.id) return "fast"
    if (currentModel.id === quickSelectModels.balanced?.id) return "balanced"
    if (currentModel.id === quickSelectModels.heavy?.id) return "heavy"
    return null
  }

  const currentType = getCurrentType()
  const currentConfig = currentType ? modelConfig[currentType] : modelConfig.balanced
  const CurrentIcon = currentConfig.icon

  // Get available options (exclude current selection)
  const getAvailableOptions = (): ModelType[] => {
    const allTypes: ModelType[] = ["fast", "balanced", "heavy"]
    return allTypes.filter(type => {
      const model = quickSelectModels[type]
      return model && type !== currentType
    })
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (type: ModelType) => {
    const model = quickSelectModels[type]
    if (model) {
      onModelSelect(model)
      setIsOpen(false)
    }
  }

  const availableOptions = getAvailableOptions()

  // Don't render if no models are available
  if (!quickSelectModels.fast && !quickSelectModels.balanced && !quickSelectModels.heavy) {
    return null
  }

  return (
    <div ref={dropdownRef} className={cn("relative z-10", className)}>
      {/* Dropdown options - rendered above the button when open */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 min-w-[120px] flex flex-col gap-1 rounded-md border border-border bg-popover p-1 shadow-lg z-50">
          {availableOptions.map((type) => {
            const config = modelConfig[type]
            const Icon = config.icon
            return (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                className={cn(
                  "justify-start text-xs hover:bg-accent",
                  config.color
                )}
                onClick={() => handleSelect(type)}
              >
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
              </Button>
            )
          })}
        </div>
      )}

      {/* Main button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "text-xs",
          currentType && currentConfig.color,
          currentType && currentModel?.id === currentModel?.id && "bg-primary/20"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CurrentIcon className="mr-1 h-3 w-3" />
        {currentConfig.label}
        <ChevronDown className={cn(
          "ml-1 h-3 w-3 transition-transform",
          isOpen && "rotate-180"
        )} />
      </Button>
    </div>
  )
}