"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, X, Edit } from "lucide-react"

interface InlineEditProps {
  value: string
  onSave: (newValue: string) => void
  onCancel?: () => void
  className?: string
  placeholder?: string
  disabled?: boolean
  editTrigger?: "click" | "icon" | "both"
}

export function InlineEdit({
  value,
  onSave,
  onCancel,
  className = "",
  placeholder = "Enter text...",
  disabled = false,
  editTrigger = "both",
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = () => {
    const trimmedValue = editValue.trim()
    if (trimmedValue && trimmedValue !== value) {
      onSave(trimmedValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
    onCancel?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const handleTextClick = () => {
    if (!disabled && (editTrigger === "click" || editTrigger === "both")) {
      setIsEditing(true)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled) {
      setIsEditing(true)
    }
  }

  if (isEditing) {
    return (
      <div className={`flex items-center gap-1 py-1 ${className}`}>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          className="h-6 text-sm bg-mauve-surface/50 border-mauve-dark"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSave}
          className="h-6 w-6 text-green-400 hover:text-green-300"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCancel}
          className="h-6 w-6 text-red-400 hover:text-red-300"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`group flex items-center gap-1 py-1 ${className}`}>
      <span
        onClick={handleTextClick}
        className={`truncate text-sm ${
          editTrigger === "click" || editTrigger === "both"
            ? "cursor-pointer hover:text-mauve-bright"
            : ""
        } ${disabled ? "text-mauve-subtle/50" : "text-mauve-subtle"}`}
      >
        {value}
      </span>
      {(editTrigger === "icon" || editTrigger === "both") && !disabled && (
        <Button
          size="icon"
          variant="ghost"
          onClick={handleEditClick}
          className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-mauve-subtle hover:text-mauve-bright"
        >
          <Edit className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}