"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Loader2, StopCircle } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useToast } from "@/hooks/use-toast"

interface VoiceInputProps {
  onTranscription: (text: string) => void
  disabled?: boolean
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "ghost"
  showDuration?: boolean
  autoStop?: boolean
}

export function VoiceInput({
  onTranscription,
  disabled = false,
  size = "default",
  variant = "ghost",
  showDuration = true,
  autoStop = true,
}: VoiceInputProps) {
  const { toast } = useToast()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const {
    isRecording,
    isTranscribing,
    recordingDuration,
    startRecording,
    stopRecording,
    isSupported,
  } = useAudioRecorder({
    onTranscription: (text) => {
      onTranscription(text)
      toast({
        title: "Voice message transcribed",
        description: `"${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`,
      })
    },
    onError: (error) => {
      toast({
        title: "Voice input error",
        description: error,
        variant: "destructive",
      })
    },
    autoStop,
  })

  // Check microphone permission on mount
  useEffect(() => {
    if (!isSupported()) {
      setHasPermission(false)
      return
    }

    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((result) => {
        setHasPermission(result.state === "granted")
        result.onchange = () => {
          setHasPermission(result.state === "granted")
        }
      })
      .catch(() => {
        // Permissions API not supported, assume unknown
        setHasPermission(null)
      })
  }, [isSupported])

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      await startRecording()
    }
  }

  const getButtonVariant = () => {
    if (isRecording) return "destructive"
    if (isTranscribing) return "secondary"
    return variant
  }

  const getIcon = () => {
    if (isTranscribing) return <Loader2 className="h-4 w-4 animate-spin" />
    if (isRecording) return <MicOff className="h-4 w-4" />
    return <Mic className="h-4 w-4" />
  }

  const getTooltipText = () => {
    if (!isSupported()) return "Voice input not supported in this browser"
    if (hasPermission === false) return "Microphone access denied"
    if (isTranscribing) return "Processing audio..."
    if (isRecording) return "Click to stop recording"
    return "Click to start voice input"
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`
  }

  // Show not supported state
  if (!isSupported()) {
    return (
      <Button
        variant="ghost"
        size={size === "default" ? "icon" : size}
        disabled
        title="Voice input not supported"
        className="opacity-50"
      >
        <Mic className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={getButtonVariant()}
        size={size === "default" ? "icon" : size}
        onClick={handleToggleRecording}
        disabled={disabled || isTranscribing || hasPermission === false}
        title={getTooltipText()}
        className={`relative ${isRecording ? "animate-pulse" : ""}`}
      >
        {getIcon()}

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-red-500" />
        )}
      </Button>

      {/* Duration display */}
      {showDuration && isRecording && (
        <Badge variant="outline" className="text-xs">
          {formatDuration(recordingDuration)}
        </Badge>
      )}

      {/* Transcribing indicator */}
      {isTranscribing && (
        <Badge variant="secondary" className="text-xs">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Processing...
        </Badge>
      )}
    </div>
  )
}
