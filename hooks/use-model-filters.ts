"use client"

import { useReducer, useCallback } from "react"
import { MODEL_UI_CONSTANTS } from "@/lib/model-utils"

interface ModelFiltersState {
  searchQuery: string
  selectedProvider: string
  priceRange: [number, number]
  minContextLength: number
  showImageModels: boolean
  showFavoritesOnly: boolean
  showComparison: boolean
  compareModels: string[]
  open: boolean
}

type ModelFiltersAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SELECTED_PROVIDER"; payload: string }
  | { type: "SET_PRICE_RANGE"; payload: [number, number] }
  | { type: "SET_MIN_CONTEXT_LENGTH"; payload: number }
  | { type: "SET_SHOW_IMAGE_MODELS"; payload: boolean }
  | { type: "SET_SHOW_FAVORITES_ONLY"; payload: boolean }
  | { type: "SET_SHOW_COMPARISON"; payload: boolean }
  | { type: "ADD_TO_COMPARISON"; payload: string }
  | { type: "REMOVE_FROM_COMPARISON"; payload: string }
  | { type: "CLEAR_COMPARISON" }
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "RESET_FILTERS" }

const initialState: ModelFiltersState = {
  searchQuery: "",
  selectedProvider: "all",
  priceRange: MODEL_UI_CONSTANTS.DEFAULT_PRICE_RANGE,
  minContextLength: 0,
  showImageModels: false,
  showFavoritesOnly: false,
  showComparison: false,
  compareModels: [],
  open: false,
}

function modelFiltersReducer(
  state: ModelFiltersState,
  action: ModelFiltersAction
): ModelFiltersState {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload }
    case "SET_SELECTED_PROVIDER":
      return { ...state, selectedProvider: action.payload }
    case "SET_PRICE_RANGE":
      return { ...state, priceRange: action.payload }
    case "SET_MIN_CONTEXT_LENGTH":
      return { ...state, minContextLength: action.payload }
    case "SET_SHOW_IMAGE_MODELS":
      return { ...state, showImageModels: action.payload }
    case "SET_SHOW_FAVORITES_ONLY":
      return { ...state, showFavoritesOnly: action.payload }
    case "SET_SHOW_COMPARISON":
      return {
        ...state,
        showComparison: action.payload,
        compareModels: action.payload ? state.compareModels : [],
      }
    case "ADD_TO_COMPARISON":
      return {
        ...state,
        compareModels:
          state.compareModels.length < MODEL_UI_CONSTANTS.MAX_COMPARE_MODELS &&
          !state.compareModels.includes(action.payload)
            ? [...state.compareModels, action.payload]
            : state.compareModels,
      }
    case "REMOVE_FROM_COMPARISON":
      return {
        ...state,
        compareModels: state.compareModels.filter((id) => id !== action.payload),
      }
    case "CLEAR_COMPARISON":
      return { ...state, compareModels: [] }
    case "SET_OPEN":
      return { ...state, open: action.payload }
    case "RESET_FILTERS":
      return { ...initialState, open: state.open }
    default:
      return state
  }
}

interface UseModelFiltersReturn {
  state: ModelFiltersState
  actions: {
    setSearchQuery: (query: string) => void
    setSelectedProvider: (provider: string) => void
    setPriceRange: (range: [number, number]) => void
    setMinContextLength: (length: number) => void
    setShowImageModels: (show: boolean) => void
    setShowFavoritesOnly: (show: boolean) => void
    setShowComparison: (show: boolean) => void
    toggleCompareModel: (modelId: string) => void
    removeFromComparison: (modelId: string) => void
    clearComparison: () => void
    setOpen: (open: boolean) => void
    resetFilters: () => void
  }
}

export function useModelFilters(): UseModelFiltersReturn {
  const [state, dispatch] = useReducer(modelFiltersReducer, initialState)

  const actions = {
    setSearchQuery: useCallback((query: string) => {
      dispatch({ type: "SET_SEARCH_QUERY", payload: query })
    }, []),

    setSelectedProvider: useCallback((provider: string) => {
      dispatch({ type: "SET_SELECTED_PROVIDER", payload: provider })
    }, []),

    setPriceRange: useCallback((range: [number, number]) => {
      dispatch({ type: "SET_PRICE_RANGE", payload: range })
    }, []),

    setMinContextLength: useCallback((length: number) => {
      dispatch({ type: "SET_MIN_CONTEXT_LENGTH", payload: length })
    }, []),

    setShowImageModels: useCallback((show: boolean) => {
      dispatch({ type: "SET_SHOW_IMAGE_MODELS", payload: show })
    }, []),

    setShowFavoritesOnly: useCallback((show: boolean) => {
      dispatch({ type: "SET_SHOW_FAVORITES_ONLY", payload: show })
    }, []),

    setShowComparison: useCallback((show: boolean) => {
      dispatch({ type: "SET_SHOW_COMPARISON", payload: show })
    }, []),

    toggleCompareModel: useCallback(
      (modelId: string) => {
        dispatch(
          state.compareModels.includes(modelId)
            ? { type: "REMOVE_FROM_COMPARISON", payload: modelId }
            : { type: "ADD_TO_COMPARISON", payload: modelId }
        )
      },
      [state.compareModels]
    ),

    removeFromComparison: useCallback((modelId: string) => {
      dispatch({ type: "REMOVE_FROM_COMPARISON", payload: modelId })
    }, []),

    clearComparison: useCallback(() => {
      dispatch({ type: "CLEAR_COMPARISON" })
    }, []),

    setOpen: useCallback((open: boolean) => {
      dispatch({ type: "SET_OPEN", payload: open })
    }, []),

    resetFilters: useCallback(() => {
      dispatch({ type: "RESET_FILTERS" })
    }, []),
  }

  return { state, actions }
}
