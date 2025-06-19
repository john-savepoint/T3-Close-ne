"use client"

import { useState, useEffect, useCallback } from "react"
import { ChatModel } from "@/types/models"

const STORAGE_KEY = "z6chat-favorite-models"

interface UseModelFavoritesReturn {
  favoriteModels: string[]
  toggleFavorite: (modelId: string) => void
  isFavorite: (modelId: string) => boolean
  getFavoriteModels: (allModels: ChatModel[]) => ChatModel[]
  clearFavorites: () => void
}

export function useModelFavorites(): UseModelFavoritesReturn {
  const [favoriteModels, setFavoriteModels] = useState<string[]>([])

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const favorites = JSON.parse(stored)
        if (Array.isArray(favorites)) {
          setFavoriteModels(favorites)
        }
      }
    } catch (error) {
      console.warn("Failed to load model favorites:", error)
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteModels))
    } catch (error) {
      console.warn("Failed to save model favorites:", error)
    }
  }, [favoriteModels])

  const toggleFavorite = useCallback((modelId: string) => {
    setFavoriteModels((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((id) => id !== modelId)
      } else {
        return [...prev, modelId]
      }
    })
  }, [])

  const isFavorite = useCallback(
    (modelId: string) => {
      return favoriteModels.includes(modelId)
    },
    [favoriteModels]
  )

  const getFavoriteModels = useCallback(
    (allModels: ChatModel[]) => {
      return allModels.filter((model) => favoriteModels.includes(model.id))
    },
    [favoriteModels]
  )

  const clearFavorites = useCallback(() => {
    setFavoriteModels([])
  }, [])

  return {
    favoriteModels,
    toggleFavorite,
    isFavorite,
    getFavoriteModels,
    clearFavorites,
  }
}