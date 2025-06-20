import { NextRequest, NextResponse } from "next/server"
import { tavily } from "@tavily/core"

export async function POST(request: NextRequest) {
  try {
    const { query, maxResults = 5 } = await request.json()
    
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required and must be a string" },
        { status: 400 }
      )
    }

    const apiKey = process.env.TAVILY_API_KEY
    if (!apiKey || apiKey === "tvly-placeholder-key-add-real-key-here") {
      return NextResponse.json(
        { 
          error: "Tavily API key not configured",
          message: "Please add a valid TAVILY_API_KEY to your environment variables"
        },
        { status: 500 }
      )
    }

    // Initialize Tavily client
    const tvly = tavily({ apiKey })

    // Perform search
    const response = await tvly.search(query, {
      max_results: Math.min(maxResults, 10), // Limit to max 10 results
      include_answer: true,
      include_raw_content: false, // Set to true if you want full content
      include_images: false,
    })

    // Format the response for our chat interface
    const results = {
      query,
      answer: response.answer,
      results: response.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
        published_date: result.published_date,
      })),
      images: response.images || [],
      follow_up_questions: response.follow_up_questions || [],
      response_time: response.response_time,
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search API error:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("401") || error.message.includes("unauthorized")) {
        return NextResponse.json(
          { error: "Invalid Tavily API key" },
          { status: 401 }
        )
      }
      if (error.message.includes("429") || error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      error: "Method not allowed",
      message: "Use POST to perform a search"
    },
    { status: 405 }
  )
}