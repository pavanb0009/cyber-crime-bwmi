import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BadgeCheck, Building2, FileText, Hash, Link2, Mail, Phone, RotateCcw, ShieldAlert, ShieldQuestion, Upload, UserRound, } from 'lucide-react';
import { Button, buttonStyles } from '../components/Button';
import { PageIntro } from '../components/PageIntro';
import { cx } from '../lib/cx';
import { clearFiles, getFiles, putFiles } from '../lib/fileStore';
import { analyseNoticeText, } from '../lib/noticeVerifier';
import { extractTextFromFile } from '../lib/ocr';
import { clearSession, patchSearchParams, readSession, writeSession } from '../lib/session';
import { useSearchParams } from 'react-router-dom';
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED = /\.(pdf|png|jpg|jpeg|webp|txt)$/i;
const verdictStyle = {
    'genuine-format': {
        label: 'Likely genuine-format',
        panel: 'border-brand/25 bg-brand/[0.035]',
        badge: 'bg-brand text-white',
        icon: BadgeCheck,
    },
    suspicious: {
        label: 'Suspicious',
        panel: 'border-amber-500/30 bg-amber-500/[0.05]',
        badge: 'bg-amber-600 text-white',
        icon: ShieldQuestion,
    },
    'high-risk': {
        label: 'High risk',
        panel: 'border-alert/40 bg-alert/[0.06]',
        badge: 'bg-alert text-white',
        icon: ShieldAlert,
    },
};
const severityStyle = {
    danger: 'border-alert/25 bg-alert/[0.04] text-alert',
    warn: 'border-amber-500/25 bg-amber-500/[0.05] text-amber-700',
    info: 'border-brand/25 bg-brand/[0.04] text-brand',
};
function FieldRow({ icon: Icon, label, value }) {
    return (_jsxs("div", { className: "flex items-start gap-3 border-b border-black/[0.06] py-2.5 last:border-0", children: [_jsx(Icon, { className: "mt-0.5 h-4 w-4 shrink-0 text-muted", "aria-hidden": true }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted", children: label }), _jsx("p", { className: "break-words text-sm text-paper", children: value })] })] }));
}
function VerifierResult({ analysis, onReset }) {
    const style = verdictStyle[analysis.verdict];
    const VerdictIcon = style.icon;
    const { fields } = analysis;
    const hasFields = fields.authority ||
        fields.referenceNumber ||
        fields.officer ||
        fields.phones.length ||
        fields.emails.length ||
        fields.links.length ||
        fields.paymentDemand;
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "space-y-5", children: [analysis.verdict === 'high-risk' ? (_jsxs("div", { className: "rounded-2xl bg-alert px-5 py-8 text-center text-white shadow-soft sm:px-8 sm:py-10", children: [_jsx(AlertTriangle, { className: "mx-auto h-10 w-10", "aria-hidden": true }), _jsx("p", { className: "mt-4 font-mono text-xs font-bold uppercase tracking-[0.16em]", children: "Likely fake notice" }), _jsx("h2", { className: "mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl", children: "Do not pay or respond" }), _jsx("p", { className: "mx-auto mt-3 max-w-xl text-sm leading-6 text-white/85", children: "No government agency demands payment, secrecy, or a QR scan over a notice. Do not transfer money, click links, or share any code." })] })) : null, _jsxs("div", { className: cx('rounded-2xl border p-5 sm:p-6', style.panel), children: [_jsxs("div", { className: "flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("span", { className: cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.68rem] font-bold tracking-[0.1em]', style.badge), children: [_jsx(VerdictIcon, { className: "h-3.5 w-3.5" }), " ", style.label.toUpperCase()] }), fields.authority ? (_jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-card px-2.5 py-1 text-[0.62rem] font-semibold text-muted", children: [_jsx(Building2, { className: "h-3 w-3" }), " Claims: ", fields.authority] })) : null] }), _jsx("h2", { className: "mt-3 text-2xl font-semibold tracking-[-0.03em] text-paper", children: analysis.headline }), _jsx("p", { className: "mt-2 max-w-xl text-sm leading-6 text-muted", children: analysis.summary })] }), _jsxs("div", { className: "shrink-0 rounded-xl border border-black/[0.08] bg-card px-4 py-3 text-center shadow-sm", children: [_jsxs("p", { className: "font-mono text-[0.55rem] font-bold uppercase leading-tight tracking-[0.1em] text-muted", children: ["Suspicion", _jsx("br", {}), "score"] }), _jsxs("p", { className: "mt-1 text-3xl font-bold tracking-[-0.05em] text-paper", children: [analysis.score, _jsx("span", { className: "text-xs font-medium text-muted", children: "/100" })] })] })] }), _jsx("div", { className: "mt-5 h-2 overflow-hidden rounded-full bg-black/[0.08]", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${analysis.score}%` }, className: cx('h-full rounded-full', analysis.verdict === 'genuine-format' ? 'bg-brand' : analysis.verdict === 'suspicious' ? 'bg-amber-500' : 'bg-alert') }) })] }), _jsxs("div", { className: "grid gap-5 lg:grid-cols-[1fr_1fr]", children: [_jsxs("div", { className: "surface p-5 sm:p-6", children: [_jsx("p", { className: "eyebrow", children: "Suspicious signals" }), _jsx("h3", { className: "mt-2 text-lg font-semibold text-paper", children: "Why this verdict" }), _jsxs("div", { className: "mt-4 space-y-3", children: [analysis.signals.map((signal) => (_jsxs("div", { className: cx('rounded-xl border p-4', severityStyle[signal.severity]), children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("p", { className: "text-sm font-semibold text-paper", children: signal.label }), _jsx("span", { className: "font-mono text-[0.6rem] font-bold", children: signal.weight > 0 ? `+${signal.weight}` : signal.weight })] }), _jsx("p", { className: "mt-1.5 text-sm leading-6 text-muted", children: signal.detail })] }, signal.id))), analysis.signals.length === 0 ? (_jsx("p", { className: "text-sm leading-6 text-muted", children: "No individual signals were triggered." })) : null] })] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "surface-soft p-5", children: [_jsx("p", { className: "eyebrow", children: "Extracted from the notice" }), _jsx("div", { className: "mt-3", children: hasFields ? (_jsxs(_Fragment, { children: [fields.authority ? _jsx(FieldRow, { icon: Building2, label: "Claimed authority", value: fields.authority }) : null, fields.referenceNumber ? _jsx(FieldRow, { icon: Hash, label: "Reference number", value: fields.referenceNumber }) : null, fields.officer ? _jsx(FieldRow, { icon: UserRound, label: "Officer", value: fields.officer }) : null, fields.phones.length ? _jsx(FieldRow, { icon: Phone, label: "Phone", value: fields.phones.join(', ') }) : null, fields.emails.length ? _jsx(FieldRow, { icon: Mail, label: "Email", value: fields.emails.join(', ') }) : null, fields.links.length ? _jsx(FieldRow, { icon: Link2, label: "Links / QR destination", value: fields.links.join(', ') }) : null, fields.paymentDemand ? _jsx(FieldRow, { icon: AlertTriangle, label: "Payment demand", value: `${fields.paymentDemand}${fields.amount ? ` — ${fields.amount}` : ''}` }) : null] })) : (_jsx("p", { className: "text-sm leading-6 text-muted", children: "No structured fields could be read from the text provided." })) })] }), _jsxs("div", { className: "surface p-5", children: [_jsx("p", { className: "eyebrow", children: "What to do now" }), _jsx("ol", { className: "mt-4 space-y-3", children: analysis.recommendedActions.map((action, index) => (_jsxs("li", { className: "flex gap-3 text-sm leading-6 text-muted", children: [_jsxs("span", { className: "font-mono text-xs font-bold text-brand", children: ["0", index + 1] }), action] }, action))) }), analysis.verdict !== 'genuine-format' ? (_jsxs("a", { href: "tel:1930", className: "mt-5 flex h-11 items-center justify-center gap-2 rounded-lg bg-alert px-4 text-sm font-semibold text-white", children: [_jsx(Phone, { className: "h-4 w-4" }), " Money sent? Call 1930"] })) : null] })] })] }), _jsxs("div", { className: "flex flex-col items-start justify-between gap-3 rounded-xl border border-black/[0.07] bg-mist p-4 sm:flex-row sm:items-center", children: [_jsx("p", { className: "text-xs leading-5 text-muted", children: analysis.disclaimer }), _jsxs(Button, { variant: "secondary", onClick: onReset, children: [_jsx(RotateCcw, { className: "h-4 w-4" }), " Verify another"] })] })] }));
}
export function NoticeVerifierPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const saved = readSession('notice');
    const copilotText = searchParams.get('text') ?? '';
    const [text, setText] = useState(copilotText || saved?.text || '');
    const [fileName, setFileName] = useState(saved?.fileName ?? '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [extractStage, setExtractStage] = useState('');
    const [result, setResult] = useState(saved?.result ?? null);
    const fileRef = useRef(null);
    const view = searchParams.get('view');
    const showResult = view === 'result' && result;
    function persist(next) {
        writeSession('notice', {
            text,
            fileName,
            result,
            ...next,
        });
    }
    function writeQuery(patch, replace = false) {
        setSearchParams((current) => patchSearchParams(current, patch), { replace });
    }
    async function handleFile(file) {
        setError('');
        setResult(null);
        if (!ACCEPTED.test(file.name)) {
            setError('Use a PDF, image (PNG/JPG/WEBP) or TXT file.');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setError('Choose a file smaller than 15 MB.');
            return;
        }
        setFileName(file.name);
        void putFiles('notice-file', [file]);
        setExtracting(true);
        setExtractStage('Opening document…');
        try {
            const extracted = await extractTextFromFile(file, (stage, ratio) => {
                setExtractStage(ratio != null ? `${stage} · ${Math.round(ratio * 100)}%` : stage);
            });
            setText(extracted.text);
            persist({ text: extracted.text, fileName: file.name, result: null });
            setExtractStage('Checking the notice…');
            await runVerify(extracted.text, file.name, { delay: false });
        }
        catch (caught) {
            const message = caught instanceof Error ? caught.message : 'Could not read this file.';
            setError(message);
            persist({ fileName: file.name, result: null });
        }
        finally {
            setExtracting(false);
            setExtractStage('');
        }
    }
    async function runVerify(inputText = text, inputName = fileName, options = {}) {
        const { delay = true } = options;
        if (!inputText.trim()) {
            setError('Paste the notice text or upload a file to analyse.');
            return;
        }
        setError('');
        setLoading(true);
        if (delay)
            await new Promise((resolve) => window.setTimeout(resolve, 320));
        const analysis = analyseNoticeText(inputText, inputName);
        setResult(analysis);
        persist({ text: inputText, fileName: inputName, result: analysis });
        writeQuery({ view: 'result', demo: null });
        setLoading(false);
    }
    function reset() {
        setText('');
        setFileName('');
        setError('');
        setExtracting(false);
        setExtractStage('');
        setResult(null);
        clearSession('notice');
        void clearFiles('notice-file');
        if (fileRef.current)
            fileRef.current.value = '';
        setSearchParams({}, { replace: true });
    }
    useEffect(() => {
        void getFiles('notice-file').then((files) => {
            if (files[0] && !fileName)
                setFileName(files[0].name);
        });
    }, [fileName]);
    return (_jsxs(_Fragment, { children: [_jsx(PageIntro, { title: "Is this notice real?" }), _jsx("section", { className: "page-shell pb-14", children: _jsx("div", { className: "mx-auto max-w-5xl", children: showResult && result ? (_jsx(VerifierResult, { analysis: result, onReset: reset })) : (_jsx("div", { className: "card overflow-hidden", children: _jsxs("div", { className: "p-5 sm:p-6", children: [copilotText ? (_jsxs("div", { className: "mb-5 rounded-xl border border-brand/25 bg-brand/[0.06] p-4", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.1em] text-brand", children: "Autopilot recommendation" }), _jsx("p", { className: "mt-2 text-sm leading-6 text-paper", children: copilotText }), _jsx("p", { className: "mt-1 text-xs leading-5 text-muted", children: "Upload the notice for the strongest check, or paste its complete text below." })] })) : null, _jsxs("div", { className: cx('drop-zone', fileName && 'border-solid border-brand/40 bg-brand/[0.06]'), onDragOver: (event) => event.preventDefault(), onDrop: (event) => {
                                        event.preventDefault();
                                        const dropped = event.dataTransfer.files[0];
                                        if (dropped)
                                            void handleFile(dropped);
                                    }, onClick: () => {
                                        if (!extracting)
                                            fileRef.current?.click();
                                    }, onKeyDown: (event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            fileRef.current?.click();
                                        }
                                    }, role: "button", tabIndex: 0, children: [fileName ? _jsx(FileText, { className: "mx-auto h-8 w-8 text-brand" }) : _jsx(Upload, { className: "mx-auto h-8 w-8 text-brand" }), _jsx("h3", { className: "mt-3 text-base font-semibold text-paper", children: extracting ? extractStage || 'Reading the notice…' : fileName || 'Drop a notice PDF or image here, or click to upload' }), _jsx("p", { className: "mt-1 text-sm text-muted", children: extracting
                                                ? 'Searchable PDFs are read directly. Scanned pages are OCR’d in this browser.'
                                                : 'PDF, PNG, JPG, WEBP or TXT · up to 15 MB. Text is extracted automatically.' }), extracting ? _jsx("div", { className: "scan-line mx-auto mt-4 max-w-md" }) : null, _jsx("div", { className: "mt-4", children: _jsx("span", { className: cx(buttonStyles(fileName ? 'secondary' : 'primary', 'md'), 'pointer-events-none'), children: fileName ? 'Choose another file' : 'Choose file' }) }), _jsx("input", { ref: fileRef, type: "file", accept: ".pdf,.png,.jpg,.jpeg,.webp,.txt", className: "sr-only", onClick: (event) => event.stopPropagation(), onChange: (event) => {
                                                const selected = event.target.files?.[0];
                                                if (selected)
                                                    void handleFile(selected);
                                            } })] }), _jsxs("div", { className: "mt-5", children: [_jsx("label", { htmlFor: "notice-text", className: "field-label", children: "Notice text" }), _jsx("textarea", { id: "notice-text", value: text, onChange: (event) => {
                                                setText(event.target.value);
                                                setError('');
                                                persist({ text: event.target.value, result: null });
                                            }, rows: 7, className: cx('text-area min-h-[10rem]', error && 'field-invalid'), placeholder: "Upload a file above, or paste the notice text here if you already have it.", disabled: extracting }), _jsxs("div", { className: "mt-3 flex flex-col gap-3 sm:flex-row", children: [_jsxs(Button, { onClick: () => void runVerify(), loading: loading || extracting, disabled: extracting, children: [_jsx(ShieldAlert, { className: "h-4 w-4" }), " Verify notice"] }), (text || fileName) ? (_jsx(Button, { variant: "secondary", onClick: reset, children: "Clear" })) : null] }), error ? (_jsxs("div", { className: "mt-4 flex gap-3 rounded-xl border border-alert/25 bg-alert/[0.05] p-4 text-sm leading-6 text-alert", children: [_jsx(AlertTriangle, { className: "mt-0.5 h-4 w-4 shrink-0" }), " ", error] })) : null] })] }) })) }) })] }));
}
