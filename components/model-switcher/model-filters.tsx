"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Star } from "lucide-react"
import { sanitizeSearchQuery } from "@/lib/sanitize"

interface ModelFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedProvider: string
  onProviderChange: (provider: string) => void
  providers: string[]
  showFavoritesOnly: boolean
  onToggleFavoritesOnly: (show: boolean) => void
  showComparison: boolean
  onToggleComparison: (show: boolean) => void
  compareCount: number
}

export function ModelFilters({
  searchQuery,
  onSearchChange,
  selectedProvider,
  onProviderChange,
  providers,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  showComparison,
  onToggleComparison,
  compareCount,
}: ModelFiltersProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search models..."
          value={searchQuery}
          onChange={(e) => onSearchChange(sanitizeSearchQuery(e.target.value))}
          className="pl-8"
          aria-label="Search models"
        />
      </div>
      <Select value={selectedProvider} onValueChange={onProviderChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Providers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Providers</SelectItem>
          {providers.map((provider) => (
            <SelectItem key={provider} value={provider}>
              {provider}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant={showFavoritesOnly ? "default" : "outline"}
        size="sm"
        onClick={() => onToggleFavoritesOnly(!showFavoritesOnly)}
        className="flex items-center gap-1"
      >
        <Star className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
        Favorites
      </Button>
      <Button
        variant={showComparison ? "default" : "outline"}
        size="sm"
        onClick={() => onToggleComparison(!showComparison)}
        className="flex items-center gap-1"
      >
        Compare ({compareCount})
      </Button>
    </div>
  )
}
