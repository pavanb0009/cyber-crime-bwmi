import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, Check, ChevronRight, Clock3, Download, LoaderCircle, Mic, MicOff, Plus, ShieldCheck, Sparkles, Trash2, Zap, } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, buttonStyles } from '../components/Button';
import { EvidenceList } from '../components/EvidenceList';
import { PageIntro } from '../components/PageIntro';
import { useAuth } from '../context/AuthContext';
import { brand } from '../data/brand';
import { channels, incidentTypes, indianStates } from '../data/content';
import { cx } from '../lib/cx';
import { useTranslation } from 'react-i18next';
import { clearFiles, getFiles, putFiles } from '../lib/fileStore';
import { classifyEvidenceName, classifyIncident, evidenceCompleteness, } from '../lib/intelligence';
import { transcribeAudio } from '../lib/callAnalysis';
import { patchSearchParams, writeSession } from '../lib/session';
import { saveCloudReport, uploadEvidenceFiles } from '../lib/reportsApi';
import { extractStoryDetails } from '../lib/routeIntent';
import { extensionForMime, pickAudioRecorderMime, stopMediaStream } from '../lib/voiceRecord';
import { clearDraft, emptyDraft, findCase, loadDraft, saveCase, saveDraft, } from '../lib/storage';
const paymentMethods = ['UPI', 'Bank transfer', 'Card', 'Wallet', 'Crypto', 'Other'];
function voiceLanguage(language) {
    const base = language.split('-')[0];
    if (base === 'hi')
        return 'hi';
    if (base === 'en')
        return 'en';
    return 'auto';
}
function makeCaseId() {
    const number = Math.floor(10000 + Math.random() * 89999);
    return `${brand.casePrefix}-${number}`;
}
function formatDateTime(value, locale, empty) {
    if (!value)
        return empty;
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return value;
    return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}
