import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Cpu, FileAudio, Languages, PhoneOff, RotateCcw, ShieldAlert, Sparkles, Upload, Volume2, } from 'lucide-react';
import { Button, buttonStyles } from '../components/Button';
import { PageIntro } from '../components/PageIntro';
import { analyseCall } from '../lib/callAnalysis';
import { cx } from '../lib/cx';
import { clearFiles, getFiles, putFiles } from '../lib/fileStore';
import { clearSession, patchSearchParams, readSession, writeSession } from '../lib/session';
import { useSearchParams } from 'react-router-dom';
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = /\.(mp3|wav|m4a|webm|ogg|mp4)$/i;
const languageOptions = [
    { id: 'auto', label: 'Auto detect' },
    { id: 'hi', label: 'Hindi' },
    { id: 'en', label: 'English' },
];
const riskStyle = {
    LOW: { panel: 'border-brand/25 bg-brand/[0.035]', badge: 'bg-brand text-white', meter: 'bg-brand' },
    MEDIUM: { panel: 'border-amber-500/30 bg-amber-500/[0.05]', badge: 'bg-amber-600 text-white', meter: 'bg-amber-500' },
    HIGH: { panel: 'border-alert/35 bg-alert/[0.05]', badge: 'bg-alert text-white', meter: 'bg-alert' },
    CRITICAL: { panel: 'border-alert/50 bg-alert/[0.07]', badge: 'bg-alert text-white', meter: 'bg-alert' },
};
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}
function AnalysisResult({ result, onReset }) {
    const { analysis } = result;
    const style = riskStyle[analysis.risk_level];
    const detectedSignals = analysis.signals.filter((signal) => signal.detected);
    const signalLabel = new Map(analysis.signals.map((signal) => [signal.id, signal.label]));
    const likelihood = analysis.scam_likelihood ?? analysis.risk_score;
    const usedAI = analysis.engine === 'ai+rules';
    const threats = analysis.threats ?? [];
    // Full-screen alert fires on a dangerous score from either lens, not just level.
    const isCritical = analysis.risk_level === 'CRITICAL' || likelihood >= 85 || analysis.risk_score >= 75;
    // Any English translation present means we can offer a bilingual view.
    const hasEnglish = Boolean(result.english_transcript && result.english_transcript !== result.original_transcript);
    const [showEnglish, setShowEnglish] = useState(hasEnglish);
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "space-y-5", children: [isCritical ? (_jsxs("div", { className: "rounded-2xl bg-alert px-5 py-8 text-center text-white shadow-soft sm:px-8 sm:py-10", children: [_jsx(AlertTriangle, { className: "mx-auto h-10 w-10", "aria-hidden": true }), _jsxs("p", { className: "mt-4 font-mono text-xs font-bold uppercase tracking-[0.16em]", children: ["Possible ", analysis.scam_label] }), _jsx("h2", { className: "mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl", children: "Hang up now" }), _jsx("p", { className: "mx-auto mt-3 max-w-xl text-sm leading-6 text-white/85", children: "Do not transfer money, share banking credentials, install an app, or allow screen access." })] })) : null, _jsxs("div", { className: cx('rounded-2xl border p-5 sm:p-6', style.panel), children: [_jsxs("div", { className: "flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("span", { className: cx('inline-flex rounded-full px-3 py-1 text-[0.68rem] font-bold tracking-[0.12em]', style.badge), children: [analysis.risk_level, " RISK"] }), _jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-card px-2.5 py-1 text-[0.62rem] font-semibold text-muted", children: [usedAI ? _jsx(Sparkles, { className: "h-3 w-3 text-brand" }) : _jsx(Cpu, { className: "h-3 w-3" }), usedAI ? 'AI semantic analysis' : 'Rule engine only'] })] }), _jsx("h2", { className: "mt-3 text-2xl font-semibold tracking-[-0.03em] text-paper", children: analysis.scam_label }), _jsx("p", { className: "mt-2 max-w-xl text-sm leading-6 text-muted", children: analysis.summary
                                            ? analysis.summary
                                            : detectedSignals.length
                                                ? `${detectedSignals.length} independent social-engineering signal${detectedSignals.length === 1 ? '' : 's'} detected.`
                                                : 'No strong scam signal was detected in this recording.' })] }), _jsxs("div", { className: "grid shrink-0 grid-cols-2 gap-3", children: [_jsxs("div", { className: "rounded-xl border border-black/[0.08] bg-card px-4 py-3 text-center shadow-sm", children: [_jsxs("p", { className: "font-mono text-[0.55rem] font-bold uppercase leading-tight tracking-[0.1em] text-muted", children: ["AI scam", _jsx("br", {}), "likelihood"] }), _jsxs("p", { className: "mt-1 text-3xl font-bold tracking-[-0.05em] text-paper", children: [likelihood, _jsx("span", { className: "text-xs font-medium text-muted", children: "/100" })] })] }), _jsxs("div", { className: "rounded-xl border border-black/[0.08] bg-card px-4 py-3 text-center shadow-sm", children: [_jsxs("p", { className: "font-mono text-[0.55rem] font-bold uppercase leading-tight tracking-[0.1em] text-muted", children: ["Behavioural", _jsx("br", {}), "risk"] }), _jsxs("p", { className: "mt-1 text-3xl font-bold tracking-[-0.05em] text-paper", children: [analysis.risk_score, _jsx("span", { className: "text-xs font-medium text-muted", children: "/100" })] })] })] })] }), _jsx("div", { className: "mt-5 h-2 overflow-hidden rounded-full bg-black/[0.08]", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${analysis.risk_score}%` }, className: cx('h-full rounded-full', style.meter) }) }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.68rem] text-muted", children: [_jsx("span", { children: result.file_name }), _jsxs("span", { children: [formatTime(result.duration), " audio"] }), _jsxs("span", { children: [result.language.toUpperCase(), " \u00B7 ", Math.round(result.language_probability * 100), "% confidence"] }), typeof analysis.confidence === 'number' ? _jsxs("span", { children: ["Model confidence ", analysis.confidence, "%"] }) : null] })] }), threats.length ? (_jsxs("div", { className: "surface p-5 sm:p-6", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Threats detected" }), _jsx("h3", { className: "mt-2 text-lg font-semibold text-paper", children: "Why this call was flagged" })] }), _jsx(ShieldAlert, { className: "h-5 w-5 text-alert", "aria-hidden": true })] }), _jsx("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: threats.map((threat, index) => (_jsxs("div", { className: "rounded-xl border border-alert/20 bg-alert/[0.035] p-4", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("p", { className: "text-sm font-semibold text-paper", children: threat.type }), _jsxs("span", { className: "font-mono text-[0.6rem] font-bold text-alert", children: [threat.severity, "/100"] })] }), _jsxs("p", { className: "mt-2 text-sm leading-6 text-muted", children: ["\u201C", threat.evidence, "\u201D"] }), threat.explanation ? _jsx("p", { className: "mt-1.5 text-xs leading-5 text-muted/80", children: threat.explanation }) : null] }, `${threat.type}-${index}`))) })] })) : null, _jsxs("div", { className: "grid gap-5 lg:grid-cols-[1.15fr_.85fr]", children: [_jsxs("div", { className: "surface p-5 sm:p-6", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Timestamped transcript" }), _jsx("h3", { className: "mt-2 text-lg font-semibold text-paper", children: "What triggered the warning" })] }), hasEnglish ? (_jsxs("div", { className: "inline-flex overflow-hidden rounded-lg border border-black/[0.12] text-[0.68rem] font-semibold", children: [_jsxs("button", { type: "button", onClick: () => setShowEnglish(true), className: cx('flex items-center gap-1 px-2.5 py-1.5 transition', showEnglish ? 'bg-brand text-white' : 'bg-card text-muted hover:text-paper'), children: [_jsx(Languages, { className: "h-3 w-3" }), " English"] }), _jsx("button", { type: "button", onClick: () => setShowEnglish(false), className: cx('px-2.5 py-1.5 transition', !showEnglish ? 'bg-brand text-white' : 'bg-card text-muted hover:text-paper'), children: "Original" })] })) : (_jsx(Volume2, { className: "h-5 w-5 text-brand", "aria-hidden": true }))] }), _jsx("div", { className: "mt-5 max-h-[34rem] space-y-3 overflow-y-auto pr-1", children: result.segments.length ? result.segments.map((segment, index) => {
                                    const segSignals = segment.signals ?? [];
                                    const flagged = segSignals.length > 0;
                                    const original = segment.original_text ?? segment.text;
                                    const english = segment.english_text ?? '';
                                    const primary = showEnglish && english ? english : original;
                                    const secondary = showEnglish && english ? original : (hasEnglish ? english : '');
                                    return (_jsx("div", { className: cx('rounded-xl border p-4', flagged ? 'border-alert/20 bg-alert/[0.035]' : 'border-black/[0.07] bg-mist'), children: _jsxs("div", { className: "flex gap-3", children: [_jsx("span", { className: "shrink-0 font-mono text-[0.68rem] font-bold text-brand", children: formatTime(segment.start) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-sm leading-6 text-paper", children: primary }), secondary ? (_jsx("p", { className: "mt-1 text-xs leading-5 text-muted", children: secondary })) : null, flagged ? (_jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: [...new Set(segSignals)].map((id) => (_jsx("span", { className: "rounded-md bg-alert/[0.09] px-2 py-1 text-[0.68rem] font-semibold text-alert", children: signalLabel.get(id) ?? id }, id))) })) : null] })] }) }, `${segment.start}-${index}`));
                                }) : _jsx("p", { className: "text-sm leading-6 text-muted", children: "No speech was found in the recording." }) })] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "surface-soft p-5", children: [_jsx("p", { className: "eyebrow", children: "Scam DNA" }), _jsx("div", { className: "mt-4 space-y-3", children: analysis.signals.map((signal) => (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between gap-3 text-xs", children: [_jsx("span", { className: cx('font-medium', signal.detected ? 'text-paper' : 'text-muted'), children: signal.label }), _jsx("span", { className: "font-mono text-[0.65rem] text-muted", children: signal.detected ? `+${signal.weight}` : '—' })] }), _jsx("div", { className: "mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.08]", children: _jsx("div", { className: cx('h-full rounded-full', signal.detected ? style.meter : 'bg-transparent'), style: { width: signal.detected ? '100%' : '0%' } }) })] }, signal.id))) })] }), _jsxs("div", { className: "surface p-5", children: [_jsx("p", { className: "eyebrow", children: "Recommended now" }), _jsx("ol", { className: "mt-4 space-y-3", children: analysis.recommended_actions.map((action, index) => (_jsxs("li", { className: "flex gap-3 text-sm leading-6 text-muted", children: [_jsxs("span", { className: "font-mono text-xs font-bold text-brand", children: ["0", index + 1] }), action] }, action))) }), analysis.risk_level !== 'LOW' ? (_jsxs("a", { href: "tel:1930", className: "mt-5 flex h-11 items-center justify-center gap-2 rounded-lg bg-alert px-4 text-sm font-semibold text-white", children: [_jsx(PhoneOff, { className: "h-4 w-4" }), " Money sent? Call 1930"] })) : null] })] })] }), _jsxs("div", { className: "flex flex-col items-start justify-between gap-3 rounded-xl border border-black/[0.07] bg-mist p-4 sm:flex-row sm:items-center", children: [_jsx("p", { className: "text-xs leading-5 text-muted", children: analysis.disclaimer }), _jsxs(Button, { variant: "secondary", onClick: onReset, children: [_jsx(RotateCcw, { className: "h-4 w-4" }), " Scan another"] })] })] }));
}
export function CallScannerPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const saved = readSession('call');
    const [file, setFile] = useState(null);
    const [language, setLanguage] = useState(saved?.language ?? 'auto');
    const [audioUrl, setAudioUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(saved?.result ?? null);
    const fileRef = useRef(null);
    const view = searchParams.get('view');
    const copilotHint = searchParams.get('hint') ?? '';
    const showResult = view === 'result' && result;
    function writeQuery(patch, replace = false) {
        setSearchParams((current) => patchSearchParams(current, patch), { replace });
    }
    useEffect(() => {
        if (!file) {
            setAudioUrl('');
            return;
        }
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);
    useEffect(() => {
        void getFiles('call-scan').then((files) => {
            if (files[0])
                setFile(files[0]);
        });
    }, []);
    function chooseFile(nextFile) {
        setError('');
        setResult(null);
        if (!ACCEPTED_EXTENSIONS.test(nextFile.name)) {
            setFile(null);
            setError('Use an MP3, WAV, M4A, WebM, OGG, or MP4 audio file.');
            return;
        }
        if (nextFile.size > MAX_FILE_SIZE) {
            setFile(null);
            setError('Choose a recording smaller than 25 MB.');
            return;
        }
        setFile(nextFile);
        void putFiles('call-scan', [nextFile]);
        writeSession('call', { language, fileName: nextFile.name, result: null });
        writeQuery({ view: null, lang: language });
    }
    async function runAnalysis() {
        if (!file)
            return;
        setLoading(true);
        setError('');
        try {
            const analysis = await analyseCall(file, language);
            setResult(analysis);
            writeSession('call', { language, fileName: file.name, result: analysis });
            writeQuery({ view: 'result', lang: language, file: file.name });
        }
        catch (caught) {
            const message = caught instanceof Error ? caught.message : 'The recording could not be analysed.';
            setError(/fetch|network|failed to fetch/i.test(message)
                ? 'The call scanner API is unreachable. Set VITE_CALL_SCANNER_API_URL to your Railway URL and redeploy.'
                : message);
        }
        finally {
            setLoading(false);
        }
    }
    function reset() {
        setFile(null);
        setResult(null);
        setError('');
        clearSession('call');
        void clearFiles('call-scan');
        if (fileRef.current)
            fileRef.current.value = '';
        setSearchParams({}, { replace: true });
    }
    return (_jsxs(_Fragment, { children: [_jsx(PageIntro, { title: "Scan a call" }), _jsx("section", { className: "page-shell pb-14", children: _jsx("div", { className: "mx-auto max-w-5xl", children: showResult && result ? _jsx(AnalysisResult, { result: result, onReset: reset }) : (_jsxs("div", { className: "card overflow-hidden", children: [copilotHint ? (_jsxs("div", { className: "border-b border-brand/20 bg-brand/[0.06] p-5 sm:p-6", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.1em] text-brand", children: "Autopilot recommendation" }), _jsx("p", { className: "mt-2 text-sm leading-6 text-paper", children: copilotHint }), _jsx("p", { className: "mt-1 text-xs leading-5 text-muted", children: "Upload the recording below. We will transcribe it and explain scam signals such as urgency, OTP requests and impersonation." })] })) : null, _jsxs("div", { className: "border-b border-black/[0.07] p-5 sm:p-6", children: [_jsx("p", { className: "field-label", children: "Spoken language" }), _jsx("div", { className: "flex flex-wrap gap-2", children: languageOptions.map((option) => (_jsx("button", { type: "button", onClick: () => {
                                                setLanguage(option.id);
                                                writeSession('call', {
                                                    language: option.id,
                                                    fileName: file?.name ?? readSession('call')?.fileName ?? '',
                                                    result,
                                                });
                                                writeQuery({ lang: option.id }, true);
                                            }, className: cx('rounded-lg border-2 px-3.5 py-2 text-sm font-medium transition', language === option.id
                                                ? 'border-brand bg-brand/[0.08] text-brand'
                                                : 'border-fieldBorder bg-field text-muted hover:border-brand/50 hover:text-paper'), children: option.label }, option.id))) })] }), _jsxs("div", { className: "p-5 sm:p-6", children: [_jsxs("div", { className: cx('drop-zone', file && 'border-solid border-brand/40 bg-brand/[0.06]'), onDragOver: (event) => event.preventDefault(), onDrop: (event) => {
                                            event.preventDefault();
                                            const dropped = event.dataTransfer.files[0];
                                            if (dropped)
                                                chooseFile(dropped);
                                        }, onClick: (event) => {
                                            if (event.target.closest('button, audio'))
                                                return;
                                            fileRef.current?.click();
                                        }, onKeyDown: (event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                fileRef.current?.click();
                                            }
                                        }, role: "button", tabIndex: 0, children: [file ? _jsx(FileAudio, { className: "mx-auto h-9 w-9 text-brand" }) : _jsx(Upload, { className: "mx-auto h-8 w-8 text-brand" }), _jsx("h3", { className: "mt-3 text-base font-semibold text-paper", children: file ? file.name : 'Drop a call recording here, or click to upload' }), _jsx("p", { className: "mt-1 text-sm text-muted", children: file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ready to analyse` : 'MP3, WAV, M4A, WebM, OGG, or MP4 · maximum 25 MB' }), audioUrl ? _jsx("audio", { className: "mx-auto mt-5 w-full max-w-lg", controls: true, src: audioUrl, onClick: (event) => event.stopPropagation(), children: "Your browser cannot preview this audio." }) : null, _jsx("div", { className: "mt-5 flex justify-center", children: _jsx("span", { className: cx(buttonStyles(file ? 'secondary' : 'primary', 'md'), 'pointer-events-none'), children: file ? 'Choose another' : 'Choose recording' }) }), _jsx("input", { ref: fileRef, type: "file", accept: ".mp3,.wav,.m4a,.webm,.ogg,.mp4,audio/*", className: "sr-only", onClick: (event) => event.stopPropagation(), onChange: (event) => {
                                                    const selected = event.target.files?.[0];
                                                    if (selected)
                                                        chooseFile(selected);
                                                } })] }), file ? (_jsx("div", { className: "mt-4 flex justify-end", children: _jsxs(Button, { onClick: () => void runAnalysis(), loading: loading, children: [_jsx(ShieldAlert, { className: "h-4 w-4" }), " Analyse call"] }) })) : null, loading ? (_jsxs("div", { className: "mt-6 rounded-xl border border-brand/15 bg-brand/[0.035] p-5", children: [_jsx("div", { className: "scan-line" }), _jsx("p", { className: "mt-4 text-sm font-semibold text-paper", children: "Transcribing and checking scam behaviour\u2026" }), _jsx("p", { className: "mt-1 text-xs leading-5 text-muted", children: "This usually takes 10\u201330 seconds for a short clip." })] })) : null, error ? (_jsxs("div", { className: "mt-5 flex gap-3 rounded-xl border border-alert/25 bg-alert/[0.045] p-4 text-sm leading-6 text-alert", children: [_jsx(AlertTriangle, { className: "mt-0.5 h-4 w-4 shrink-0" }), " ", error] })) : null] })] })) }) })] }));
}
