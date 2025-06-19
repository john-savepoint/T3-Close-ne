import { Id } from "@/convex/_generated/dataModel"

export type ResearchJobStatus =
  | "pending"
  | "decomposing"
  | "searching"
  | "synthesizing"
  | "generating"
  | "completed"
  | "failed"

export interface ResearchSource {
  url: string
  title: string
  content: string
  relevanceScore?: number
}

export interface ResearchSearchResult {
  question: string
  sources: ResearchSource[]
}

export interface ResearchReportSection {
  title: string
  content: string
  sources: string[]
}

export interface ResearchJob {
  _id: Id<"researchJobs">
  userId: Id<"users">
  title: string
  initialPrompt: string
  status: ResearchJobStatus
  currentStep?: string
  progress: number
  subQuestions?: string[]
  searchResults?: ResearchSearchResult[]
  finalReport?: string
  reportSections?: ResearchReportSection[]
  sourceUrls?: string[]
  model?: string
  totalTokensUsed?: number
  estimatedCost?: number
  errorMessage?: string
  createdAt: number
  startedAt?: number
  completedAt?: number
  lastUpdated: number
}

export interface CreateResearchJobRequest {
  title: string
  initialPrompt: string
  model?: string
}

export interface ResearchJobUpdate {
  status?: ResearchJobStatus
  currentStep?: string
  progress?: number
  subQuestions?: string[]
  searchResults?: ResearchSearchResult[]
  finalReport?: string
  reportSections?: ResearchReportSection[]
  sourceUrls?: string[]
  totalTokensUsed?: number
  estimatedCost?: number
  errorMessage?: string
  startedAt?: number
  completedAt?: number
}

export interface ResearchProgressEvent {
  jobId: Id<"researchJobs">
  status: ResearchJobStatus
  currentStep?: string
  progress: number
  message?: string
}

export interface DecompositionResult {
  subQuestions: string[]
  estimatedComplexity: "low" | "medium" | "high"
  estimatedTime: number // minutes
}

export interface SearchQuery {
  question: string
  query: string
  maxResults?: number
}

export interface WebSearchResult {
  url: string
  title: string
  snippet: string
  content?: string
  publishedDate?: string
  domain: string
}

export interface SynthesisInput {
  question: string
  sources: ResearchSource[]
  context?: string
}

export interface SynthesisResult {
  summary: string
  keyPoints: string[]
  conflictingInfo?: string[]
  confidence: number // 0-1
  sources: string[]
}

export interface ReportGenerationInput {
  title: string
  prompt: string
  sections: Array<{
    title: string
    content: string
    sources: string[]
  }>
  allSources: string[]
}

export interface ReportGenerationResult {
  title: string
  executiveSummary: string
  sections: ResearchReportSection[]
  conclusion: string
  limitations?: string
  recommendations?: string[]
  allSources: string[]
}

export interface ResearchConfig {
  maxSubQuestions: number
  maxSourcesPerQuestion: number
  maxSearchRetries: number
  searchTimeout: number
  synthesisModel: string
  reportModel: string
  enableParallelSearch: boolean
  qualityThreshold: number
}

export const DEFAULT_RESEARCH_CONFIG: ResearchConfig = {
  maxSubQuestions: 8,
  maxSourcesPerQuestion: 5,
  maxSearchRetries: 3,
  searchTimeout: 30000,
  synthesisModel: "anthropic/claude-3-5-sonnet-20241022",
  reportModel: "anthropic/claude-3-5-sonnet-20241022",
  enableParallelSearch: true,
  qualityThreshold: 0.7,
}
