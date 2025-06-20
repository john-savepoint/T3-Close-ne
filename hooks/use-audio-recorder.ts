"use client"

import { useState, useRef, useCallback } from "react"

interface UseAudioRecorderOptions {
  onTranscription?: (text: string) => void
  onError?: (error: string) => void
  minDecibels?: number // Voice activation threshold
  maxPause?: number // Auto-stop after silence (ms)
  autoStop?: boolean // Enable auto-stop on silence
}

export function useAudioRecorder({
  onTranscription,
  onError,
  minDecibels = -45,
  maxPause = 3000,
  autoStop = true,
}: UseAudioRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const startRecording = useCallback(async () => {
    try {
      // Check browser support
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        throw new Error("Voice input is not supported in this browser")
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Optimize for Whisper
        },
      })

      streamRef.current = stream
      chunksRef.current = []

      // Determine best MIME type for browser
      let mimeType = "audio/webm"
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4"
        } else if (MediaRecorder.isTypeSupported("audio/wav")) {
          mimeType = "audio/wav"
        } else {
          mimeType = ""
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000, // Good quality, reasonable file size
      })

      mediaRecorderRef.current = mediaRecorder

      // Set up voice activity detection if auto-stop is enabled
      if (autoStop) {
        try {
          const audioContext = new AudioContext()
          audioContextRef.current = audioContext
          const source = audioContext.createMediaStreamSource(stream)
          const analyser = audioContext.createAnalyser()
          analyser.fftSize = 512
          analyser.minDecibels = minDecibels
          source.connect(analyser)

          const dataArray = new Uint8Array(analyser.frequencyBinCount)

          const checkAudioLevel = () => {
            if (!isRecording) return

            analyser.getByteFrequencyData(dataArray)
            const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length

            if (average > 0) {
              // Voice detected, reset silence timer
              if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current)
                silenceTimerRef.current = null
              }
            } else {
              // Silence detected, start timer
              if (!silenceTimerRef.current) {
                silenceTimerRef.current = setTimeout(() => {
                  stopRecording()
                }, maxPause)
              }
            }

            if (mediaRecorderRef.current?.state === "recording") {
              requestAnimationFrame(checkAudioLevel)
            }
          }

          // Start voice activity detection after a brief delay
          setTimeout(checkAudioLevel, 1000)
        } catch (audioContextError) {
          console.warn(
            "Voice activity detection failed, continuing without auto-stop:",
            audioContextError
          )
        }
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        await transcribeAudio(blob)

        // Clean up
        stream.getTracks().forEach((track) => track.stop())
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        onError?.("Recording failed. Please try again.")
        cleanup()
      }

      // Start recording
      mediaRecorder.start(1000) // Capture in 1-second chunks
      setIsRecording(true)
      setRecordingDuration(0)

      // Start duration timer
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (error: any) {
      console.error("Error starting recording:", error)

      let errorMessage = "Failed to start recording"
      if (error.name === "NotAllowedError") {
        errorMessage =
          "Microphone access denied. Please allow microphone permissions and try again."
      } else if (error.name === "NotFoundError") {
        errorMessage = "No microphone found. Please connect a microphone and try again."
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Voice input is not supported in this browser."
      } else if (error.message) {
        errorMessage = error.message
      }

      onError?.(errorMessage)
      cleanup()
    }
  }, [isRecording, minDecibels, maxPause, autoStop, onError])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      cleanup()
    }
  }, [isRecording])

  const cleanup = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current)
      durationTimerRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setRecordingDuration(0)
  }, [])

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true)

    try {
      // Check if blob has content
      if (audioBlob.size === 0) {
        throw new Error("No audio data recorded")
      }

      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Transcription failed")
      }

      const { text } = await response.json()

      if (text && text.trim()) {
        onTranscription?.(text.trim())
      } else {
        onError?.("No speech detected. Please try speaking more clearly.")
      }
    } catch (error: any) {
      console.error("Transcription error:", error)

      let errorMessage = "Failed to transcribe audio"
      if (error.message === "No audio data recorded") {
        errorMessage = "No audio was recorded. Please try again."
      } else if (error.message.includes("quota")) {
        errorMessage = "Transcription service is temporarily unavailable. Please try again later."
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Too many requests. Please wait a moment before trying again."
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again."
      } else if (error.message) {
        errorMessage = error.message
      }

      onError?.(errorMessage)
    } finally {
      setIsTranscribing(false)
    }
  }

  // Cleanup on unmount
  const cancelRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false)
      cleanup()
    }
    if (isTranscribing) {
      setIsTranscribing(false)
    }
  }, [isRecording, isTranscribing, cleanup])

  // Check browser support
  const isSupported = useCallback(() => {
    return !!(navigator.mediaDevices && window.MediaRecorder)
  }, [])

  return {
    isRecording,
    isTranscribing,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    isSupported,
  }
}
