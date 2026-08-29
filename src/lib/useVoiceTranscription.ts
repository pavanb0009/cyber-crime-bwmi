import { useEffect, useRef, useState } from 'react'
import { transcribeAudio, type CallLanguage } from './callAnalysis'
import { extensionForMime, pickAudioRecorderMime, stopMediaStream } from './voiceRecord'

function callLanguage(language: string): CallLanguage {
  const locale = language.toLowerCase().split('-')[0]
  if (locale === 'hi') return 'hi'
  if (locale === 'en') return 'en'
  return 'auto'
}

export function useVoiceTranscription({
  language,
  onTranscript,
}: {
  language: string
  onTranscript: (transcript: string) => void
}) {
  const [listening, setListening] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  function release() {
    stopMediaStream(streamRef.current)
    streamRef.current = null
    recorderRef.current = null
    chunksRef.current = []
  }

  async function transcribe(blob: Blob, mime: string) {
    if (blob.size < 2_000) {
      setError('Speak for a little longer, then tap Stop.')
      setProcessing(false)
      return
    }
    const file = new File([blob], `cyberdesk-story.${extensionForMime(mime)}`, { type: mime })
    try {
      const transcript = await transcribeAudio(file, callLanguage(language))
      onTranscript(transcript)
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not understand the recording.')
    } finally {
      setProcessing(false)
    }
  }

  async function start() {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Voice recording is not supported in this browser. Type what happened instead.')
      return
    }
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = pickAudioRecorderMime()
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })
        release()
        void transcribe(blob, type)
      }
      streamRef.current = stream
      recorderRef.current = recorder
      recorder.start(250)
      setListening(true)
    } catch (reason) {
      release()
      const denied = reason instanceof DOMException
        && (reason.name === 'NotAllowedError' || reason.name === 'SecurityError')
      setError(denied ? 'Allow microphone access, then try again.' : 'The microphone could not start.')
    }
  }

  function stop() {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      release()
      setListening(false)
      return
    }
    setListening(false)
    setProcessing(true)
    try {
      recorder.stop()
    } catch {
      release()
      setProcessing(false)
      setError('The recording stopped unexpectedly. Please try again.')
    }
  }

  function toggle() {
    if (processing) return
    if (listening) stop()
    else void start()
  }

  useEffect(() => () => {
    if (recorderRef.current?.state !== 'inactive') {
      try {
        recorderRef.current?.stop()
      } catch {
        // Recorder is already closed.
      }
    }
    stopMediaStream(streamRef.current)
  }, [])

  return { listening, processing, error, toggle }
}
