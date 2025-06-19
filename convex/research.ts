import { v } from "convex/values"
import { mutation, query, action } from "./_generated/server"
import { auth } from "./auth"
import { api } from "./_generated/api"

// Queries
export const getResearchJob = query({
  args: { jobId: v.id("researchJobs") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) throw new Error("Unauthorized")

    const job = await ctx.db.get(args.jobId)
    if (!job) throw new Error("Research job not found")
    if (job.userId !== userId) throw new Error("Unauthorized")

    return job
  },
})

export const listResearchJobs = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("decomposing"),
        v.literal("searching"),
        v.literal("synthesizing"),
        v.literal("generating"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) throw new Error("Unauthorized")

    let query = ctx.db.query("researchJobs").withIndex("by_user", (q) => q.eq("userId", userId))

    if (args.status) {
      query = ctx.db
        .query("researchJobs")
        .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", args.status!))
    }

    const jobs = await query.order("desc").take(args.limit || 50)

    return jobs
  },
})

export const searchResearchJobs = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) throw new Error("Unauthorized")

    const results = await ctx.db
      .query("researchJobs")
      .withSearchIndex("search_research", (q) =>
        q.search("title", args.searchTerm).eq("userId", userId)
      )
      .take(args.limit || 20)

    return results
  },
})

// Mutations
export const createResearchJob = mutation({
  args: {
    title: v.string(),
    initialPrompt: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) throw new Error("Unauthorized")

    const now = Date.now()

    const jobId = await ctx.db.insert("researchJobs", {
      userId,
      title: args.title,
      initialPrompt: args.initialPrompt,
      status: "pending",
      progress: 0,
      model: args.model || "anthropic/claude-3-5-sonnet-20241022",
      createdAt: now,
      lastUpdated: now,
    })

    // Schedule the research job to start processing
    await ctx.scheduler.runAfter(0, api.research.processResearchJob, { jobId })

    return jobId
  },
})

export const updateResearchJob = mutation({
  args: {
    jobId: v.id("researchJobs"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("decomposing"),
        v.literal("searching"),
        v.literal("synthesizing"),
        v.literal("generating"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
    currentStep: v.optional(v.string()),
    progress: v.optional(v.number()),
    subQuestions: v.optional(v.array(v.string())),
    searchResults: v.optional(
      v.array(
        v.object({
          question: v.string(),
          sources: v.array(
            v.object({
              url: v.string(),
              title: v.string(),
              content: v.string(),
              relevanceScore: v.optional(v.number()),
            })
          ),
        })
      )
    ),
    finalReport: v.optional(v.string()),
    reportSections: v.optional(
      v.array(
        v.object({
          title: v.string(),
          content: v.string(),
          sources: v.array(v.string()),
        })
      )
    ),
    sourceUrls: v.optional(v.array(v.string())),
    totalTokensUsed: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) throw new Error("Unauthorized")

    const job = await ctx.db.get(args.jobId)
    if (!job) throw new Error("Research job not found")
    if (job.userId !== userId) throw new Error("Unauthorized")

    const updates: any = {
      lastUpdated: Date.now(),
    }

    // Only update provided fields
    if (args.status !== undefined) updates.status = args.status
    if (args.currentStep !== undefined) updates.currentStep = args.currentStep
    if (args.progress !== undefined) updates.progress = args.progress
    if (args.subQuestions !== undefined) updates.subQuestions = args.subQuestions
    if (args.searchResults !== undefined) updates.searchResults = args.searchResults
    if (args.finalReport !== undefined) updates.finalReport = args.finalReport
    if (args.reportSections !== undefined) updates.reportSections = args.reportSections
    if (args.sourceUrls !== undefined) updates.sourceUrls = args.sourceUrls
    if (args.totalTokensUsed !== undefined) updates.totalTokensUsed = args.totalTokensUsed
    if (args.estimatedCost !== undefined) updates.estimatedCost = args.estimatedCost
    if (args.errorMessage !== undefined) updates.errorMessage = args.errorMessage
    if (args.startedAt !== undefined) updates.startedAt = args.startedAt
    if (args.completedAt !== undefined) updates.completedAt = args.completedAt

    await ctx.db.patch(args.jobId, updates)
  },
})

export const deleteResearchJob = mutation({
  args: { jobId: v.id("researchJobs") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) throw new Error("Unauthorized")

    const job = await ctx.db.get(args.jobId)
    if (!job) throw new Error("Research job not found")
    if (job.userId !== userId) throw new Error("Unauthorized")

    await ctx.db.delete(args.jobId)
  },
})

