import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  FileAudio,
  Languages,
  LockKeyhole,
  PhoneOff,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Upload,
  Volume2,
} from 'lucide-react'
import { Button, buttonStyles } from '../components/Button'
import { PageIntro } from '../components/PageIntro'
import { analyseCall, type CallLanguage } from '../lib/callAnalysis'
import { cx } from '../lib/cx'
import { clearFiles, getFiles, putFiles } from '../lib/fileStore'
import { clearSession, patchSearchParams, readSession, writeSession } from '../lib/session'
import type { CallAnalysisResponse, CallRiskLevel } from '../types'
import { useSearchParams } from 'react-router-dom'

const MAX_FILE_SIZE = 50 * 1024 * 1024
const ACCEPTED_EXTENSIONS = /\.(mp3|wav|m4a|webm|ogg|mp4)$/i

const languageOptions: Array<{ id: CallLanguage; label: string }> = [
  { id: 'auto', label: 'Auto detect' },
  { id: 'hi', label: 'Hindi' },
  { id: 'en', label: 'English' },
]

const riskStyle: Record<CallRiskLevel, { panel: string; badge: string; meter: string }> = {
  LOW: { panel: 'border-brand/25 bg-brand/[0.035]', badge: 'bg-brand text-white', meter: 'bg-brand' },
  MEDIUM: { panel: 'border-amber-500/30 bg-amber-500/[0.05]', badge: 'bg-amber-600 text-white', meter: 'bg-amber-500' },
  HIGH: { panel: 'border-alert/35 bg-alert/[0.05]', badge: 'bg-alert text-white', meter: 'bg-alert' },
  CRITICAL: { panel: 'border-alert/50 bg-alert/[0.07]', badge: 'bg-alert text-white', meter: 'bg-alert' },
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

function AnalysisResult({ result, onReset }: { result: CallAnalysisResponse; onReset: () => void }) {
  const { analysis } = result
  const style = riskStyle[analysis.risk_level]
  const detectedSignals = analysis.signals.filter((signal) => signal.detected)
  const signalLabel = new Map(analysis.signals.map((signal) => [signal.id, signal.label]))

  const likelihood = analysis.scam_likelihood ?? analysis.risk_score
  const usedAI = analysis.engine === 'ai+rules'
  const threats = analysis.threats ?? []

  // Full-screen alert fires on a dangerous score from either lens, not just level.
  const isCritical = analysis.risk_level === 'CRITICAL' || likelihood >= 85 || analysis.risk_score >= 75

  // Any English translation present means we can offer a bilingual view.
  const hasEnglish = Boolean(
    result.english_transcript && result.english_transcript !== result.original_transcript,
  )
  const [showEnglish, setShowEnglish] = useState(hasEnglish)

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {isCritical ? (
        <div className="rounded-2xl bg-alert px-5 py-8 text-center text-white shadow-soft sm:px-8 sm:py-10">
          <AlertTriangle className="mx-auto h-10 w-10" aria-hidden />
          <p className="mt-4 font-mono text-xs font-bold uppercase tracking-[0.16em]">Possible {analysis.scam_label}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Hang up now</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/85">
            Do not transfer money, share banking credentials, install an app, or allow screen access.
          </p>
        </div>
      ) : null}

      <div className={cx('rounded-2xl border p-5 sm:p-6', style.panel)}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cx('inline-flex rounded-full px-3 py-1 text-[0.68rem] font-bold tracking-[0.12em]', style.badge)}>
                {analysis.risk_level} RISK
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-card px-2.5 py-1 text-[0.62rem] font-semibold text-muted">
                {usedAI ? <Sparkles className="h-3 w-3 text-brand" /> : <Cpu className="h-3 w-3" />}
                {usedAI ? 'AI semantic analysis' : 'Rule engine only'}
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-paper">{analysis.scam_label}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              {analysis.summary
                ? analysis.summary
                : detectedSignals.length
                  ? `${detectedSignals.length} independent social-engineering signal${detectedSignals.length === 1 ? '' : 's'} detected.`
                  : 'No strong scam signal was detected in this recording.'}
            </p>
          </div>

          {/* Two scores, two questions. */}
          <div className="grid shrink-0 grid-cols-2 gap-3">
            <div className="rounded-xl border border-black/[0.08] bg-card px-4 py-3 text-center shadow-sm">
              <p className="font-mono text-[0.55rem] font-bold uppercase leading-tight tracking-[0.1em] text-muted">AI scam<br />likelihood</p>
              <p className="mt-1 text-3xl font-bold tracking-[-0.05em] text-paper">
                {likelihood}<span className="text-xs font-medium text-muted">/100</span>
              </p>
            </div>
            <div className="rounded-xl border border-black/[0.08] bg-card px-4 py-3 text-center shadow-sm">
              <p className="font-mono text-[0.55rem] font-bold uppercase leading-tight tracking-[0.1em] text-muted">Behavioural<br />risk</p>
              <p className="mt-1 text-3xl font-bold tracking-[-0.05em] text-paper">
                {analysis.risk_score}<span className="text-xs font-medium text-muted">/100</span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/[0.08]">
          <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.risk_score}%` }} className={cx('h-full rounded-full', style.meter)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.68rem] text-muted">
          <span>{result.file_name}</span>
          <span>{formatTime(result.duration)} audio</span>
          <span>{result.language.toUpperCase()} · {Math.round(result.language_probability * 100)}% confidence</span>
          {typeof analysis.confidence === 'number' ? <span>Model confidence {analysis.confidence}%</span> : null}
        </div>
      </div>

      {/* Threats detected: the "why", quoted from the call. */}
      {threats.length ? (
        <div className="surface p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Threats detected</p>
              <h3 className="mt-2 text-lg font-semibold text-paper">Why this call was flagged</h3>
            </div>
            <ShieldAlert className="h-5 w-5 text-alert" aria-hidden />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {threats.map((threat, index) => (
              <div key={`${threat.type}-${index}`} className="rounded-xl border border-alert/20 bg-alert/[0.035] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-paper">{threat.type}</p>
                  <span className="font-mono text-[0.6rem] font-bold text-alert">{threat.severity}/100</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">“{threat.evidence}”</p>
                {threat.explanation ? <p className="mt-1.5 text-xs leading-5 text-muted/80">{threat.explanation}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="surface p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Timestamped transcript</p>
              <h3 className="mt-2 text-lg font-semibold text-paper">What triggered the warning</h3>
            </div>
            {hasEnglish ? (
              <div className="inline-flex overflow-hidden rounded-lg border border-black/[0.12] text-[0.68rem] font-semibold">
                <button
                  type="button"
                  onClick={() => setShowEnglish(true)}
                  className={cx('flex items-center gap-1 px-2.5 py-1.5 transition', showEnglish ? 'bg-brand text-white' : 'bg-card text-muted hover:text-paper')}
                >
                  <Languages className="h-3 w-3" /> English
                </button>
                <button
                  type="button"
                  onClick={() => setShowEnglish(false)}
                  className={cx('px-2.5 py-1.5 transition', !showEnglish ? 'bg-brand text-white' : 'bg-card text-muted hover:text-paper')}
                >
                  Original
                </button>
              </div>
            ) : (
              <Volume2 className="h-5 w-5 text-brand" aria-hidden />
            )}
          </div>
          <div className="mt-5 max-h-[34rem] space-y-3 overflow-y-auto pr-1">
            {result.segments.length ? result.segments.map((segment, index) => {
              const segSignals = segment.signals ?? []
              const flagged = segSignals.length > 0
              const original = segment.original_text ?? segment.text
              const english = segment.english_text ?? ''
              const primary = showEnglish && english ? english : original
              const secondary = showEnglish && english ? original : (hasEnglish ? english : '')
              return (
                <div key={`${segment.start}-${index}`} className={cx('rounded-xl border p-4', flagged ? 'border-alert/20 bg-alert/[0.035]' : 'border-black/[0.07] bg-mist')}>
                  <div className="flex gap-3">
                    <span className="shrink-0 font-mono text-[0.68rem] font-bold text-brand">{formatTime(segment.start)}</span>
                    <div className="min-w-0">
                      <p className="text-sm leading-6 text-paper">{primary}</p>
                      {secondary ? (
                        <p className="mt-1 text-xs leading-5 text-muted">{secondary}</p>
                      ) : null}
                      {flagged ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {[...new Set(segSignals)].map((id) => (
                            <span key={id} className="rounded-md bg-alert/[0.09] px-2 py-1 text-[0.68rem] font-semibold text-alert">
                              {signalLabel.get(id) ?? id}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            }) : <p className="text-sm leading-6 text-muted">No speech was found in the recording.</p>}
          </div>
        </div>

        <div className="space-y-5">
          <div className="surface-soft p-5">
            <p className="eyebrow">Scam DNA</p>
            <div className="mt-4 space-y-3">
              {analysis.signals.map((signal) => (
                <div key={signal.id}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className={cx('font-medium', signal.detected ? 'text-paper' : 'text-muted')}>{signal.label}</span>
                    <span className="font-mono text-[0.65rem] text-muted">{signal.detected ? `+${signal.weight}` : '—'}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.08]">
                    <div className={cx('h-full rounded-full', signal.detected ? style.meter : 'bg-transparent')} style={{ width: signal.detected ? '100%' : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface p-5">
            <p className="eyebrow">Recommended now</p>
            <ol className="mt-4 space-y-3">
              {analysis.recommended_actions.map((action, index) => (
                <li key={action} className="flex gap-3 text-sm leading-6 text-muted">
                  <span className="font-mono text-xs font-bold text-brand">0{index + 1}</span>
                  {action}
                </li>
              ))}
            </ol>
            {analysis.risk_level !== 'LOW' ? (
              <a href="tel:1930" className="mt-5 flex h-11 items-center justify-center gap-2 rounded-lg bg-alert px-4 text-sm font-semibold text-white">
                <PhoneOff className="h-4 w-4" /> Money sent? Call 1930
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-black/[0.07] bg-mist p-4 sm:flex-row sm:items-center">
        <p className="text-xs leading-5 text-muted">{analysis.disclaimer}</p>
        <Button variant="secondary" onClick={onReset}><RotateCcw className="h-4 w-4" /> Scan another</Button>
      </div>
    </motion.div>
  )
}

type CallSession = {
  language: CallLanguage
  fileName: string
  result: CallAnalysisResponse | null
}

export function CallScannerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const saved = readSession<CallSession>('call')
  const [file, setFile] = useState<File | null>(null)
  const [language, setLanguage] = useState<CallLanguage>(saved?.language ?? 'auto')
  const [audioUrl, setAudioUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CallAnalysisResponse | null>(saved?.result ?? null)
  const fileRef = useRef<HTMLInputElement>(null)
  const view = searchParams.get('view')
  const showResult = view === 'result' && result

  function writeQuery(patch: Record<string, string | null>, replace = false) {
    setSearchParams((current) => patchSearchParams(current, patch), { replace })
  }

  useEffect(() => {
    if (!file) {
      setAudioUrl('')
      return
    }
    const url = URL.createObjectURL(file)
    setAudioUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    void getFiles('call-scan').then((files) => {
      if (files[0]) setFile(files[0])
    })
  }, [])

  function chooseFile(nextFile: File) {
    setError('')
    setResult(null)
    if (!ACCEPTED_EXTENSIONS.test(nextFile.name)) {
      setFile(null)
      setError('Use an MP3, WAV, M4A, WebM, OGG, or MP4 audio file.')
      return
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null)
      setError('Choose a recording smaller than 50 MB.')
      return
    }
    setFile(nextFile)
    void putFiles('call-scan', [nextFile])
    writeSession('call', { language, fileName: nextFile.name, result: null })
    writeQuery({ view: null, lang: language })
  }

  async function runAnalysis() {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const analysis = await analyseCall(file, language)
      setResult(analysis)
      writeSession('call', { language, fileName: file.name, result: analysis })
      writeQuery({ view: 'result', lang: language, file: file.name })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'The recording could not be analysed.'
      setError(message.includes('fetch') ? 'The local scanner is not running. Start the FastAPI backend on port 8000.' : message)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setFile(null)
    setResult(null)
    setError('')
    clearSession('call')
    void clearFiles('call-scan')
    if (fileRef.current) fileRef.current.value = ''
    setSearchParams({}, { replace: true })
  }

  return (
    <>
      <PageIntro title="Scan a call" />

      <section className="page-shell pb-14">
        <div className="mx-auto max-w-5xl">
          {showResult && result ? <AnalysisResult result={result} onReset={reset} /> : (
            <div className="card overflow-hidden">
              <div className="border-b border-black/[0.07] p-5 sm:p-6">
                <p className="field-label">Spoken language</p>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setLanguage(option.id)
                        writeSession('call', {
                          language: option.id,
                          fileName: file?.name ?? readSession<CallSession>('call')?.fileName ?? '',
                          result,
                        })
                        writeQuery({ lang: option.id }, true)
                      }}
                      className={cx(
                        'rounded-lg border-2 px-3.5 py-2 text-sm font-medium transition',
                        language === option.id
                          ? 'border-brand bg-brand/[0.08] text-brand'
                          : 'border-fieldBorder bg-field text-muted hover:border-brand/50 hover:text-paper',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div
                  className={cx('drop-zone', file && 'border-solid border-brand/40 bg-brand/[0.06]')}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    const dropped = event.dataTransfer.files[0]
                    if (dropped) chooseFile(dropped)
                  }}
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest('button, audio')) return
                    fileRef.current?.click()
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      fileRef.current?.click()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {file ? <FileAudio className="mx-auto h-9 w-9 text-brand" /> : <Upload className="mx-auto h-8 w-8 text-brand" />}
                  <h3 className="mt-3 text-base font-semibold text-paper">{file ? file.name : 'Drop a call recording here, or click to upload'}</h3>
                  <p className="mt-1 text-sm text-muted">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ready to analyse` : 'MP3, WAV, M4A, WebM, OGG, or MP4 · maximum 50 MB'}</p>

                  {audioUrl ? <audio className="mx-auto mt-5 w-full max-w-lg" controls src={audioUrl} onClick={(event) => event.stopPropagation()}>Your browser cannot preview this audio.</audio> : null}

                  <div className="mt-5 flex justify-center">
                    <span className={cx(buttonStyles(file ? 'secondary' : 'primary', 'md'), 'pointer-events-none')}>
                      {file ? 'Choose another' : 'Choose recording'}
                    </span>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".mp3,.wav,.m4a,.webm,.ogg,.mp4,audio/*"
                    className="sr-only"
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => {
                      const selected = event.target.files?.[0]
                      if (selected) chooseFile(selected)
                    }}
                  />
                </div>
                {file ? (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => void runAnalysis()} loading={loading}><ShieldAlert className="h-4 w-4" /> Analyse call</Button>
                  </div>
                ) : null}

                {loading ? (
                  <div className="mt-6 rounded-xl border border-brand/15 bg-brand/[0.035] p-5">
                    <div className="scan-line" />
                    <p className="mt-4 text-sm font-semibold text-paper">Transcribing and checking scam behaviour…</p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      On a CPU this takes roughly as long as the recording itself, so a 45-second clip needs about a minute. The first run also downloads the Whisper model.
                    </p>
                  </div>
                ) : null}
                {error ? (
                  <div className="mt-5 flex gap-3 rounded-xl border border-alert/25 bg-alert/[0.045] p-4 text-sm leading-6 text-alert">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
