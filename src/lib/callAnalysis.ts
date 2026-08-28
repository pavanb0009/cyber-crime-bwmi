import type { CallAnalysisResponse } from '../types'

const API_URL = (import.meta.env.VITE_CALL_SCANNER_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')

export type CallLanguage = 'auto' | 'hi' | 'en'

export async function analyseCall(
  file: File,
  language: CallLanguage = 'auto',
  signal?: AbortSignal,
): Promise<CallAnalysisResponse> {
  const body = new FormData()
  body.append('audio', file)
  body.append('language', language)

  let response: Response
  try {
    response = await fetch(`${API_URL}/analyse`, {
      method: 'POST',
      body,
      signal,
    })
  } catch {
    throw new Error('The call scanner API is unreachable. Set VITE_CALL_SCANNER_API_URL to your Railway URL and redeploy.')
  }

  if (!response.ok) {
    let message = 'The scanner could not analyse this recording.'
    try {
      const error = (await response.json()) as { detail?: string }
      if (error.detail) message = error.detail
    } catch {
      // Keep the user-friendly fallback for non-JSON server errors.
    }
    throw new Error(message)
  }

  return response.json() as Promise<CallAnalysisResponse>
}

export async function transcribeAudio(
  file: File,
  language: CallLanguage = 'auto',
  signal?: AbortSignal,
): Promise<string> {
  const body = new FormData()
  body.append('audio', file)
  body.append('language', language)

  let response: Response
  try {
    response = await fetch(`${API_URL}/transcribe`, {
      method: 'POST',
      body,
      signal,
    })
  } catch {
    throw new Error('Voice transcription needs the call-scanner API. Set VITE_CALL_SCANNER_API_URL and redeploy.')
  }

  if (!response.ok) {
    let message = 'The recording could not be turned into text.'
    try {
      const error = (await response.json()) as { detail?: string }
      if (error.detail) message = error.detail
    } catch {
      // Keep the user-friendly fallback for non-JSON server errors.
    }
    throw new Error(message)
  }

  const payload = (await response.json()) as { transcript?: string }
  const transcript = payload.transcript?.trim() ?? ''
  if (!transcript) throw new Error('No speech was recognised. Try speaking a little longer.')
  return transcript
}
