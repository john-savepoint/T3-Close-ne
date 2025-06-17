export interface ImageGenerationRequest {
  prompt: string;
  model?: 'dall-e-3' | 'dall-e-2' | 'gpt-image-1';
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792' | '1024x1536' | '1536x1024';
  quality?: 'standard' | 'hd' | 'low' | 'medium' | 'high';
  style?: 'vivid' | 'natural';
  response_format?: 'url' | 'b64_json';
}

export interface ImageGenerationResponse {
  success: boolean;
  model: string;
  image: string; // base64 string or URL
  revised_prompt: string;
  size: string;
  quality: string;
  style: string;
  created: number;
  error?: string;
}

export class ImageGenerationClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/generate-image') {
    this.baseUrl = baseUrl;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to generate image`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during image generation');
    }
  }

  async generateImageWithTimeout(
    request: ImageGenerationRequest, 
    timeoutMs: number = 45000
  ): Promise<ImageGenerationResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to generate image`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Image generation timed out. Please try again.');
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Unknown error occurred during image generation');
    }
  }
}

// Utility functions
export const imageGenerationUtils = {
  /**
   * Validates if a prompt is suitable for image generation
   */
  validatePrompt: (prompt: string): { valid: boolean; error?: string } => {
    if (!prompt || typeof prompt !== 'string') {
      return { valid: false, error: 'Prompt is required' };
    }

    if (prompt.trim().length === 0) {
      return { valid: false, error: 'Prompt cannot be empty' };
    }

    if (prompt.length > 4000) {
      return { valid: false, error: 'Prompt is too long (max 4000 characters)' };
    }

    return { valid: true };
  },

  /**
   * Gets supported sizes for a given model
   */
  getSupportedSizes: (model: string): string[] => {
    switch (model) {
      case 'dall-e-2':
        return ['256x256', '512x512', '1024x1024'];
      case 'dall-e-3':
        return ['1024x1024', '1792x1024', '1024x1792'];
      case 'gpt-image-1':
        return ['1024x1024', '1024x1536', '1536x1024'];
      default:
        return ['1024x1024'];
    }
  },

  /**
   * Estimates generation time for a given model and quality
   */
  estimateGenerationTime: (model: string, quality: string): number => {
    // Times in seconds
    if (model === 'dall-e-2') return 8;
    if (model === 'dall-e-3') return quality === 'hd' ? 20 : 15;
    if (model === 'gpt-image-1') return quality === 'hd' ? 25 : 18;
    return 15;
  },

  /**
   * Converts base64 image to blob for downloading
   */
  base64ToBlob: (base64: string, mimeType: string = 'image/png'): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  },

  /**
   * Downloads an image from base64 data
   */
  downloadImage: (base64: string, filename: string = 'generated-image.png'): void => {
    const blob = imageGenerationUtils.base64ToBlob(base64);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    URL.revokeObjectURL(url);
  },

  /**
   * Optimizes a prompt for better image generation
   */
  optimizePrompt: (prompt: string): string => {
    // Add descriptive enhancements for better results
    const enhancements = {
      // Style enhancements
      photography: ['photo', 'photograph', 'real', 'realistic'].some(word => 
        prompt.toLowerCase().includes(word)
      ),
      
      // Art style detection
      artistic: ['art', 'painting', 'drawing', 'sketch', 'illustration'].some(word => 
        prompt.toLowerCase().includes(word)
      ),
    };

    let optimized = prompt;

    // Add quality descriptors if not present
    if (!prompt.toLowerCase().includes('high quality') && 
        !prompt.toLowerCase().includes('detailed')) {
      optimized += ', highly detailed, high quality';
    }

    // Add lighting information for photography
    if (enhancements.photography && 
        !prompt.toLowerCase().includes('lighting')) {
      optimized += ', professional lighting';
    }

    return optimized.trim();
  },

  /**
   * Formats error messages for user display
   */
  formatError: (error: string): string => {
    const errorMap: Record<string, string> = {
      'rate_limit_exceeded': 'Too many requests. Please wait a moment and try again.',
      'insufficient_quota': 'API quota exceeded. Please check your OpenAI usage.',
      'content_policy_violation': 'Your prompt violates content policy. Please modify your request.',
      'invalid_api_key': 'API configuration error. Please contact support.',
    };

    return errorMap[error] || error;
  }
};

// Default client instance
export const imageGenerator = new ImageGenerationClient();

// Model-specific configurations
export const modelConfigs = {
  'dall-e-3': {
    name: 'DALL-E 3',
    description: 'High-quality image generation with automatic prompt enhancement (Recommended)',
    maxPromptLength: 4000,
    supportedSizes: ['1024x1024', '1792x1024', '1024x1792'],
    supportedQualities: ['standard', 'hd'],
    supportedStyles: ['vivid', 'natural'],
    averageGenerationTime: 15,
    costMultiplier: 1.0,
    publiclyAvailable: true,
  },
  'dall-e-2': {
    name: 'DALL-E 2',
    description: 'Fast and cost-effective image generation (Legacy)',
    maxPromptLength: 1000,
    supportedSizes: ['256x256', '512x512', '1024x1024'],
    supportedQualities: ['standard'],
    supportedStyles: [],
    averageGenerationTime: 8,
    costMultiplier: 0.5,
    publiclyAvailable: true,
  },
  'gpt-image-1': {
    name: 'GPT Image 1',
    description: 'Latest ChatGPT image generation model (Requires Special Access)',
    maxPromptLength: 4000,
    supportedSizes: ['1024x1024', '1024x1536', '1536x1024'],
    supportedQualities: ['low', 'medium', 'high'],
    supportedStyles: [],
    averageGenerationTime: 18,
    costMultiplier: 1.2, // Relative to DALL-E 3
    publiclyAvailable: false,
    accessNote: 'Requires approval from OpenAI for access',
  },
} as const;

export type ModelConfig = typeof modelConfigs[keyof typeof modelConfigs];
export type SupportedModel = keyof typeof modelConfigs;