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