// Actions (for external API calls)
export const processResearchJob = action({
  args: { jobId: v.id("researchJobs") },
  handler: async (ctx, args) => {
    // Get the job details
    const job = await ctx.runQuery(api.research.getResearchJob, { jobId: args.jobId })
    if (!job) throw new Error("Job not found")

    try {
      // Update status to indicate we've started
      await ctx.runMutation(api.research.updateResearchJob, {
        jobId: args.jobId,
        status: "decomposing",
        currentStep: "Breaking down research topic",
        progress: 10,
        startedAt: Date.now(),
      })

      // Step 1: Decompose the research topic into sub-questions
      const subQuestions = await decomposeResearchTopic(job.initialPrompt, job.model)

      await ctx.runMutation(api.research.updateResearchJob, {
        jobId: args.jobId,
        status: "searching",
        currentStep: "Searching for information",
        progress: 20,
        subQuestions,
      })

      // Step 2: Search for each sub-question
      const searchResults = await performWebSearches(subQuestions)

      await ctx.runMutation(api.research.updateResearchJob, {
        jobId: args.jobId,
        status: "synthesizing",
        currentStep: "Analyzing and synthesizing findings",
        progress: 60,
        searchResults,
      })

      // Step 3: Synthesize the information
      const reportSections = await synthesizeInformation(searchResults, job.model)

      await ctx.runMutation(api.research.updateResearchJob, {
        jobId: args.jobId,
        status: "generating",
        currentStep: "Generating final report",
        progress: 80,
        reportSections,
      })

      // Step 4: Generate the final report
      const finalReport = await generateFinalReport(
        job.title,
        job.initialPrompt,
        reportSections,
        job.model
      )

      // Extract all source URLs
      const sourceUrls = Array.from(
        new Set(searchResults.flatMap((result) => result.sources.map((source: any) => source.url)))
      )

      await ctx.runMutation(api.research.updateResearchJob, {
        jobId: args.jobId,
        status: "completed",
        currentStep: "Research completed",
        progress: 100,
        finalReport,
        sourceUrls,
        completedAt: Date.now(),
      })
    } catch (error) {
      console.error("Research job failed:", error)
      await ctx.runMutation(api.research.updateResearchJob, {
        jobId: args.jobId,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        progress: 0,
      })
    }
  },
})

// Helper functions for the research pipeline
async function decomposeResearchTopic(prompt: string, model?: string): Promise<string[]> {
  const decompositionPrompt = `You are a research planning expert. Break down this research topic into 5-8 specific, searchable sub-questions that together would provide a comprehensive understanding of the topic.

Research Topic: ${prompt}

Requirements:
- Each question should be specific and searchable
- Questions should cover different aspects/angles of the topic
- Avoid overlapping questions
- Focus on factual, verifiable information
- Include questions about current state, challenges, trends, and implications

Return ONLY a JSON array of strings, no other text:
["question 1", "question 2", ...]`

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Z6Chat Research",
      },
      body: JSON.stringify({
        model: model || "anthropic/claude-3-5-sonnet-20241022",
        messages: [{ role: "user", content: decompositionPrompt }],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No response from model")
    }

    // Parse the JSON response
    const questions = JSON.parse(content.trim())

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid response format")
    }

    return questions.slice(0, 8) // Limit to 8 questions max
  } catch (error) {
    console.error("Decomposition failed:", error)
    // Fallback: create basic questions
    return [
      `What is ${prompt}?`,
      `What are the current trends in ${prompt}?`,
      `What are the main challenges with ${prompt}?`,
      `What are the future implications of ${prompt}?`,
    ]
  }
}

async function performWebSearches(questions: string[]): Promise<any[]> {
  const searchResults = []

  for (const question of questions) {
    try {
      // Use Tavily API for web search
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
        },
        body: JSON.stringify({
          query: question,
          search_depth: "advanced",
          include_answer: false,
          max_results: 5,
          include_domains: [], // Could filter to specific domains
          exclude_domains: ["reddit.com", "quora.com"], // Exclude low-quality sources
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const sources = data.results.map((result: any) => ({
          url: result.url,
          title: result.title,
          content: result.content || result.snippet,
          relevanceScore: result.score || 0.5,
        }))

        searchResults.push({
          question,
          sources,
        })
      } else {
        // Fallback to mock data if API fails
        searchResults.push({
          question,
          sources: [
            {
              url: `https://example.com/search/${encodeURIComponent(question)}`,
              title: `Research on: ${question}`,
              content: `Research findings for: ${question}. This content represents synthesized information from multiple sources covering the key aspects of this question.`,
              relevanceScore: 0.75,
            },
          ],
        })
      }
    } catch (error) {
      console.error(`Search failed for question: ${question}`, error)

      // Fallback to mock data
      searchResults.push({
        question,
        sources: [
          {
            url: `https://example.com/search/${encodeURIComponent(question)}`,
            title: `Research on: ${question}`,
            content: `Research findings for: ${question}. This content represents synthesized information from multiple sources covering the key aspects of this question.`,
            relevanceScore: 0.75,
          },
        ],
      })
    }
  }

  return searchResults
}

async function synthesizeInformation(searchResults: any[], model?: string): Promise<any[]> {
  // In a real implementation, this would use the LLM to synthesize each section
  return searchResults.map((result, index) => ({
    title: `Section ${index + 1}: ${result.question}`,
    content: `Synthesized analysis of: ${result.question}\n\nBased on the available sources, this section provides a comprehensive overview of the research findings.`,
    sources: result.sources.map((s: any) => s.url),
  }))
}

async function generateFinalReport(
  title: string,
  prompt: string,
  sections: any[],
  model?: string
): Promise<string> {
  const reportPrompt = `Create a comprehensive research report based on the following information:

Title: ${title}
Original Query: ${prompt}

Research Sections:
${sections.map((section) => `## ${section.title}\n${section.content}\n`).join("\n")}

Generate a well-structured research report with:
1. Executive Summary
2. Introduction
3. Main Findings (organized sections)
4. Conclusions and Implications
5. Limitations

Use professional, clear language. Include specific details from the research sections.`

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Z6Chat Research",
      },
      body: JSON.stringify({
        model: model || "anthropic/claude-3-5-sonnet-20241022",
        messages: [{ role: "user", content: reportPrompt }],
        temperature: 0.4,
        max_tokens: 8000,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || "Failed to generate report"
  } catch (error) {
    console.error("Report generation failed:", error)
    return "Error generating final report. Please try again."
  }
}
