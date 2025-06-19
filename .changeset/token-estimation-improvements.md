---
"z6chat": minor
---

Implement provider-specific token estimation with research-based ratios

- Add comprehensive token counting documentation for all major LLM providers
- Implement provider-specific character-to-token ratios based on extensive research:
  - OpenAI: 4.0 chars/token (tiktoken)
  - Anthropic: 2.5 chars/token (proprietary)
  - Google: 4.0 chars/token (sentencepiece)
  - DeepSeek: 4.0 chars/token (1.67 for Chinese text)
  - xAI: 3.75 chars/token (sentencepiece)
  - Meta/Llama: 4.0 chars/token (tiktoken)
  - Mistral: 4.0 chars/token (tiktoken)
- Add special CJK text detection for DeepSeek models
- Display tokenizer information in cost estimation UI
- Add utility functions to get token estimation metadata
- Include comprehensive test suite for token estimation
