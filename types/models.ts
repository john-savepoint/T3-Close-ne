export interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider: {
    max_completion_tokens?: number;
    is_moderated: boolean;
  };
  per_request_limits?: {
    prompt_tokens: string;
    completion_tokens: string;
  };
}

export interface ModelProvider {
  id: string;
  name: string;
  description?: string;
  models: OpenRouterModel[];
}

export interface ChatModel {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  supportsStreaming: boolean;
  costPer1kTokens: {
    input: number;
    output: number;
  };
}

export interface ModelSelection {
  selectedModel: ChatModel;
  availableModels: ChatModel[];
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  created: number;
  object: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export type SupportedModel = 
  | "openai/gpt-4o"
  | "openai/gpt-4o-mini" 
  | "anthropic/claude-3.5-sonnet"
  | "anthropic/claude-3-haiku"
  | "google/gemini-2.0-flash-exp"
  | "meta-llama/llama-3.1-8b-instruct"
  | "mistralai/mistral-7b-instruct"
  | "cohere/command-r-plus";

export const DEFAULT_MODELS: ChatModel[] = [
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    maxTokens: 128000,
    supportsStreaming: true,
    costPer1kTokens: { input: 0.005, output: 0.015 }
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI", 
    maxTokens: 128000,
    supportsStreaming: true,
    costPer1kTokens: { input: 0.00015, output: 0.0006 }
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    maxTokens: 200000,
    supportsStreaming: true,
    costPer1kTokens: { input: 0.003, output: 0.015 }
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    maxTokens: 200000,
    supportsStreaming: true,
    costPer1kTokens: { input: 0.00025, output: 0.00125 }
  },
  {
    id: "google/gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    maxTokens: 1000000,
    supportsStreaming: true,
    costPer1kTokens: { input: 0.000075, output: 0.0003 }
  }
];