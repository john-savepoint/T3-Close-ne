import OpenAI from 'openai';

export interface ApiKeyValidationResult {
  isValid: boolean;
  error?: string;
  modelInfo?: {
    models: string[];
    provider: string;
  };
}

export interface ApiKeyConfig {
  openrouter?: string;
  openai?: string;
  anthropic?: string;
}

export class ApiKeyValidator {
  /**
   * Validate OpenRouter API key
   */
  static async validateOpenRouterKey(apiKey: string): Promise<ApiKeyValidationResult> {
    try {
      if (!apiKey.startsWith('sk-or-')) {
        return {
          isValid: false,
          error: 'OpenRouter API keys must start with "sk-or-"'
        };
      }

      const client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey,
        defaultHeaders: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'Z6Chat'
        }
      });

      // Test with a simple request
      const response = await client.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
        stream: false
      });

      return {
        isValid: true,
        modelInfo: {
          models: ['GPT-4o', 'GPT-4o Mini', 'Claude 3.5 Sonnet', 'Claude 3 Haiku', 'Gemini 2.0 Flash'],
          provider: 'OpenRouter'
        }
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: error?.message || 'Failed to validate OpenRouter API key'
      };
    }
  }

  /**
   * Validate OpenAI API key
   */
  static async validateOpenAIKey(apiKey: string): Promise<ApiKeyValidationResult> {
    try {
      if (!apiKey.startsWith('sk-')) {
        return {
          isValid: false,
          error: 'OpenAI API keys must start with "sk-"'
        };
      }

      const client = new OpenAI({
        apiKey
      });

      // Test with a simple request
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });

      return {
        isValid: true,
        modelInfo: {
          models: ['GPT-4o', 'GPT-4o Mini', 'GPT-3.5 Turbo'],
          provider: 'OpenAI'
        }
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: error?.message || 'Failed to validate OpenAI API key'
      };
    }
  }

  /**
   * Validate Anthropic API key
   */
  static async validateAnthropicKey(apiKey: string): Promise<ApiKeyValidationResult> {
    try {
      if (!apiKey.startsWith('sk-ant-')) {
        return {
          isValid: false,
          error: 'Anthropic API keys must start with "sk-ant-"'
        };
      }

      // Test with a simple request to Anthropic API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Hello' }]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          isValid: false,
          error: error.error?.message || 'Failed to validate Anthropic API key'
        };
      }

      return {
        isValid: true,
        modelInfo: {
          models: ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'Claude 3 Haiku'],
          provider: 'Anthropic'
        }
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: error?.message || 'Failed to validate Anthropic API key'
      };
    }
  }

  /**
   * Validate all API keys in config
   */
  static async validateAllKeys(config: ApiKeyConfig): Promise<Record<string, ApiKeyValidationResult>> {
    const results: Record<string, ApiKeyValidationResult> = {};

    if (config.openrouter) {
      results.openrouter = await this.validateOpenRouterKey(config.openrouter);
    }

    if (config.openai) {
      results.openai = await this.validateOpenAIKey(config.openai);
    }

    if (config.anthropic) {
      results.anthropic = await this.validateAnthropicKey(config.anthropic);
    }

    return results;
  }

  /**
   * Get API key format requirements
   */
  static getKeyRequirements() {
    return {
      openrouter: {
        format: 'sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        description: 'OpenRouter API key for multi-model access',
        url: 'https://openrouter.ai/keys'
      },
      openai: {
        format: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        description: 'OpenAI API key for GPT models',
        url: 'https://platform.openai.com/api-keys'
      },
      anthropic: {
        format: 'sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        description: 'Anthropic API key for Claude models',
        url: 'https://console.anthropic.com/keys'
      }
    };
  }
}