function parseAmount(value) {
    return Number(value.replace(/[^\d.]/g, '')) || 0;
}
function FieldError({ children }) {
    if (!children)
        return null;
    return (_jsxs("p", { className: "mt-2 flex items-center gap-1.5 text-xs font-semibold text-alert", role: "alert", children: [_jsx(AlertCircle, { className: "h-3.5 w-3.5 shrink-0" }), " ", children] }));
}
function withError(base, error) {
    return cx(base, error && 'field-invalid');
}
function SummaryRow({ label, value, empty }) {
    return (_jsxs("div", { className: "grid gap-1 border-b border-black/[0.07] py-3 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:gap-4", children: [_jsx("span", { className: "text-xs font-semibold uppercase tracking-[0.1em] text-muted", children: label }), _jsx("span", { className: "text-sm leading-6 text-paper", children: value || empty })] }));
}
function SuccessView({ record, syncStatus, }) {
    const { t } = useTranslation(['pages', 'common']);
    function downloadAcknowledgement() {
        const content = [
            `${brand.name.toUpperCase()} — ACKNOWLEDGEMENT`,
            '',
            `Reference: ${record.caseId}`,
            `Created: ${record.createdAt}`,
            `Status: ${record.statusLabel}`,
            `State: ${record.state}`,
            `Incident type: ${record.incidentType}`,
            '',
            'Keep this reference to track your complaint.',
        ].join('\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${record.caseId}-acknowledgement.txt`;
        anchor.click();
        URL.revokeObjectURL(url);
    }
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, className: "card overflow-hidden", children: [_jsx("div", { className: "border-b border-black/[0.07] bg-mist px-5 py-4 sm:px-6", children: _jsx("h2", { className: "text-lg font-semibold tracking-[-0.02em] text-paper", children: t('report.registered') }) }), _jsxs("div", { className: "p-5 sm:p-6", children: [_jsx("label", { className: "field-label", children: t('report.ackNumber') }), _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center", children: [_jsx("p", { className: "flex-1 break-all rounded-lg border-2 border-brand/30 bg-field px-3.5 py-3 font-mono text-xl font-bold text-brand sm:text-2xl", children: record.caseId }), _jsxs("div", { className: "inline-flex items-center gap-2 rounded-lg border border-black/[0.12] bg-card px-3 py-2 text-xs font-semibold text-paper", children: [_jsx(Clock3, { className: "h-3.5 w-3.5" }), " ", t('report.initialTriage')] })] }), _jsxs("div", { className: "mt-5 flex flex-col gap-3 sm:flex-row", children: [_jsxs(Link, { to: `/track?case=${encodeURIComponent(record.caseId)}`, className: buttonStyles('primary', 'lg'), children: [t('report.trackThis'), " ", _jsx(ArrowRight, { className: "h-4 w-4" })] }), _jsxs(Button, { variant: "secondary", size: "lg", onClick: downloadAcknowledgement, children: [_jsx(Download, { className: "h-4 w-4" }), " ", t('report.downloadAck')] })] }), _jsx(EvidenceList, { files: record.evidenceFiles, className: "mt-5" }), syncStatus ? (_jsxs("p", { className: cx('mt-4 rounded-xl border p-3 text-sm leading-6', syncStatus === 'synced'
                            ? 'border-brand/25 bg-brand/[0.06] text-paper'
                            : 'border-black/[0.10] bg-mist text-muted'), children: [t(syncStatus === 'synced'
                                ? 'report.syncedToAccount'
                                : syncStatus === 'failed'
                                    ? 'report.syncFailed'
                                    : 'report.savedOnDevice'), syncStatus === 'local' ? (_jsxs(_Fragment, { children: [' ', _jsx(Link, { to: "/login", state: { returnTo: `/track?case=${record.caseId}` }, className: "link-accent", children: t('report.signInToSync') })] })) : null] })) : null] })] }));
}
export function ReportPage() {
    const { t, i18n } = useTranslation(['pages', 'common']);
    const { user } = useAuth();
    const steps = [
        { id: 1, label: t('report.steps.incident'), short: t('report.steps.incident') },
        { id: 2, label: t('report.steps.details'), short: t('report.steps.details') },
        { id: 3, label: t('report.steps.evidence'), short: t('report.steps.evidence') },
        { id: 4, label: t('report.steps.review'), short: t('report.steps.review') },
    ];
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedType = searchParams.get('type');
    const isValidRequestedType = incidentTypes.some((item) => item.id === requestedType);
    const requestedAnonymous = searchParams.get('anonymous') === '1';
    const requestedEmergency = searchParams.get('mode') === 'emergency';
    const requestedSuspect = searchParams.get('suspect') ?? '';
    const requestedStory = searchParams.get('story') ?? '';
    const doneId = searchParams.get('done');
    const parsedStep = Number.parseInt(searchParams.get('step') || '1', 10);
    const step = Number.isFinite(parsedStep) ? Math.min(4, Math.max(1, parsedStep)) : 1;
    const [draft, setDraft] = useState(() => {
        const saved = loadDraft();
        const next = { ...saved };
        if (isValidRequestedType) {
            next.incidentType = requestedType;
            next.anonymous = requestedType === 'women-child' ? requestedAnonymous : false;
        }
        if (requestedStory.trim()) {
            next.copilotText = next.copilotText || requestedStory;
            next.description = next.description || requestedStory;
            const details = extractStoryDetails(requestedStory);
            next.amount = next.amount || details.amount || '';
            next.transactionId = next.transactionId || details.transactionId || '';
            next.channel = next.channel || details.channel || '';
            if (requestedType === 'financial') {
                next.recipientIdentifier = next.recipientIdentifier || details.identifier || '';
                if (!next.paymentMethod) {
                    const story = requestedStory.toLowerCase();
                    next.paymentMethod = details.identifierType === 'upi' || story.includes('upi')
                        ? 'UPI'
                        : /bank transfer|neft|imps|rtgs/.test(story)
                            ? 'Bank transfer'
                            : /credit card|debit card|\bcard\b/.test(story)
                                ? 'Card'
                                : /wallet/.test(story)
                                    ? 'Wallet'
                                    : /crypto|bitcoin/.test(story)
                                        ? 'Crypto'
                                        : '';
                }
            }
            else {
                next.suspiciousIdentifier = next.suspiciousIdentifier || details.identifier || '';
            }
        }
        if (requestedSuspect) {
            if (requestedType === 'financial') {
                next.recipientIdentifier = next.recipientIdentifier || requestedSuspect;
            }
            else {
                next.suspiciousIdentifier = next.suspiciousIdentifier || requestedSuspect;
            }
        }
        return next;
    });
    const [errors, setErrors] = useState({});
    const [fileError, setFileError] = useState('');
    const [savedLabel, setSavedLabel] = useState(() => t('report.draftReady'));
    const [submitting, setSubmitting] = useState(false);
    const [syncStatus, setSyncStatus] = useState(null);
    const [completedCase, setCompletedCase] = useState(() => {
        const id = new URLSearchParams(window.location.search).get('done');
        return id ? findCase(id) ?? null : null;
    });
    const [copilotResult, setCopilotResult] = useState(null);
    const [listening, setListening] = useState(false);
    const [voiceBusy, setVoiceBusy] = useState(false);
    const recorderRef = useRef(null);
    const streamRef = useRef(null);
    const chunksRef = useRef([]);
    const emergencyLanding = requestedEmergency && !draft.emergencyCaptured;
    const [emergencyActionsReady, setEmergencyActionsReady] = useState(false);
    const fileInputRef = useRef(null);
    const evidenceFilesRef = useRef([]);
    const selectedIncident = useMemo(() => incidentTypes.find((item) => item.id === draft.incidentType), [draft.incidentType]);
    function writeParams(patch, replace = false) {
        setSearchParams((current) => patchSearchParams(current, patch), { replace });
    }
    function goToStep(nextStep, replace = false) {
        writeParams({ step: String(nextStep), done: null, mode: null }, replace);
    }
    function openEmergency() {
        update('incidentType', 'financial');
        writeParams({ mode: 'emergency', done: null, type: 'financial' });
    }
    useEffect(() => {
        const timeout = window.setTimeout(() => {
            saveDraft(draft);
            setSavedLabel(t('report.savedLocally'));
        }, 280);
        setSavedLabel(t('report.saving'));
        return () => window.clearTimeout(timeout);
    }, [draft, t]);
    useEffect(() => {
        if (doneId) {
            const found = findCase(doneId);
            if (found)
                setCompletedCase(found);
            return;
        }
        setCompletedCase(null);
    }, [doneId]);
    useEffect(() => {
        if (doneId || requestedEmergency)
            return;
        if (!searchParams.get('step')) {
            writeParams({ step: '1' }, true);
        }
        // Initialise the step query once so browser back stays inside this report.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        void getFiles('report-evidence').then((files) => {
            evidenceFilesRef.current = files;
            if (!files.length)
                return;
            const names = files.map((file) => file.name);
            setDraft((current) => {
                if (current.evidenceNames.length)
                    return current;
                return {
                    ...current,
                    evidenceNames: names,
                    evidenceItems: names.map(classifyEvidenceName),
                };
            });
        });
    }, []);
    function update(key, value) {
        setDraft((current) => ({ ...current, [key]: value }));
        setErrors((current) => {
            const next = { ...current };
            delete next[key];
            return next;
        });
    }
    function runCopilot() {
        if (draft.copilotText.trim().length < 12) {
            setErrors((current) => ({ ...current, copilotText: t('report.copilotTooShort') }));
            return;
        }
        const result = classifyIncident(draft.copilotText);
        setCopilotResult(result);
        setDraft((current) => ({
            ...current,
            incidentType: result.incidentType,
            description: current.description || current.copilotText,
        }));
        setErrors((current) => {
            const next = { ...current };
            delete next.copilotText;
            delete next.incidentType;
            return next;
        });
    }
    function releaseMic() {
        stopMediaStream(streamRef.current);
        streamRef.current = null;
        recorderRef.current = null;
        chunksRef.current = [];
    }
    async function startVoice() {
        if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            setErrors((current) => ({ ...current, copilotText: t('report.copilotVoiceUnsupported') }));
            return;
        }
        setErrors((current) => {
            const next = { ...current };
            delete next.copilotText;
            return next;
        });
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mime = pickAudioRecorderMime();
            const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
            chunksRef.current = [];
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0)
                    chunksRef.current.push(event.data);
            };
            streamRef.current = stream;
            recorderRef.current = recorder;
            recorder.start(250);
            setListening(true);
        }
        catch (error) {
            releaseMic();
            setListening(false);
            const denied = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError');
            setErrors((current) => ({
                ...current,
                copilotText: denied ? t('report.copilotVoiceDenied') : t('report.copilotVoiceMic'),
            }));
        }
    }
    function stopVoice() {
        const recorder = recorderRef.current;
        if (!recorder || recorder.state === 'inactive') {
            releaseMic();
            setListening(false);
            return;
        }
        setListening(false);
        setVoiceBusy(true);
        recorder.onstop = () => {
            const type = recorder.mimeType || 'audio/webm';
            const blob = new Blob(chunksRef.current, { type });
            releaseMic();
            void finishVoice(blob, type);
        };
        try {
            recorder.stop();
        }
        catch {
            releaseMic();
            setVoiceBusy(false);
        }
    }
    async function finishVoice(blob, type) {
        if (blob.size < 2000) {
            setVoiceBusy(false);
            setErrors((current) => ({ ...current, copilotText: t('report.copilotVoiceTooShort') }));
            return;
        }
        const extension = extensionForMime(type);
        const file = new File([blob], `voice-complaint.${extension}`, { type });
        try {
            const transcript = await transcribeAudio(file, voiceLanguage(i18n.resolvedLanguage || 'en'));
            setDraft((current) => ({
                ...current,
                copilotText: `${current.copilotText}${current.copilotText ? ' ' : ''}${transcript}`.slice(0, 700),
            }));
        }
        catch (error) {
            setErrors((current) => ({
                ...current,
                copilotText: error instanceof Error ? error.message : t('report.copilotVoiceUnsupported'),
            }));
        }
        finally {
            setVoiceBusy(false);
        }
    }
    function toggleVoice() {
        if (voiceBusy)
            return;
        if (listening)
            stopVoice();
        else
            void startVoice();
    }
    useEffect(() => {
        return () => {
            if (recorderRef.current && recorderRef.current.state !== 'inactive') {
                try {
                    recorderRef.current.stop();
                }
                catch {
                    // Already closed.
                }
            }
            stopMediaStream(streamRef.current);
        };
    }, []);
    function validateCurrentStep() {
        const nextErrors = {};
        if (step === 1 && !draft.incidentType) {
            nextErrors.incidentType = t('report.errIncident');
        }
        if (step === 1 && draft.incidentType === 'other' && draft.otherIncident.trim().length < 8) {
            nextErrors.otherIncident = t('report.otherRequired');
        }
        if (step === 2) {
            if (!draft.occurredAt)
                nextErrors.occurredAt = t('report.errDate');
            if (!draft.state)
                nextErrors.state = t('report.errState');
            if (!draft.channel)
                nextErrors.channel = t('report.errChannel');
            if (draft.incidentType === 'financial' && !draft.amount.trim()) {
                nextErrors.amount = t('report.errAmount');
            }
            if (draft.incidentType === 'financial' && !draft.paymentMethod) {
                nextErrors.paymentMethod = t('report.errPayment');
            }
            if (draft.description.trim().length < 30) {
                nextErrors.description = t('report.errDescription');
            }
        }
        if (step === 4) {
            if (!draft.anonymous) {
                if (draft.fullName.trim().length < 2)
                    nextErrors.fullName = t('report.errName');
                if (!/^\d{10}$/.test(draft.mobile.replace(/\s/g, ''))) {
                    nextErrors.mobile = t('report.errMobile');
                }
            }
            if (draft.email && !/^\S+@\S+\.\S+$/.test(draft.email)) {
                nextErrors.email = t('report.errEmail');
            }
            if (!draft.consent)
                nextErrors.consent = t('report.errConsent');
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }
    function nextStep() {
        if (!validateCurrentStep())
            return;
        goToStep(Math.min(4, step + 1));
    }
    function previousStep() {
        setErrors({});
        goToStep(Math.max(1, step - 1));
    }
    function addFiles(files) {
        const list = Array.from(files);
        const oversized = list.find((file) => file.size > 5 * 1024 * 1024);
        if (oversized) {
            setFileError(t('report.fileTooBig', { name: oversized.name }));
            return;
        }
        setFileError('');
        const incoming = Array.from(files);
        const merged = [...evidenceFilesRef.current];
        for (const file of incoming) {
            if (!merged.some((item) => item.name === file.name && item.size === file.size)) {
                merged.push(file);
            }
        }
        const nextFiles = merged.slice(0, 8);
        evidenceFilesRef.current = nextFiles;
        void putFiles('report-evidence', nextFiles);
        const names = nextFiles.map((file) => file.name);
        setDraft((current) => ({
            ...current,
            evidenceNames: names,
            evidenceItems: names.map(classifyEvidenceName),
        }));
    }
    function addSampleEvidence() {
        const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const samples = [
            new File([`CyberDesk sample UPI collect screenshot\nCaptured: ${stamp}\nHandle: refunddesk@upi\nAmount: ₹8,500`], 'upi-collect-screenshot.txt', { type: 'text/plain' }),
            new File([`CyberDesk sample bank SMS export\nCaptured: ${stamp}\nDebit alert for UPI transfer`], 'bank-sms.txt', { type: 'text/plain' }),
            new File([`CyberDesk sample chat log\nCaller claimed to be customer care and asked for remote access.`], 'chat-threat-log.txt', { type: 'text/plain' }),
        ];
        addFiles(samples);
    }
    function validateEmergency() {
        const next = {};
        if (!draft.amount.trim())
            next.amount = t('report.errEmergencyAmount');
        if (!draft.paymentMethod)
            next.paymentMethod = t('report.errEmergencyPayment');
        if (!draft.transactionId.trim())
            next.transactionId = t('report.errEmergencyTxn');
        if (!draft.recipientIdentifier.trim())
            next.recipientIdentifier = t('report.errEmergencyRecipient');
        setErrors(next);
        return Object.keys(next).length === 0;
    }
    async function captureEmergency() {
        if (!validateEmergency())
            return;
        const now = new Date();
        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
        setDraft((current) => ({
            ...current,
            incidentType: 'financial',
            occurredAt: current.occurredAt || local,
            channel: current.channel || (current.paymentMethod === 'UPI' ? 'UPI / payment app' : current.paymentMethod),
            description: current.description
                || `Financial fraud reported: ₹${current.amount} sent via ${current.paymentMethod}. Transaction ${current.transactionId}; recipient ${current.recipientIdentifier}.`,
            emergencyCaptured: true,
        }));
        setEmergencyActionsReady(false);
        await new Promise((resolve) => window.setTimeout(resolve, 650));
        setEmergencyActionsReady(true);
    }
    async function submitReport() {
        if (!validateCurrentStep() || !draft.incidentType)
            return;
        setSubmitting(true);
        await new Promise((resolve) => window.setTimeout(resolve, 850));
        const caseId = makeCaseId();
        const createdAt = new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date());
        const isFinancial = draft.incidentType === 'financial';
        const amountNumber = parseAmount(draft.amount);
        const evidenceCount = draft.evidenceNames.length;
        const evidenceLabel = `${evidenceCount} evidence item${evidenceCount === 1 ? '' : 's'}`;
        const timeline = isFinancial
            ? [
                {
                    label: 'Complaint received',
                    detail: `${evidenceLabel} included with the complaint.`,
                    timestamp: createdAt,
                    status: 'done',
                },
                {
                    label: 'Financial fraud identified',
                    detail: draft.emergencyCaptured
                        ? 'Golden Minutes details already captured.'
                        : 'Incident classified from the report details.',
                    timestamp: createdAt,
                    status: 'done',
                },
                {
                    label: 'Beneficiary bank notification',
                    detail: 'A freeze request is generated from the captured transaction details.',
                    timestamp: draft.emergencyCaptured ? createdAt : 'Current stage',
                    status: draft.emergencyCaptured ? 'done' : 'active',
                },
                {
                    label: 'Transaction tracing',
                    detail: 'Located funds are being reviewed for recovery.',
                    timestamp: draft.emergencyCaptured ? 'Current stage' : 'Pending',
                    status: draft.emergencyCaptured ? 'active' : 'pending',
                },
                {
                    label: 'Fund restoration review',
                    detail: 'Lien-marked funds move to restoration after verification.',
                    timestamp: 'Pending',
                    status: 'pending',
                },
            ]
            : [
                {
                    label: 'Complaint submitted',
                    detail: `${evidenceLabel} included with the complaint.`,
                    timestamp: createdAt,
                    status: 'done',
                },
                {
                    label: 'Initial triage',
                    detail: 'Incident type and location are being checked.',
                    timestamp: 'Current stage',
                    status: 'active',
                },
                {
                    label: 'Jurisdiction assignment',
                    detail: 'The relevant cyber cell receives the case next.',
                    timestamp: 'Pending',
                    status: 'pending',
                },
                {
                    label: 'Officer review',
                    detail: 'Evidence review begins after assignment.',
                    timestamp: 'Pending',
                    status: 'pending',
                },
            ];
        const localEvidence = evidenceFilesRef.current.map((file) => ({
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
        }));
        const record = {
            caseId,
            createdAt,
            incidentType: draft.incidentType,
            state: draft.state || 'Not specified',
            description: draft.incidentType === 'other' && draft.otherIncident.trim()
                ? `${draft.otherIncident.trim()}. ${draft.description}`
                : draft.description,
            anonymous: draft.anonymous,
            progress: isFinancial ? 48 : 22,
            statusLabel: isFinancial
                ? 'Financial response initiated — tracing in progress'
                : 'Complaint received — initial triage',
            assignedUnit: isFinancial ? 'Financial Fraud Response Queue' : 'Assignment pending',
            nextAction: isFinancial ? 'Beneficiary tracing and lien review' : 'Jurisdiction assignment',
            amount: draft.amount,
            paymentMethod: draft.paymentMethod,
            transactionId: draft.transactionId,
            recipientIdentifier: draft.recipientIdentifier,
            evidenceCount,
            evidenceCompleteness: evidenceCompleteness(draft).score,
            evidenceFiles: localEvidence,
            recovery: isFinancial
                ? {
                    reported: amountNumber,
                    traced: Math.round(amountNumber * 0.76),
                    lien: Math.round(amountNumber * 0.47),
                    restorationEligible: Math.round(amountNumber * 0.47),
                    stage: 'traced',
                }
                : undefined,
            timeline,
        };
        saveCase(record);
        setSyncStatus('local');
        if (user) {
            try {
                const cloudEvidence = await uploadEvidenceFiles(caseId, evidenceFilesRef.current);
                const synced = {
                    ...record,
                    evidenceFiles: cloudEvidence.length ? cloudEvidence : localEvidence,
                    evidenceCount: cloudEvidence.length || evidenceCount,
                };
                await saveCloudReport(synced);
                saveCase(synced);
                setCompletedCase(synced);
                setSyncStatus('synced');
                writeSession('track', { caseId: synced.caseId });
                setSubmitting(false);
                writeParams({ done: synced.caseId, step: null, mode: null });
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            catch {
                // The local record remains available if the network or cloud sync fails.
                setSyncStatus('failed');
            }
        }
        writeSession('track', { caseId: record.caseId });
        setCompletedCase(record);
        setSubmitting(false);
        writeParams({ done: record.caseId, step: null, mode: null });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function startOver() {
        clearDraft();
        void clearFiles('report-evidence');
        evidenceFilesRef.current = [];
        setDraft({ ...emptyDraft });
        setCompletedCase(null);
        setSyncStatus(null);
        setErrors({});
        setCopilotResult(null);
        setEmergencyActionsReady(false);
        setSearchParams({ step: '1' }, { replace: true });
    }
    if (emergencyLanding && !completedCase) {
        return (_jsxs(_Fragment, { children: [_jsx(PageIntro, { title: t('report.emergency.title') }), _jsx("section", { className: "page-shell pb-4", children: _jsx("div", { className: "mx-auto max-w-5xl", children: _jsxs("div", { className: "overflow-hidden rounded-2xl border border-alert/20 bg-card shadow-card", children: [_jsxs("div", { className: "flex items-center gap-3 bg-alert px-5 py-3.5 text-ink sm:px-6", children: [_jsx(Zap, { className: "h-4 w-4 shrink-0" }), _jsx("p", { className: "text-sm font-semibold", children: t('report.emergency.help') })] }), _jsxs("div", { className: "p-5 sm:p-7", children: [_jsxs("div", { className: "rounded-2xl border-2 border-alert/25 bg-alert/[0.04] p-4 sm:p-5", children: [_jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] text-alert", children: t('report.emergency.firstMinutes') }), _jsx("h2", { className: "mt-1 text-xl font-bold tracking-[-0.03em] text-paper", children: t('report.emergency.doNow') })] }), _jsxs("a", { href: "tel:1930", className: buttonStyles('danger', 'lg'), children: [_jsx(Zap, { className: "h-4 w-4" }), " ", t('report.emergency.call1930Now')] })] }), _jsx("div", { className: "mt-5 grid gap-3 md:grid-cols-3", children: [
                                                        ['01', t('report.emergency.action1930'), t('report.emergency.action1930Help')],
                                                        ['02', t('report.emergency.actionBank'), t('report.emergency.actionBankHelp')],
                                                        ['03', t('report.emergency.actionSecure'), t('report.emergency.actionSecureHelp')],
                                                    ].map(([number, title, detail]) => (_jsxs("div", { className: "rounded-xl border border-black/[0.08] bg-card p-4", children: [_jsx("span", { className: "font-mono text-[0.65rem] font-bold text-alert", children: number }), _jsx("p", { className: "mt-2 text-sm font-semibold text-paper", children: title }), _jsx("p", { className: "mt-1 text-xs leading-5 text-muted", children: detail })] }, number))) })] }), requestedStory ? (_jsxs("div", { className: "mt-4 rounded-xl border border-brand/20 bg-brand/[0.05] p-4", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.1em] text-brand", children: t('report.emergency.autopilotHeard') }), _jsx("p", { className: "mt-2 text-sm leading-6 text-paper", children: requestedStory }), _jsx("p", { className: "mt-1 text-xs text-muted", children: t('report.emergency.prefilled') })] })) : null, !draft.emergencyCaptured || !emergencyActionsReady ? (_jsxs("div", { className: "mt-6", children: [_jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "field-label", htmlFor: "emergencyAmount", children: t('report.emergency.amount') }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted", children: "\u20B9" }), _jsx("input", { id: "emergencyAmount", value: draft.amount, onChange: (event) => update('amount', event.target.value), className: withError('text-field pl-8', errors.amount), placeholder: "85,000" })] }), _jsx(FieldError, { children: errors.amount })] }), _jsxs("div", { children: [_jsx("label", { className: "field-label", htmlFor: "emergencyMethod", children: t('report.paymentMethod') }), _jsxs("div", { className: "relative", children: [_jsxs("select", { id: "emergencyMethod", value: draft.paymentMethod, onChange: (event) => update('paymentMethod', event.target.value), className: withError('select-field', errors.paymentMethod), children: [_jsx("option", { value: "", children: t('report.chooseMethod') }), paymentMethods.map((method) => (_jsx("option", { children: method }, method)))] }), _jsx(ChevronRight, { className: "pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" })] }), _jsx(FieldError, { children: errors.paymentMethod })] }), _jsxs("div", { children: [_jsx("label", { className: "field-label", htmlFor: "emergencyTxn", children: t('report.transactionId') }), _jsx("input", { id: "emergencyTxn", value: draft.transactionId, onChange: (event) => update('transactionId', event.target.value), className: withError('text-field', errors.transactionId) }), _jsx(FieldError, { children: errors.transactionId })] }), _jsxs("div", { children: [_jsx("label", { className: "field-label", htmlFor: "emergencyRecipient", children: t('report.recipient') }), _jsx("input", { id: "emergencyRecipient", value: draft.recipientIdentifier, onChange: (event) => update('recipientIdentifier', event.target.value), className: withError('text-field', errors.recipientIdentifier) }), _jsx(FieldError, { children: errors.recipientIdentifier })] })] }), _jsxs("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row", children: [_jsxs(Button, { variant: "danger", size: "lg", onClick: () => void captureEmergency(), loading: draft.emergencyCaptured && !emergencyActionsReady, children: [_jsx(Zap, { className: "h-4 w-4" }), " ", t('report.emergency.capture')] }), _jsx("a", { href: "tel:1930", className: cx(buttonStyles('secondary', 'lg'), 'border-alert text-alert hover:border-alert'), children: t('report.emergency.callNow') }), _jsx(Button, { variant: "ghost", size: "lg", onClick: () => {
                                                                setSearchParams({ step: '1' }, { replace: true });
                                                            }, children: t('report.emergency.useNormal') })] })] })) : (_jsxs(motion.div, { className: "mt-6", initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, children: [_jsxs("div", { className: "rounded-2xl border border-brand/25 bg-brand/[0.04] p-5", children: [_jsx("p", { className: "eyebrow text-brand", children: t('report.emergency.package') }), _jsx("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: [
                                                                t('report.emergency.created'),
                                                                t('report.emergency.details'),
                                                                t('report.emergency.bank'),
                                                                t('report.emergency.freeze'),
                                                                t('report.emergency.evidence'),
                                                            ].map((item) => (_jsxs("div", { className: "flex items-center gap-2 rounded-xl border border-black/[0.07] bg-card p-3 text-sm font-medium text-paper", children: [_jsx("span", { className: "flex h-5 w-5 items-center justify-center rounded-full bg-brand", children: _jsx(Check, { className: "h-3 w-3 text-ink" }) }), item] }, item))) })] }), _jsxs("div", { className: "mt-5 flex flex-col gap-3 sm:flex-row", children: [_jsxs(Button, { size: "lg", onClick: () => {
                                                                writeParams({ mode: null, step: '3' });
                                                            }, children: [t('report.emergency.addEvidence'), " ", _jsx(ArrowRight, { className: "h-4 w-4" })] }), _jsx("a", { href: "tel:1930", className: buttonStyles('danger', 'lg'), children: t('actions.call1930', { ns: 'common' }) })] })] }))] })] }) }) })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(PageIntro, { title: t('report.eyebrow') }), _jsx("section", { className: "page-shell pb-4", children: completedCase ? (_jsxs("div", { className: "mx-auto max-w-5xl", children: [_jsx(SuccessView, { record: completedCase, syncStatus: syncStatus }), _jsxs("button", { type: "button", onClick: startOver, className: "mx-auto mt-6 flex items-center gap-2 text-sm font-semibold text-muted hover:text-paper", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), " ", t('report.startOver')] })] })) : (_jsxs("div", { className: "grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]", children: [_jsxs("div", { className: "card overflow-hidden", children: [_jsx("div", { className: "border-b border-black/[0.07] px-4 py-3 sm:px-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("ol", { className: "flex min-w-0 flex-1 items-start", children: steps.map((item, index) => {
                                                    const active = item.id === step;
                                                    const done = item.id < step;
                                                    return (_jsxs("li", { className: "flex min-w-0 flex-1 items-start", children: [index > 0 ? (_jsx("span", { className: cx('mt-[0.45rem] h-px min-w-2 flex-1', done || active ? 'bg-brand' : 'bg-black/15') })) : null, _jsxs("button", { type: "button", onClick: () => done && goToStep(item.id), disabled: !done, "aria-current": active ? 'step' : undefined, className: "flex w-[3.6rem] shrink-0 flex-col items-center gap-1 sm:w-[4.4rem]", children: [_jsx("span", { className: cx('flex h-4 w-4 items-center justify-center rounded-full transition', active && 'bg-brand ring-2 ring-brand/25', done && 'bg-brand', !active && !done && 'border border-black/20 bg-card'), children: done ? _jsx(Check, { className: "h-2.5 w-2.5 text-ink" }) : null }), _jsx("span", { className: cx('text-center text-[0.62rem] leading-tight', active ? 'font-semibold text-paper' : 'text-muted'), children: item.short })] }), index < steps.length - 1 ? (_jsx("span", { className: cx('mt-[0.45rem] h-px min-w-2 flex-1', item.id < step ? 'bg-brand' : 'bg-black/15') })) : null] }, item.id));
                                                }) }), _jsx("p", { className: "hidden shrink-0 text-[0.65rem] text-muted sm:block", children: savedLabel })] }) }), draft.emergencyCaptured ? (_jsx("p", { className: "border-b border-black/[0.07] px-5 py-1.5 text-[0.7rem] font-medium text-brand sm:px-6", children: t('report.emergency.banner') })) : null, _jsxs("div", { className: "p-5 sm:p-6 lg:p-8", children: [_jsxs(AnimatePresence, { mode: "wait", children: [step === 1 ? (_jsxs(motion.div, { initial: { opacity: 0, x: 12 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -12 }, children: [_jsx("h2", { className: "text-lg font-semibold tracking-[-0.02em] text-paper", children: t('report.step1Title') }), _jsxs("div", { className: "mt-5", children: [_jsx("label", { htmlFor: "copilot", className: "field-label", children: t('report.copilotLabel') }), _jsxs("div", { className: cx('relative', listening && 'rounded-lg ring-2 ring-alert/50'), children: [_jsx("textarea", { id: "copilot", value: draft.copilotText, onChange: (event) => update('copilotText', event.target.value.slice(0, 700)), className: withError('text-area min-h-32 pb-16', errors.copilotText), placeholder: t('home.copilot.placeholder'), disabled: listening || voiceBusy }), _jsxs("div", { className: "pointer-events-none absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-2", children: [_jsx("p", { className: "min-w-0 flex-1 text-[0.7rem] leading-4 text-muted", children: voiceBusy ? t('report.copilotVoiceTranscribing') : listening ? t('report.copilotVoiceHint') : t('report.copilotHelp') }), _jsxs("button", { type: "button", onClick: toggleVoice, disabled: voiceBusy, "aria-pressed": listening, "aria-label": listening ? t('report.copilotVoiceStop') : t('report.copilotVoice'), className: cx('pointer-events-auto inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition', listening
                                                                                        ? 'bg-alert text-white'
                                                                                        : 'border border-black/[0.12] bg-card text-paper hover:border-brand hover:text-brand disabled:opacity-60'), children: [voiceBusy ? (_jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" })) : listening ? (_jsx(MicOff, { className: "h-4 w-4" })) : (_jsx(Mic, { className: "h-4 w-4" })), listening ? t('report.copilotVoiceStop') : t('report.copilotVoice')] })] })] }), _jsxs(Button, { type: "button", className: "mt-3", size: "sm", onClick: runCopilot, disabled: listening || voiceBusy, children: [_jsx(Sparkles, { className: "h-4 w-4" }), " ", t('report.copilotClassify')] }), _jsx(FieldError, { children: errors.copilotText }), copilotResult ? (_jsx(motion.div, { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, className: "mt-4 rounded-xl border border-black/[0.08] bg-card p-4", children: _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-brand", children: [copilotResult.severity, " \u00B7 ", copilotResult.route] }), _jsx("p", { className: "mt-1 text-base font-semibold text-paper", children: copilotResult.label }), _jsx("p", { className: "mt-2 text-sm text-muted", children: copilotResult.signals.join(' · ') })] }), copilotResult.incidentType === 'financial' ? (_jsx(Button, { type: "button", variant: "danger", size: "sm", onClick: openEmergency, children: t('report.openEmergency') })) : null] }) })) : null] }), _jsx("div", { className: cx('mt-6 grid gap-2 rounded-xl', errors.incidentType && 'p-1 ring-2 ring-alert/50'), children: incidentTypes.map((incident) => {
                                                                const active = draft.incidentType === incident.id;
                                                                return (_jsxs("button", { type: "button", onClick: () => {
                                                                        update('incidentType', incident.id);
                                                                        if (incident.id !== 'women-child')
                                                                            update('anonymous', false);
                                                                    }, className: cx('flex w-full items-start gap-3 rounded-xl border-2 p-3.5 text-left transition', active
                                                                        ? 'border-brand bg-brand/[0.06] shadow-[inset_0_0_0_1px_rgba(22,104,207,.12)]'
                                                                        : 'border-fieldBorder bg-field hover:border-brand/50 hover:bg-card'), children: [_jsx("span", { className: cx('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', active ? 'border-brand bg-brand' : 'border-fieldBorder bg-card'), "aria-hidden": true, children: active ? _jsx(Check, { className: "h-3 w-3 text-ink" }) : null }), _jsxs("span", { children: [_jsx("span", { className: cx('block text-[0.95rem] font-semibold', active ? 'text-brand' : 'text-paper'), children: t(`incidents.${incident.id}.title`) }), _jsx("span", { className: "mt-0.5 block text-sm leading-5 text-muted", children: t(`incidents.${incident.id}.description`) })] })] }, incident.id));
                                                            }) }), _jsx(FieldError, { children: errors.incidentType }), draft.incidentType === 'other' ? (_jsxs("div", { className: "mt-5", children: [_jsx("label", { className: "field-label", htmlFor: "otherIncident", children: t('report.otherLabel') }), _jsx("textarea", { id: "otherIncident", value: draft.otherIncident, onChange: (event) => update('otherIncident', event.target.value.slice(0, 240)), className: withError('text-area min-h-24', errors.otherIncident), placeholder: t('report.otherPlaceholder') }), _jsx("p", { className: "field-help", children: t('report.otherHelp') }), _jsx(FieldError, { children: errors.otherIncident })] })) : null, draft.incidentType === 'financial' ? (_jsxs("div", { className: "mt-5 rounded-xl bg-alert p-4 text-ink sm:flex sm:items-center sm:justify-between sm:gap-5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold", children: t('report.moneyMoved') }), _jsx("p", { className: "mt-1 text-sm leading-6 text-white/75", children: t('report.moneyMovedHelp') })] }), _jsxs("div", { className: "mt-3 flex shrink-0 gap-2 sm:mt-0", children: [_jsx(Button, { type: "button", variant: "secondary", size: "sm", onClick: openEmergency, children: t('home.lostMoney') }), _jsx("a", { href: "tel:1930", className: "inline-flex h-9 items-center rounded-lg bg-white px-3.5 text-sm font-semibold text-alert hover:bg-white/90", children: t('report.callNow') })] })] })) : null, draft.incidentType === 'women-child' ? (_jsx("div", { className: "mt-5 rounded-xl border-2 border-fieldBorder bg-field p-4", children: _jsxs("label", { className: "flex cursor-pointer items-start gap-3", children: [_jsx("input", { type: "checkbox", checked: draft.anonymous, onChange: (event) => update('anonymous', event.target.checked), className: "mt-0.5 h-4 w-4 accent-brand" }), _jsxs("span", { children: [_jsx("span", { className: "block text-sm font-medium text-paper", children: t('report.anonymous') }), _jsx("span", { className: "mt-1 block text-xs leading-5 text-muted", children: t('report.anonymousHelp') })] })] }) })) : null] }, "step-1")) : null, step === 2 ? (_jsxs(motion.div, { initial: { opacity: 0, x: 12 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -12 }, children: [_jsx("h2", { className: "text-lg font-semibold tracking-[-0.02em] text-paper", children: t('report.step2Title') }), _jsxs("div", { className: "mt-5 grid gap-5 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "field-label", htmlFor: "occurredAt", children: t('report.occurredAt') }), _jsx("input", { id: "occurredAt", type: "datetime-local", value: draft.occurredAt, onChange: (event) => update('occurredAt', event.target.value), className: withError('text-field', errors.occurredAt) }), _jsx(FieldError, { children: errors.occurredAt })] }), _jsxs("div", { children: [_jsx("label", { className: "field-label", htmlFor: "state", children: t('report.state') }), _jsxs("div", { className: "relative", children: [_jsxs("select", { id: "state", value: draft.state, onChange: (event) => update('state', event.target.value), className: withError('select-field', errors.state), children: [_jsx("option", { value: "", children: t('report.chooseLocation') }), indianStates.map((state) => _jsx("option", { value: state, children: state }, state))] }), _jsx(ChevronRight, { className: "pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" })] }), _jsx(FieldError, { children: errors.state })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "field-label", htmlFor: "channel", children: t('report.channel') }), _jsxs("div", { className: "relative", children: [_jsxs("select", { id: "channel", value: draft.channel, onChange: (event) => update('channel', event.target.value), className: withError('select-field', errors.channel), children: [_jsx("option", { value: "", children: t('report.chooseChannel') }), channels.map((channel) => _jsx("option", { value: channel, children: channel }, channel))] }), _jsx(ChevronRight, { className: "pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" })] }), _jsx(FieldError, { children: errors.channel })] }), draft.incidentType === 'financial' ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "field-label", htmlFor: "amount", children: t('report.amount') }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted", children: "\u20B9" }), _jsx("input", { id: "amount", value: draft.amount, onChange: (event) => update('amount', event.target.value), className: withError('text-field pl-8', errors.amount), placeholder: "24,500" })] }), _jsx(FieldError, { children: errors.amount })] }), _jsxs("div", { children: [_jsx("label", { className: "field-label", htmlFor: "paymentMethod", children: t('report.paymentMethod') }), _jsxs("div", { className: "relative", children: [_jsxs("select", { id: "paymentMethod", value: draft.paymentMethod, onChange: (event) => update('paymentMethod', event.target.value), className: withError('select-field', errors.paymentMethod), children: [_jsx("option", { value: "", children: t('report.chooseMethod') }), paymentMethods.map((method) => (_jsx("option", { children: method }, method)))] }), _jsx(ChevronRight, { className: "pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" })] }), _jsx(FieldError, { children: errors.paymentMethod })] }), _jsxs("div", { children: [_jsxs("label", { className: "field-label", htmlFor: "transactionId", children: [t('report.transactionId'), " ", _jsx("span", { className: "font-normal text-muted", children: t('report.optional') })] }), _jsx("input", { id: "transactionId", value: draft.transactionId, onChange: (event) => update('transactionId', event.target.value), className: "text-field", placeholder: "412345678901" })] }), _jsxs("div", { children: [_jsx("label", { className: "field-label", htmlFor: "recipientIdentifier", children: t('report.recipient') }), _jsx("input", { id: "recipientIdentifier", value: draft.recipientIdentifier, onChange: (event) => update('recipientIdentifier', event.target.value), className: withError('text-field', errors.recipientIdentifier), placeholder: "merchant@upi" }), _jsx(FieldError, { children: errors.recipientIdentifier })] })] })) : null, _jsxs("div", { className: "sm:col-span-2", children: [_jsxs("div", { className: "mb-2 flex items-end justify-between gap-4", children: [_jsx("label", { className: "field-label mb-0", htmlFor: "description", children: t('report.whatHappened') }), _jsxs("span", { className: "font-mono text-[0.6rem] text-muted", children: [draft.description.length, "/1000"] })] }), _jsx("textarea", { id: "description", value: draft.description, onChange: (event) => update('description', event.target.value.slice(0, 1000)), className: withError('text-area min-h-44', errors.description), placeholder: t('report.descriptionPlaceholder') }), _jsx("p", { className: "field-help", children: t('report.sensitiveHelp') }), _jsx(FieldError, { children: errors.description })] })] })] }, "step-2")) : null, step === 3 ? (_jsxs(motion.div, { initial: { opacity: 0, x: 12 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -12 }, children: [_jsx("h2", { className: "text-lg font-semibold tracking-[-0.02em] text-paper", children: t('report.step3Title') }), _jsxs("div", { className: "drop-zone mt-5", onDragOver: (event) => event.preventDefault(), onDrop: (event) => {
                                                                event.preventDefault();
                                                                addFiles(event.dataTransfer.files);
                                                            }, onClick: () => fileInputRef.current?.click(), onKeyDown: (event) => {
                                                                if (event.key === 'Enter' || event.key === ' ') {
                                                                    event.preventDefault();
                                                                    fileInputRef.current?.click();
                                                                }
                                                            }, role: "button", tabIndex: 0, children: [_jsx(Plus, { className: "mx-auto h-8 w-8 text-brand" }), _jsx("h3", { className: "mt-3 text-base font-semibold text-paper", children: t('report.evidenceDrop') }), _jsx("p", { className: "mt-1 text-sm text-muted", children: t('report.evidenceTypes') }), _jsx("div", { className: "mt-4 flex justify-center", children: _jsxs("span", { className: cx(buttonStyles('secondary', 'sm'), 'pointer-events-none'), children: [_jsx(Plus, { className: "h-4 w-4" }), " ", t('report.chooseFiles')] }) }), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: "image/png,image/jpeg,application/pdf,text/plain", className: "sr-only", onClick: (event) => event.stopPropagation(), onChange: (event) => event.target.files && addFiles(event.target.files) })] }), fileError ? _jsx(FieldError, { children: fileError }) : null, _jsx("div", { className: "mt-4", children: _jsx("button", { type: "button", onClick: addSampleEvidence, className: "link-accent text-sm font-semibold", children: t('report.addSampleEvidence') }) }), draft.evidenceNames.length ? (_jsx("div", { className: "mt-5 grid gap-2", children: draft.evidenceNames.map((name, index) => (_jsxs("div", { className: "flex items-center justify-between gap-4 rounded-xl border border-black/[0.08] px-4 py-3", children: [_jsx("div", { className: "flex min-w-0 items-center gap-3", children: _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-sm font-semibold text-paper", children: name }), _jsx("p", { className: "mt-0.5 font-mono text-[0.57rem] uppercase tracking-[0.12em] text-muted", children: t('report.attached') })] }) }), _jsx("button", { type: "button", onClick: () => {
                                                                            const names = draft.evidenceNames.filter((_, itemIndex) => itemIndex !== index);
                                                                            evidenceFilesRef.current = evidenceFilesRef.current.filter((_, itemIndex) => itemIndex !== index);
                                                                            void putFiles('report-evidence', evidenceFilesRef.current);
                                                                            setDraft((current) => ({
                                                                                ...current,
                                                                                evidenceNames: names,
                                                                                evidenceItems: names.map(classifyEvidenceName),
                                                                            }));
                                                                        }, className: "rounded-lg p-2 text-muted hover:bg-alert/[0.08] hover:text-alert", "aria-label": t('report.removeFile', { name }), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, `${name}-${index}`))) })) : null, _jsx("p", { className: "mt-4 text-xs leading-5 text-muted", children: t('report.evidenceKeep') })] }, "step-3")) : null, step === 4 ? (_jsxs(motion.div, { initial: { opacity: 0, x: 12 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -12 }, children: [_jsx("h2", { className: "text-lg font-semibold tracking-[-0.02em] text-paper", children: t('report.step4Title') }), !draft.anonymous ? (_jsxs("div", { className: "mt-5 rounded-xl border-2 border-fieldBorder bg-field p-4 sm:p-5", children: [_jsx("h3", { className: "mb-4 text-sm font-semibold text-paper", children: t('report.contactDetails') }), _jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "field-label", htmlFor: "fullName", children: t('report.fullName') }), _jsx("input", { id: "fullName", value: draft.fullName, onChange: (event) => update('fullName', event.target.value), className: withError('text-field', errors.fullName), placeholder: t('report.fullNamePlaceholder') }), _jsx(FieldError, { children: errors.fullName })] }), _jsxs("div", { children: [_jsx("label", { className: "field-label", htmlFor: "mobile", children: t('report.mobile') }), _jsx("input", { id: "mobile", inputMode: "numeric", value: draft.mobile, onChange: (event) => update('mobile', event.target.value.replace(/\D/g, '').slice(0, 10)), className: withError('text-field', errors.mobile), placeholder: "9000001930" }), _jsx(FieldError, { children: errors.mobile })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsxs("label", { className: "field-label", htmlFor: "email", children: [t('report.email'), " ", _jsx("span", { className: "font-normal text-muted", children: t('report.optional') })] }), _jsx("input", { id: "email", type: "email", value: draft.email, onChange: (event) => update('email', event.target.value), className: withError('text-field', errors.email), placeholder: "aarav@example.com" }), _jsx(FieldError, { children: errors.email })] })] })] })) : (_jsxs("div", { className: "mt-6 rounded-xl border border-black/[0.08] p-5", children: [_jsx("p", { className: "text-sm font-medium text-paper", children: t('report.anonymousSelected') }), _jsx("p", { className: "mt-1 text-sm leading-6 text-muted", children: t('report.anonymousSelectedHelp') })] })), _jsxs("div", { className: "mt-5 surface-soft p-5 sm:p-6", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between gap-4", children: [_jsx("h3", { className: "text-base font-semibold text-paper", children: t('report.summary') }), _jsx("button", { type: "button", onClick: () => goToStep(1), className: "link-accent text-xs", children: t('report.edit') })] }), _jsx(SummaryRow, { label: t('report.summaryIncident'), value: selectedIncident ? t(`incidents.${selectedIncident.id}.title`) : '', empty: t('report.notAdded') }), draft.incidentType === 'other' ? (_jsx(SummaryRow, { label: t('report.summaryType'), value: draft.otherIncident, empty: t('report.notAdded') })) : null, _jsx(SummaryRow, { label: t('report.summaryOccurred'), value: formatDateTime(draft.occurredAt, i18n.language, t('report.notAdded')), empty: t('report.notAdded') }), _jsx(SummaryRow, { label: t('report.summaryLocation'), value: draft.state, empty: t('report.notAdded') }), _jsx(SummaryRow, { label: t('report.summaryChannel'), value: draft.channel, empty: t('report.notAdded') }), draft.incidentType === 'financial' ? (_jsxs(_Fragment, { children: [_jsx(SummaryRow, { label: t('report.summaryAmount'), value: draft.amount ? `₹${draft.amount}` : '', empty: t('report.notAdded') }), _jsx(SummaryRow, { label: t('report.summaryPayment'), value: draft.paymentMethod, empty: t('report.notAdded') }), _jsx(SummaryRow, { label: t('report.summaryTransaction'), value: draft.transactionId, empty: t('report.notAdded') }), _jsx(SummaryRow, { label: t('report.summaryRecipient'), value: draft.recipientIdentifier, empty: t('report.notAdded') })] })) : null, _jsx(SummaryRow, { label: t('report.summaryEvidence'), value: draft.evidenceNames.length ? t('report.evidenceFiles', { count: draft.evidenceNames.length }) : t('report.noFiles'), empty: t('report.notAdded') }), _jsx(SummaryRow, { label: t('report.summaryDescription'), value: draft.description, empty: t('report.notAdded') })] }), _jsxs("label", { className: cx('mt-5 flex cursor-pointer items-start gap-3 rounded-xl border-2 bg-field p-4', errors.consent ? 'border-alert bg-alert/[0.06]' : 'border-fieldBorder hover:border-brand/50'), children: [_jsx("input", { type: "checkbox", checked: draft.consent, onChange: (event) => update('consent', event.target.checked), className: "mt-1 h-4 w-4 accent-brand" }), _jsxs("span", { children: [_jsx("span", { className: "block text-sm font-semibold text-paper", children: t('report.consent') }), _jsx("span", { className: "mt-1 block text-xs leading-5 text-muted", children: t('report.consentHelp') })] })] }), _jsx(FieldError, { children: errors.consent })] }, "step-4")) : null] }), _jsxs("div", { className: "mt-7 flex flex-col-reverse gap-3 border-t border-black/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs(Button, { variant: "ghost", size: "lg", onClick: previousStep, disabled: step === 1, children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), " ", t('actions.back', { ns: 'common' })] }), step < 4 ? (_jsxs(Button, { size: "lg", onClick: nextStep, children: [t('actions.continue', { ns: 'common' }), " ", _jsx(ArrowRight, { className: "h-4 w-4" })] })) : (_jsxs(Button, { size: "lg", onClick: submitReport, loading: submitting, children: [_jsx(ShieldCheck, { className: "h-4 w-4" }), " ", t('report.submit')] }))] })] })] }), _jsxs("aside", { className: "space-y-4 lg:sticky lg:top-6 lg:self-start", children: [_jsxs("div", { className: "surface-soft p-4", children: [_jsx("p", { className: "text-sm font-medium text-paper", children: t('report.includeTitle') }), selectedIncident ? (_jsx("p", { className: "mt-2 text-sm leading-5 text-muted", children: t(`incidents.${selectedIncident.id}.hint`) })) : null, _jsxs("ul", { className: "mt-3 space-y-2 text-sm leading-5 text-muted", children: [_jsx("li", { children: t('report.include1') }), _jsx("li", { children: t('report.include2') }), _jsx("li", { children: t('report.include3') })] })] }), _jsxs("div", { className: "rounded-2xl bg-alert p-5 text-ink", children: [_jsx("p", { className: "text-sm font-semibold", children: t('home.lostMoney') }), _jsx("p", { className: "mt-2 text-xs leading-5 text-white/75", children: t('report.moneyMovedHelp') }), _jsxs("div", { className: "mt-4 grid gap-2", children: [_jsxs("button", { type: "button", onClick: openEmergency, className: "flex h-9 w-full items-center justify-center rounded-lg bg-white text-sm font-semibold text-alert hover:bg-white/90", children: [_jsx(Zap, { className: "mr-2 h-4 w-4" }), " ", t('home.lostMoney')] }), _jsx("a", { href: "tel:1930", className: "flex h-9 w-full items-center justify-center rounded-lg bg-white/10 text-sm font-semibold text-white hover:bg-white/15", children: t('actions.call1930', { ns: 'common' }) })] })] })] })] })) })] }));
}
