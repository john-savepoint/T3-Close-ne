import { ChatModel } from "@/types/models"

export const DEFAULT_MODELS: ChatModel[] = [
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    maxTokens: 128000,
    supportsStreaming: true,
    costPer1kTokens: {
      input: 0.15,
      output: 0.6,
    },
    description: "Fast and efficient model for most tasks",
    architecture: {
      input_modalities: ["text"],
      output_modalities: ["text"],
      tokenizer: "gpt2",
    },
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    maxTokens: 128000,
    supportsStreaming: true,
    costPer1kTokens: {
      input: 2.5,
      output: 10.0,
    },
    description: "Most capable model for complex tasks",
    architecture: {
      input_modalities: ["text", "image"],
      output_modalities: ["text"],
      tokenizer: "gpt2",
    },
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    maxTokens: 200000,
    supportsStreaming: true,
    costPer1kTokens: {
      input: 3.0,
      output: 15.0,
    },
    description: "Excellent for reasoning and analysis",
    architecture: {
      input_modalities: ["text", "image"],
      output_modalities: ["text"],
      tokenizer: "gpt2",
    },
  },
  {
    id: "google/gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    provider: "google",
    maxTokens: 1048576,
    supportsStreaming: true,
    costPer1kTokens: {
      input: 0.075,
      output: 0.3,
    },
    description: "Fast multimodal model with large context",
    architecture: {
      input_modalities: ["text", "image"],
      output_modalities: ["text"],
      tokenizer: "gpt2",
    },
  },
]

export const getDefaultModel = (): ChatModel => DEFAULT_MODELS[0]