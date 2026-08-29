import type { CaseEvidenceFile, CaseRecord } from '../types'
import { supabase } from './supabase'

const EVIDENCE_BUCKET = 'evidence'

type ReportRow = {
  payload: CaseRecord
}

function requireSupabase() {
  if (!supabase) throw new Error('Report sync is not configured.')
  return supabase
}

function safeFileName(name: string) {
  return name.replace(/[^\w.\-()+ ]+/g, '_').replace(/\s+/g, '_').slice(0, 120)
}

export async function uploadEvidenceFiles(caseId: string, files: File[]): Promise<CaseEvidenceFile[]> {
  if (!files.length) return []
  const client = requireSupabase()
  const { data: authData, error: authError } = await client.auth.getUser()
  if (authError || !authData.user) throw authError ?? new Error('Sign in to sync evidence.')

  const uploaded: CaseEvidenceFile[] = []
  for (const [index, file] of files.entries()) {
    const path = `${authData.user.id}/${caseId}/${index}-${safeFileName(file.name)}`
    const { error } = await client.storage.from(EVIDENCE_BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || 'application/octet-stream',
    })
    if (error) throw error
    uploaded.push({
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      path,
    })
  }
  return uploaded
}

export async function getEvidenceSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const client = requireSupabase()
  const { data, error } = await client.storage.from(EVIDENCE_BUCKET).createSignedUrl(path, expiresIn, {
    download: false,
  })
  if (error || !data?.signedUrl) throw error ?? new Error('Could not open evidence file.')
  return data.signedUrl
}

export async function saveCloudReport(record: CaseRecord): Promise<void> {
  const client = requireSupabase()
  const { data: authData, error: authError } = await client.auth.getUser()
  if (authError || !authData.user) throw authError ?? new Error('Sign in to sync reports.')

  const { error } = await client
    .from('reports')
    .upsert(
      {
        user_id: authData.user.id,
        case_id: record.caseId,
        payload: record,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,case_id' },
    )

  if (error) throw error
}

export async function loadCloudReports(): Promise<CaseRecord[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('reports')
    .select('payload')
    .order('created_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as ReportRow[])
    .map((row) => row.payload)
    .filter((record): record is CaseRecord => Boolean(record?.caseId && Array.isArray(record.timeline)))
}

export async function findCloudReport(caseId: string): Promise<CaseRecord | undefined> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('reports')
    .select('payload')
    .eq('case_id', caseId.trim().toUpperCase())
    .maybeSingle()

  if (error) throw error
  const record = (data as ReportRow | null)?.payload
  return record?.caseId && Array.isArray(record.timeline) ? record : undefined
}
