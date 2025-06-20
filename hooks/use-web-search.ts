"use client"

import { useState, useCallback } from "react"

interface SearchResult {
  title: string
  url: string
  content: string
  score: number
  published_date?: string
}

interface SearchResponse {
  query: string
  answer?: string
  results: SearchResult[]
  images?: string[]
  follow_up_questions?: string[]
  response_time: number
}

interface SearchError {
  error: string
  message?: string
}

interface UseWebSearchReturn {
  search: (query: string, maxResults?: number) => Promise<SearchResponse | null>
  isLoading: boolean
  error: string | null
  lastResponse: SearchResponse | null
  clearError: () => void
}

export function useWebSearch(): UseWebSearchReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<SearchResponse | null>(null)

  const search = useCallback(async (query: string, maxResults = 5): Promise<SearchResponse | null> => {
    if (!query.trim()) {
      setError("Search query cannot be empty")
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          maxResults,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorData = data as SearchError
        throw new Error(errorData.message || errorData.error || "Search failed")
      }

      const searchResponse = data as SearchResponse
      setLastResponse(searchResponse)
      return searchResponse
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown search error"
      setError(errorMessage)
      console.error("Web search error:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    search,
    isLoading,
    error,
    lastResponse,
    clearError,
  }
}