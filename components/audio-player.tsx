"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Square, Volume2, VolumeX, Loader2 } from "lucide-react"

interface AudioPlayerProps {
  text: string
  voice?: string
  speed?: number
  onPlayStart?: () => void
  onPlayEnd?: () => void
  onError?: (error: string) => void
  className?: string
}

export function AudioPlayer({
  text,
  voice = "alloy",
  speed = 1.0,
  onPlayStart,
  onPlayEnd,
  onError,
  className = "",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnd = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      onPlayEnd?.()
    }
    const handleError = () => {
      onError?.("Audio playback failed")
      setIsPlaying(false)
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnd)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnd)
      audio.removeEventListener("error", handleError)
    }
  }, [onPlayEnd, onError])

  const generateAudio = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsLoading(true)

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, speed }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate audio")
      }

      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)

      // Clean up previous URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }

      setAudioUrl(url)

      if (audioRef.current) {
        audioRef.current.src = url
        await audioRef.current.play()
        setIsPlaying(true)
        onPlayStart?.()
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("TTS Error:", error)
        onError?.(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audioUrl && audio.src) {
      try {
        await audio.play()
        setIsPlaying(true)
        onPlayStart?.()
      } catch (error) {
        onError?.("Failed to play audio")
      }
    } else {
      await generateAudio()
    }
  }

  const handlePause = () => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      setIsPlaying(false)
    }
  }

  const handleStop = () => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (audio && duration) {
      audio.currentTime = (value[0] / 100) * duration
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [audioUrl])

  return (
    <div className={`flex items-center gap-2 rounded-lg bg-mauve-dark/20 p-2 ${className}`}>
      <audio ref={audioRef} preload="none" muted={isMuted} />

      {/* Play/Pause/Stop Controls */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={isLoading}
          className="h-8 w-8"
          title={isLoading ? "Loading..." : isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleStop}
          disabled={!audioUrl || isLoading}
          className="h-8 w-8"
          title="Stop"
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-1 items-center gap-2">
        <span className="min-w-[35px] text-xs text-mauve-subtle/70">{formatTime(currentTime)}</span>

        <Slider
          value={[duration ? (currentTime / duration) * 100 : 0]}
          onValueChange={handleSeek}
          max={100}
          step={1}
          className="flex-1"
          disabled={!duration}
        />

        <span className="min-w-[35px] text-xs text-mauve-subtle/70">{formatTime(duration)}</span>
      </div>

      {/* Volume Controls */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleMute}
          className="h-8 w-8"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>

        <Slider
          value={[isMuted ? 0 : volume * 100]}
          onValueChange={handleVolumeChange}
          max={100}
          step={1}
          className="w-16"
          disabled={isMuted}
        />
      </div>
    </div>
  )
}
