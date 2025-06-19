# Token Counting Documentation for LLM Providers

This document provides comprehensive information about how different LLM providers count tokens, their tokenization methods, and character-to-token ratios for more accurate token estimation.

## Overview

Tokens are the basic units that AI models use to process text. They can be words, parts of words, or even individual characters, depending on the model's tokenization scheme. Understanding token counting is crucial for:

- Cost estimation (as usage is priced by token)
- Staying within model context limits
- Optimizing prompt efficiency

## Provider-Specific Token Counting

### OpenAI (GPT-4, GPT-3.5, GPT-4o)

**Tokenizer**: Tiktoken (open-source BPE tokenizer)

**Encoding Types**:

- `o200k_base`: GPT-4o, GPT-4o-mini
- `cl100k_base`: GPT-4-turbo, GPT-4, GPT-3.5-turbo
- `p50k_base`: Codex models, text-davinci-002/003
- `r50k_base`: GPT-3 models

**Character-to-Token Ratio**: ~4 characters per token (English)

**Key Points**:

- Punctuation marks count as 1 token each
- Special characters: 1-3 tokens
- Emojis: 2-3 tokens
- Chat messages have overhead: 3 tokens per message + 1 token per name

### Anthropic (Claude 3, Claude 2)

**Tokenizer**: Proprietary (not publicly released)

**Character-to-Token Ratio**: ~2.5 characters per token

**Key Points**:

- No public tokenizer available
- Must use official API endpoint for accurate counting
- API tokens = text tokens + 3 (for start/end tokens)
- Token count endpoint is free but rate-limited

### Google (Gemini)

**Tokenizer**: SentencePiece-based

**Character-to-Token Ratio**: ~4 characters per token

**Key Points**:

- 100 tokens ≈ 60-80 English words
- Audio content: ~32 tokens per second
- Count Tokens API available with no charge
- Maximum 3000 requests per minute

### DeepSeek (DeepSeek-V2, DeepSeek-V3)

**Tokenizer**: Custom tokenizer with 128,000 token vocabulary

**Character-to-Token Ratios**:

- English: ~4 characters per token
- Chinese: ~1.67 characters per token

**Key Points**:

- 100-word English sentence ≈ 133 tokens
- 100-character Chinese sentence ≈ 60 tokens
- Actual tokens determined by model processing

### xAI (Grok)

**Tokenizer**: SentencePiece with 131,072 token vocabulary

**Character-to-Token Ratio**: ~3.75 characters per token

**Key Points**:

- 1 million tokens ≈ 750,000 words
- Context windows: 128K tokens (Grok-1.5), 1M tokens (Grok-3)
- Common words are single tokens
- Less common words split into multiple tokens

### Meta (Llama 3)

**Tokenizer**: Tiktoken-based BPE (128,256 token vocabulary)

**Character-to-Token Ratio**: ~4 characters per token

**Key Points**:

- More efficient than Llama 2's SentencePiece tokenizer
- Particularly efficient for code tokenization
- Special tokens for conversation structure
- Open-source implementation available

### Mistral AI

**Tokenizer**: Tekken (Tiktoken-based BPE)

**Character-to-Token Ratio**: ~4 characters per token (English)

**Key Points**:

- 30% more efficient for non-English European languages
- 2-3x more efficient for Korean and Arabic
- Byte-fallback BPE prevents out-of-vocabulary tokens
- Open-source tokenizer available

## Token Estimation Formula

For accurate token estimation, we use provider-specific ratios:

```typescript
const PROVIDER_TOKEN_RATIOS = {
  // Characters per token
  openai: 4.0,
  anthropic: 2.5,
  google: 4.0,
  deepseek: 4.0, // English, 1.67 for Chinese
  "x-ai": 3.75,
  meta: 4.0,
  "meta-llama": 4.0,
  mistral: 4.0,
  mistralai: 4.0,
  // Default fallback
  default: 4.0,
}
```

## Best Practices for Token Counting

1. **Use Official Tools When Available**:

   - OpenAI: Tiktoken library
   - Anthropic: Count tokens API endpoint
   - Google: CountTokens API
   - DeepSeek: Official tokenizer package

2. **Consider Language Differences**:

   - Non-English text often uses more tokens
   - Chinese/Japanese/Korean can vary significantly
   - Code tokenization differs from natural language

3. **Account for Special Formatting**:

   - Chat messages have token overhead
   - System prompts add tokens
   - Function/tool definitions consume tokens

4. **Plan for Variability**:
   - Actual token counts may differ slightly
   - Always leave buffer for context limits
   - Monitor usage through API responses

## Implementation Guidelines

When implementing token counting:

1. Identify the model provider from the model ID
2. Apply the appropriate character-to-token ratio
3. Add overhead for chat formatting if applicable
4. Consider special characters and formatting
5. Provide estimates with appropriate disclaimers

## References

- [OpenAI Tokenizer Documentation](https://platform.openai.com/tokenizer)
- [Anthropic Token Counting API](https://docs.anthropic.com/en/docs/build-with-claude/token-counting)
- [Google Gemini Token Counting](https://ai.google.dev/gemini-api/docs/tokens)
- [DeepSeek API Documentation](https://api-docs.deepseek.com/quick_start/token_usage)
- [xAI Documentation](https://docs.x.ai/docs/consumption-and-rate-limits)
- [Meta Llama 3 Repository](https://github.com/meta-llama/llama3)
- [Mistral Tokenization Guide](https://docs.mistral.ai/guides/tokenization/)
