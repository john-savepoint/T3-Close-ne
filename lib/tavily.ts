import { TavilyClient } from "tavily"

export interface WebSearchResult {
  title: string
  url: string
  content: string
  score: number
}

export interface SearchContext {
  query: string
  results: WebSearchResult[]
  sources: Array<{
    title: string
    url: string
  }>
}

export class WebSearchService {
  private client: TavilyClient

  constructor(apiKey?: string) {
    const key = apiKey || process.env.TAVILY_API_KEY
    if (!key) {
      throw new Error("Tavily API key is required for web search functionality")
    }
    this.client = new TavilyClient({ apiKey: key })
  }

  async search(query: string, maxResults: number = 5): Promise<SearchContext> {
    try {
      const response = await this.client.search({
        query,
        search_depth: "basic",
        include_answer: false,
        include_images: false,
        max_results: maxResults,
        exclude_domains: ["twitter.com", "x.com"], // Exclude social media for cleaner results
      })

      const results: WebSearchResult[] = response.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score || 0,
      }))

      const sources = results.map((result) => ({
        title: result.title,
        url: result.url,
      }))

      return {
        query,
        results,
        sources,
      }
    } catch (error) {
      console.error("Tavily search error:", error)
      throw new Error(
        `Web search failed: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  formatSearchContextForLLM(searchContext: SearchContext): string {
    const { query, results } = searchContext

    let context = "--- WEB SEARCH RESULTS ---\n"
    context += `Query: ${query}\n\n`

    results.forEach((result, index) => {
      context += `[${index + 1}] Title: ${result.title}\n`
      context += `URL: ${result.url}\n`
      context += `Content: ${result.content}\n\n`
    })

    context += "--- END WEB SEARCH RESULTS ---\n\n"
    context +=
      "Instructions: Use the above web search results to answer the user's question. Cite your sources using the provided URLs. If the information is not sufficient or relevant, say so clearly."

    return context
  }

  createAugmentedPrompt(originalPrompt: string, searchContext: SearchContext): string {
    const searchContextText = this.formatSearchContextForLLM(searchContext)

    return `${searchContextText}\n\nUser Question: ${originalPrompt}`
  }
}

// Utility function to check if a model supports web search natively
export function supportsNativeWebSearch(modelId: string): boolean {
  return modelId.includes("google/gemini")
}

// Utility function to determine if web search should be triggered automatically
export function shouldTriggerWebSearch(prompt: string): boolean {
  const webSearchKeywords = [
    "current",
    "recent",
    "latest",
    "today",
    "yesterday",
    "this week",
    "this month",
    "this year",
    "news",
    "update",
    "what happened",
    "breaking",
    "price",
    "stock",
    "2024",
    "2025",
    "now",
    "currently",
    "live",
    "real-time",
  ]

  const lowerPrompt = prompt.toLowerCase()
  return webSearchKeywords.some((keyword) => lowerPrompt.includes(keyword))
}
