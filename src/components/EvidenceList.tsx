import { Download, ExternalLink, FileText, Image as ImageIcon, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { bundledPreviewUrl } from '../data/demoEvidence'
import { getFiles } from '../lib/fileStore'
import { getEvidenceSignedUrl } from '../lib/reportsApi'
import type { CaseEvidenceFile } from '../types'
import { cx } from '../lib/cx'

function formatSize(bytes?: number) {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(file: CaseEvidenceFile) {
  return Boolean(
    file.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name),
  )
}

function isPdf(file: CaseEvidenceFile) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
}

function isText(file: CaseEvidenceFile) {
  return file.type?.startsWith('text/') || /\.(txt|csv|log)$/i.test(file.name)
}

function fileKey(file: CaseEvidenceFile, index: number) {
  return `${file.path ?? file.url ?? file.name}-${index}`
}

export function EvidenceList({
  files,
  caseId,
  className,
}: {
  files?: CaseEvidenceFile[]
  caseId?: string
  className?: string
}) {
  const { t } = useTranslation('pages')
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState<{ file: CaseEvidenceFile; url?: string; error?: string } | null>(null)
  const [loadingKey, setLoadingKey] = useState('')

  const items = useMemo(() => files ?? [], [files])

  useEffect(() => {
    let active = true
    const objectUrls: string[] = []

    async function resolve() {
      if (!items.length) return
      const localFiles = caseId ? await getFiles(`evidence:${caseId}`).catch(() => []) : []
      const next: Record<string, string> = {}

      await Promise.all(
        items.map(async (file, index) => {
          const key = fileKey(file, index)
          const bundled = bundledPreviewUrl(file.name)
          if (bundled) {
            next[key] = bundled
            return
          }
          if (file.url) {
            next[key] = file.url
            return
          }
          const local = localFiles.find((item) => item.name === file.name)
          if (local) {
            const objectUrl = URL.createObjectURL(local)
            objectUrls.push(objectUrl)
            next[key] = objectUrl
            return
          }
          if (!file.path) return
          try {
            next[key] = await getEvidenceSignedUrl(file.path)
          } catch {
            // Keep the row clickable; preview will explain if the file cannot open.
          }
        }),
      )
      if (active) setUrls(next)
    }

    void resolve()
    return () => {
      active = false
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [caseId, items])

  useEffect(() => {
    if (!preview) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setPreview(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [preview])

  async function openFile(file: CaseEvidenceFile, index: number) {
    const key = fileKey(file, index)
    const existing = bundledPreviewUrl(file.name) ?? urls[key] ?? file.url
    if (existing) {
      setPreview({ file, url: existing })
      return
    }
    if (file.path) {
      setLoadingKey(key)
      try {
        const signed = await getEvidenceSignedUrl(file.path)
        setUrls((current) => ({ ...current, [key]: signed }))
        setPreview({ file, url: signed })
      } catch {
        setPreview({ file, error: t('report.previewUnavailable') })
      } finally {
        setLoadingKey('')
      }
      return
    }
    setPreview({ file, error: t('report.previewUnavailable') })
  }

  if (!items.length) return null

  return (
    <div className={cx('rounded-xl border border-black/[0.08] bg-mist/60 p-4', className)}>
      <p className="text-sm font-semibold text-paper">{t('report.evidenceAttached')}</p>
      <p className="mt-1 text-xs leading-5 text-muted">{t('report.evidenceAttachedHint')}</p>
      <ul className="mt-3 space-y-2">
        {items.map((file, index) => {
          const key = fileKey(file, index)
          const Icon = isImage(file) ? ImageIcon : FileText
          const opening = loadingKey === key
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => void openFile(file, index)}
                className="flex w-full items-center gap-3 rounded-lg border border-black/[0.07] bg-card px-3 py-2.5 text-left transition hover:border-brand/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/[0.08] text-brand">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-paper">{file.name}</p>
                  <p className="mt-0.5 text-[0.68rem] text-muted">
                    {[file.type || t('report.evidenceFile'), formatSize(file.size)].filter(Boolean).join(' · ')}
                    {file.path ? ` · ${t('report.evidenceInCloud')}` : ` · ${t('report.evidenceOnDevice')}`}
                  </p>
                </div>
                <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-black/[0.12] px-2.5 text-xs font-semibold text-paper">
                  {opening ? t('report.previewLoading') : t('report.openEvidence')}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {preview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={preview.file.name}
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-card shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-black/[0.08] px-4 py-3">
              <p className="truncate text-sm font-semibold text-paper">{preview.file.name}</p>
              <div className="flex items-center gap-2">
                {preview.url ? (
                  <a
                    href={preview.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-black/[0.12] px-2.5 text-xs font-semibold text-paper hover:border-brand hover:text-brand"
                  >
                    {isImage(preview.file) ? <ExternalLink className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                    {t('report.openEvidence')}
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-mist hover:text-paper"
                  aria-label={t('report.closePreview')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[calc(90vh-3.5rem)] overflow-auto bg-mist p-4">
              {preview.error ? (
                <p className="text-sm leading-6 text-muted">{preview.error}</p>
              ) : preview.url && isImage(preview.file) ? (
                <img
                  src={preview.url}
                  alt={preview.file.name}
                  className="mx-auto max-h-[75vh] w-auto max-w-full rounded-lg bg-card"
                  onError={(event) => {
                    const fallback = bundledPreviewUrl(preview.file.name)
                    if (fallback && event.currentTarget.src !== fallback) {
                      event.currentTarget.src = fallback
                      return
                    }
                    setPreview({ file: preview.file, error: t('report.previewUnavailable') })
                  }}
                />
              ) : preview.url && isPdf(preview.file) ? (
                <iframe title={preview.file.name} src={preview.url} className="h-[75vh] w-full rounded-lg bg-card" />
              ) : preview.url && isText(preview.file) ? (
                <TextPreview url={preview.url} />
              ) : preview.url ? (
                <a href={preview.url} target="_blank" rel="noreferrer" className="link-accent text-sm font-semibold">
                  {t('report.openEvidence')}
                </a>
              ) : (
                <p className="text-sm leading-6 text-muted">{t('report.previewUnavailable')}</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function TextPreview({ url }: { url: string }) {
  const [text, setText] = useState('…')
  useEffect(() => {
    void fetch(url)
      .then((response) => response.text())
      .then(setText)
      .catch(() => setText(''))
  }, [url])
  return <pre className="whitespace-pre-wrap rounded-lg bg-card p-4 text-sm leading-6 text-paper">{text}</pre>
}
