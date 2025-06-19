---
"z6chat": minor
---

feat(search): add web search integration for all models via Tavily API

- Implement unified web search functionality using Tavily API for all non-Gemini models
- Add web search toggle in chat input interface for all models (previously disabled)
- Create two-step RAG flow: web search → LLM augmentation for real-time information access
- Add WebSearchService class with proper error handling and fallback mechanisms
- Include web search metadata in API responses for future source citation features
- Support search context injection with formatted prompt engineering for optimal results
- Add environment configuration for TAVILY_API_KEY in .env.local.example
- Extend chat message types to support web search sources and metadata
- Provide utility functions for native web search detection and automatic triggering
- Enable competitive parity with services like Perplexity for current information access