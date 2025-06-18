import OpenAI from "openai"

export interface ApiKeyValidationResult {
  isValid: boolean
  error?: string
  modelInfo?: {
    models: string[]
    provider: string
  }
}

export interface ApiKeyConfig {
  openrouter?: string
  openai?: string
  anthropic?: string
}

export class ApiKeyValidator {
  /**
   * Validate OpenRouter API key
   */
  static async validateOpenRouterKey(apiKey: string): Promise<ApiKeyValidationResult> {
    try {
      if (!apiKey.startsWith("sk-or-v1-")) {
        return {
          isValid: false,
          error: 'OpenRouter API keys must start with "sk-or-v1-"',
        }
      }

      const client = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
        timeout: 10000, // 10 second timeout
        defaultHeaders: {
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "Z6Chat",
        },
      })

      // Test with a minimal request
      const response = await client.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 1,
        temperature: 0,
        stream: false,
      })

      return {
        isValid: true,
        modelInfo: {
          models: [
            "GPT-4o",
            "GPT-4o Mini",
            "Claude 3.5 Sonnet",
            "Claude 3 Haiku",
            "Gemini 2.0 Flash",
          ],
          provider: "OpenRouter",
        },
      }
    } catch (error: any) {
      // Enhanced error handling
      let errorMessage = "Failed to validate OpenRouter API key"

      if (error?.status === 401) {
        errorMessage = "Invalid OpenRouter API key or insufficient permissions"
      } else if (error?.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later"
      } else if (error?.status === 403) {
        errorMessage = "API key does not have access to required models"
      } else if (error?.code === "ENOTFOUND" || error?.code === "ECONNREFUSED") {
        errorMessage = "Network error. Please check your connection"
      } else if (error?.message) {
        errorMessage = error.message
      }

      return {
        isValid: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Validate OpenAI API key
   */
  static async validateOpenAIKey(apiKey: string): Promise<ApiKeyValidationResult> {
    try {
      // Enhanced format validation
      if (!apiKey.startsWith("sk-") || apiKey.length < 48) {
        return {
          isValid: false,
          error: 'OpenAI API keys must start with "sk-" and be at least 48 characters long',
        }
      }

      const client = new OpenAI({
        apiKey,
        timeout: 10000, // 10 second timeout for validation
      })

      // Test with a minimal request
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 1,
        temperature: 0,
      })

      return {
        isValid: true,
        modelInfo: {
          models: ["GPT-4o", "GPT-4o Mini", "GPT-4 Turbo", "GPT-3.5 Turbo"],
          provider: "OpenAI",
        },
      }
    } catch (error: any) {
      // Enhanced error handling
      let errorMessage = "Failed to validate OpenAI API key"

      if (error?.status === 401) {
        errorMessage = "Invalid API key or insufficient permissions"
      } else if (error?.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later"
      } else if (error?.status === 403) {
        errorMessage = "API key does not have access to chat completions"
      } else if (error?.code === "ENOTFOUND" || error?.code === "ECONNREFUSED") {
        errorMessage = "Network error. Please check your connection"
      } else if (error?.message) {
        errorMessage = error.message
      }

      return {
        isValid: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Validate Anthropic API key
   */
  static async validateAnthropicKey(apiKey: string): Promise<ApiKeyValidationResult> {
    try {
      // Enhanced format validation
      if (!apiKey.startsWith("sk-ant-") || apiKey.length < 40) {
        return {
          isValid: false,
          error: 'Anthropic API keys must start with "sk-ant-" and be at least 40 characters long',
        }
      }

      // Test with a simple request to Anthropic API using the latest stable model
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022", // Updated to latest stable model
          max_tokens: 1,
          messages: [{ role: "user", content: "test" }],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        let errorMessage = "Failed to validate Anthropic API key"

        if (response.status === 401) {
          errorMessage = "Invalid API key or insufficient permissions"
        } else if (response.status === 429) {
          errorMessage = "Rate limit exceeded. Please try again later"
        } else if (response.status === 403) {
          errorMessage = "API key does not have access to Claude models"
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message
        }

        return {
          isValid: false,
          error: errorMessage,
        }
      }

      return {
        isValid: true,
        modelInfo: {
          models: ["Claude 3.5 Sonnet", "Claude 3.5 Haiku", "Claude 3 Opus", "Claude 3 Haiku"],
          provider: "Anthropic",
        },
      }
    } catch (error: any) {
      let errorMessage = "Failed to validate Anthropic API key"

      if (error?.code === "ENOTFOUND" || error?.code === "ECONNREFUSED") {
        errorMessage = "Network error. Please check your connection"
      } else if (error?.message) {
        errorMessage = error.message
      }

      return {
        isValid: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Validate all API keys in config
   */
  static async validateAllKeys(
    config: ApiKeyConfig
  ): Promise<Record<string, ApiKeyValidationResult>> {
    const results: Record<string, ApiKeyValidationResult> = {}

    if (config.openrouter) {
      results.openrouter = await this.validateOpenRouterKey(config.openrouter)
    }

    if (config.openai) {
      results.openai = await this.validateOpenAIKey(config.openai)
    }

    if (config.anthropic) {
      results.anthropic = await this.validateAnthropicKey(config.anthropic)
    }

    return results
  }

  /**
   * Get API key format requirements
   */
  static getKeyRequirements() {
    return {
      openrouter: {
        format: "sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        description: "OpenRouter API key for multi-model access",
        url: "https://openrouter.ai/keys",
      },
      openai: {
        format: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        description: "OpenAI API key for GPT models",
        url: "https://platform.openai.com/api-keys",
      },
      anthropic: {
        format: "sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        description: "Anthropic API key for Claude models",
        url: "https://console.anthropic.com/keys",
      },
    }
  }
}
