"use client"

import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import {
  ResearchJob,
  ResearchJobStatus,
  CreateResearchJobRequest,
  ResearchJobUpdate,
} from "@/types/research"
import { useToast } from "@/hooks/use-toast"

export function useResearch() {
  const { toast } = useToast()

  // Queries
  const useResearchJob = (jobId: Id<"researchJobs"> | null) => {
    return useQuery(api.research.getResearchJob, jobId ? { jobId } : "skip")
  }

  const useResearchJobs = (status?: ResearchJobStatus, limit?: number) => {
    return useQuery(api.research.listResearchJobs, { status, limit })
  }

  const useSearchResearchJobs = (searchTerm: string, limit?: number) => {
    return useQuery(api.research.searchResearchJobs, searchTerm ? { searchTerm, limit } : "skip")
  }

  // Mutations
  const createJobMutation = useMutation(api.research.createResearchJob)
  const updateJobMutation = useMutation(api.research.updateResearchJob)
  const deleteJobMutation = useMutation(api.research.deleteResearchJob)

  // Actions
  const processJobAction = useAction(api.research.processResearchJob)

  const createResearchJob = async (request: CreateResearchJobRequest) => {
    try {
      const jobId = await createJobMutation(request)

      toast({
        title: "Research Started",
        description: "Your deep research job has been initiated. This may take several minutes.",
      })

      return jobId
    } catch (error) {
      console.error("Failed to create research job:", error)
      toast({
        title: "Error",
        description: "Failed to start research job. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateResearchJob = async (jobId: Id<"researchJobs">, updates: ResearchJobUpdate) => {
    try {
      await updateJobMutation({ jobId, ...updates })
    } catch (error) {
      console.error("Failed to update research job:", error)
      toast({
        title: "Error",
        description: "Failed to update research job.",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteResearchJob = async (jobId: Id<"researchJobs">) => {
    try {
      await deleteJobMutation({ jobId })
      toast({
        title: "Research Deleted",
        description: "Research job has been deleted.",
      })
    } catch (error) {
      console.error("Failed to delete research job:", error)
      toast({
        title: "Error",
        description: "Failed to delete research job.",
        variant: "destructive",
      })
      throw error
    }
  }

  const retryResearchJob = async (jobId: Id<"researchJobs">) => {
    try {
      // Reset job status and trigger reprocessing
      await updateJobMutation({
        jobId,
        status: "pending",
        progress: 0,
        errorMessage: undefined,
        currentStep: undefined,
      })

      await processJobAction({ jobId })

      toast({
        title: "Research Restarted",
        description: "Your research job is being retried.",
      })
    } catch (error) {
      console.error("Failed to retry research job:", error)
      toast({
        title: "Error",
        description: "Failed to retry research job.",
        variant: "destructive",
      })
      throw error
    }
  }

  const cancelResearchJob = async (jobId: Id<"researchJobs">) => {
    try {
      await updateJobMutation({
        jobId,
        status: "failed",
        errorMessage: "Cancelled by user",
        currentStep: "Cancelled",
      })

      toast({
        title: "Research Cancelled",
        description: "Research job has been cancelled.",
      })
    } catch (error) {
      console.error("Failed to cancel research job:", error)
      toast({
        title: "Error",
        description: "Failed to cancel research job.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Helper functions
  const getJobStatusInfo = (status: ResearchJobStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          color: "bg-slate-500",
          description: "Waiting to start",
        }
      case "decomposing":
        return {
          label: "Planning",
          color: "bg-blue-500",
          description: "Breaking down research topic",
        }
      case "searching":
        return {
          label: "Searching",
          color: "bg-yellow-500",
          description: "Gathering information from web sources",
        }
      case "synthesizing":
        return {
          label: "Analyzing",
          color: "bg-orange-500",
          description: "Analyzing and synthesizing findings",
        }
      case "generating":
        return {
          label: "Writing",
          color: "bg-purple-500",
          description: "Generating final report",
        }
      case "completed":
        return {
          label: "Completed",
          color: "bg-green-500",
          description: "Research completed successfully",
        }
      case "failed":
        return {
          label: "Failed",
          color: "bg-red-500",
          description: "Research failed - retry available",
        }
      default:
        return {
          label: "Unknown",
          color: "bg-gray-500",
          description: "Unknown status",
        }
    }
  }

  const isJobActive = (status: ResearchJobStatus) => {
    return ["pending", "decomposing", "searching", "synthesizing", "generating"].includes(status)
  }

  const isJobComplete = (status: ResearchJobStatus) => {
    return status === "completed"
  }

  const isJobFailed = (status: ResearchJobStatus) => {
    return status === "failed"
  }

  const canRetryJob = (status: ResearchJobStatus) => {
    return status === "failed"
  }

  const canCancelJob = (status: ResearchJobStatus) => {
    return isJobActive(status)
  }

  const formatDuration = (startTime?: number, endTime?: number) => {
    if (!startTime) return "Not started"

    const end = endTime || Date.now()
    const duration = end - startTime
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const estimateCost = (totalTokens?: number, model?: string) => {
    if (!totalTokens) return "$0.00"

    // Rough estimation based on common model pricing
    // This should be updated with actual pricing from the model config
    const costPer1kTokens = 0.01 // $0.01 per 1k tokens (rough estimate)
    const cost = (totalTokens / 1000) * costPer1kTokens

    return `$${cost.toFixed(3)}`
  }

  return {
    // Hooks
    useResearchJob,
    useResearchJobs,
    useSearchResearchJobs,

    // Actions
    createResearchJob,
    updateResearchJob,
    deleteResearchJob,
    retryResearchJob,
    cancelResearchJob,

    // Utilities
    getJobStatusInfo,
    isJobActive,
    isJobComplete,
    isJobFailed,
    canRetryJob,
    canCancelJob,
    formatDuration,
    estimateCost,
  }
}
