import { 
  estimateTokens, 
  estimateConversationTokens, 
  getProviderTokenRatio,
  getTokenEstimationInfo 
} from '../lib/token-utils'

describe('Token Estimation Utils', () => {
  describe('estimateTokens', () => {
    const testText = "Hello, world! This is a test message."
    
    it('should use provider-specific ratios', () => {
      // OpenAI (4 chars/token)
      const openaiTokens = estimateTokens(testText, 'openai/gpt-4')
      expect(openaiTokens).toBeGreaterThan(8) // ~37 chars / 4 = 9.25 base tokens
      
      // Anthropic (2.5 chars/token)
      const anthropicTokens = estimateTokens(testText, 'anthropic/claude-3')
      expect(anthropicTokens).toBeGreaterThan(14) // ~37 chars / 2.5 = 14.8 base tokens
      
      // Should have different counts
      expect(anthropicTokens).toBeGreaterThan(openaiTokens)
    })
    
    it('should handle punctuation correctly', () => {
      const textWithPunctuation = "Hello! How are you? I'm fine, thanks."
      const tokens = estimateTokens(textWithPunctuation, 'openai/gpt-4')
      // Should account for punctuation tokens
      expect(tokens).toBeGreaterThan(10)
    })
    
    it('should handle CJK text for DeepSeek', () => {
      const chineseText = "你好世界，这是一个测试消息。"
      const englishText = "Hello world, this is a test message."
      
      const chineseTokens = estimateTokens(chineseText, 'deepseek/deepseek-v2')
      const englishTokens = estimateTokens(englishText, 'deepseek/deepseek-v2')
      
      // Chinese should use more tokens per character
      const chineseRatio = chineseTokens / chineseText.length
      const englishRatio = englishTokens / englishText.length
      
      expect(chineseRatio).toBeGreaterThan(englishRatio)
    })
    
    it('should handle empty text', () => {
      expect(estimateTokens('')).toBe(0)
      expect(estimateTokens('', 'openai/gpt-4')).toBe(0)
    })
    
    it('should return at least 1 token for non-empty text', () => {
      expect(estimateTokens('a')).toBeGreaterThanOrEqual(1)
      expect(estimateTokens('.')).toBeGreaterThanOrEqual(1)
    })
  })
  
  describe('estimateConversationTokens', () => {
    it('should include message overhead', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' }
      ]
      
      const totalTokens = estimateConversationTokens(messages, 'openai/gpt-4')
      const contentTokens = estimateTokens('Hello', 'openai/gpt-4') + 
                           estimateTokens('Hi there', 'openai/gpt-4')
      
      // Should include overhead (4 tokens per message)
      expect(totalTokens).toBe(contentTokens + 8)
    })
  })
  
  describe('getProviderTokenRatio', () => {
    it('should return correct ratios for known providers', () => {
      expect(getProviderTokenRatio('openai')).toBe(4.0)
      expect(getProviderTokenRatio('anthropic')).toBe(2.5)
      expect(getProviderTokenRatio('google')).toBe(4.0)
      expect(getProviderTokenRatio('x-ai')).toBe(3.75)
    })
    
    it('should return default ratio for unknown providers', () => {
      expect(getProviderTokenRatio('unknown-provider')).toBe(4.0)
    })
    
    it('should handle case insensitivity', () => {
      expect(getProviderTokenRatio('OpenAI')).toBe(4.0)
      expect(getProviderTokenRatio('ANTHROPIC')).toBe(2.5)
    })
  })
  
  describe('getTokenEstimationInfo', () => {
    it('should return complete token info for models', () => {
      const info = getTokenEstimationInfo('openai/gpt-4')
      
      expect(info).toEqual({
        provider: 'openai',
        charsPerToken: 4.0,
        tokenizer: 'tiktoken',
        accuracy: 'high'
      })
    })
    
    it('should handle different providers correctly', () => {
      const anthropicInfo = getTokenEstimationInfo('anthropic/claude-3')
      expect(anthropicInfo.tokenizer).toBe('proprietary')
      expect(anthropicInfo.accuracy).toBe('medium')
      
      const llamaInfo = getTokenEstimationInfo('meta-llama/llama-3')
      expect(llamaInfo.tokenizer).toBe('tiktoken')
      expect(llamaInfo.accuracy).toBe('high')
    })
    
    it('should handle unknown providers', () => {
      const info = getTokenEstimationInfo('unknown/model')
      
      expect(info).toEqual({
        provider: 'unknown',
        charsPerToken: 4.0,
        tokenizer: 'unknown',
        accuracy: 'low'
      })
    })
  })
})

// Example usage demonstrations
describe('Token Estimation Examples', () => {
  it('should demonstrate cost calculation accuracy', () => {
    const prompt = "Write a detailed blog post about machine learning"
    
    // Different providers will have different token counts
    const providers = [
      { id: 'openai/gpt-4', name: 'GPT-4' },
      { id: 'anthropic/claude-3', name: 'Claude 3' },
      { id: 'google/gemini-pro', name: 'Gemini Pro' },
      { id: 'mistral/mistral-large', name: 'Mistral Large' }
    ]
    
    const estimates = providers.map(provider => ({
      provider: provider.name,
      tokens: estimateTokens(prompt, provider.id),
      info: getTokenEstimationInfo(provider.id)
    }))
    
    // Log for documentation
    console.log('Token estimates for prompt:', prompt)
    estimates.forEach(est => {
      console.log(`${est.provider}: ${est.tokens} tokens (${est.info.charsPerToken} chars/token)`)
    })
    
    // Verify different providers give different estimates
    const tokenCounts = estimates.map(e => e.tokens)
    expect(new Set(tokenCounts).size).toBeGreaterThan(1)
  })
})