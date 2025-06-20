import { ChatModel } from "@/types/models"

/**
 * List of popular model IDs based on industry usage and user preferences
 * These are the most commonly used models across the AI community
 */
export const POPULAR_MODEL_IDS = [
  // Google Gemini Models
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "google/gemini-flash-1.5",
  "google/gemini-pro-1.5",

  // Anthropic Claude Models
  "anthropic/claude-sonnet-4",
  "anthropic/claude-opus-4", 
  "anthropic/claude-3.5-sonnet",
  "anthropic/claude-3.7-sonnet",

  // OpenAI Models
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "openai/gpt-4-turbo",
  "openai/o1-preview",
  "openai/o1-mini",
  "openai/o3-pro",

  // DeepSeek Models
  "deepseek/deepseek-r1",
  "deepseek/deepseek-r1-0528",
  "deepseek/deepseek-chat",
  "deepseek/deepseek-coder",

  // xAI Grok Models
  "x-ai/grok-beta",
  "x-ai/grok-2",
  "x-ai/grok-2-mini",

  // Mistral Models
  "mistralai/mistral-large",
  "mistralai/mistral-medium",
  "mistralai/codestral",

  // Meta Llama Models
  "meta-llama/llama-3.1-405b-instruct",
  "meta-llama/llama-3.1-70b-instruct",
  "meta-llama/llama-3.1-8b-instruct",

  // Other Popular Models
  "qwen/qwen-2.5-72b-instruct",
  "01-ai/yi-large",
  "alibaba/qwen-max",
]

/**
 * Get popular models from a list of available models
 * @param allModels - Array of all available ChatModel objects
 * @returns Array of popular ChatModel objects found in the available models
 */
export function getPopularModels(allModels: ChatModel[]): ChatModel[] {
  const modelMap = new Map(allModels.map(model => [model.id, model]))
  
  return POPULAR_MODEL_IDS
    .map(id => modelMap.get(id))
    .filter((model): model is ChatModel => model !== undefined)
}

/**
 * Check if a model is considered popular
 * @param modelId - The model ID to check
 * @returns boolean indicating if the model is popular
 */
export function isPopularModel(modelId: string): boolean {
  return POPULAR_MODEL_IDS.includes(modelId)
}

/**
 * Get popular models grouped by provider
 * @param allModels - Array of all available ChatModel objects
 * @returns Object with provider names as keys and arrays of popular models as values
 */
export function getPopularModelsByProvider(allModels: ChatModel[]): Record<string, ChatModel[]> {
  const popularModels = getPopularModels(allModels)
  
  return popularModels.reduce((acc, model) => {
    const provider = model.provider
    if (!acc[provider]) {
      acc[provider] = []
    }
    acc[provider].push(model)
    return acc
  }, {} as Record<string, ChatModel[]>)
}

/**
 * Provider display names for better UX
 */
export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  "google": "Google",
  "anthropic": "Anthropic", 
  "openai": "OpenAI",
  "deepseek": "DeepSeek",
  "x-ai": "xAI (Grok)",
  "mistralai": "Mistral AI",
  "meta-llama": "Meta (Llama)",
  "qwen": "Qwen",
  "01-ai": "01.AI",
  "alibaba": "Alibaba",
}

/**
 * Get formatted provider name for display
 * @param provider - The provider key
 * @returns Formatted provider name
 */
export function getProviderDisplayName(provider: string): string {
  return PROVIDER_DISPLAY_NAMES[provider] || provider
}