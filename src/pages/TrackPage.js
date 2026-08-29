import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button, buttonStyles } from '../components/Button';
import { EvidenceList } from '../components/EvidenceList';
import { PageIntro } from '../components/PageIntro';
import { useAuth } from '../context/AuthContext';
import { brand } from '../data/brand';
import { cx } from '../lib/cx';
import { findCloudReport, loadCloudReports } from '../lib/reportsApi';
import { patchSearchParams, writeSession } from '../lib/session';
import { defaultCase, findCase, loadCases } from '../lib/storage';
import { useTranslation } from 'react-i18next';
function formatMoney(value) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}
function MoneyRecoveryTracker({ recovery }) {
    const { t } = useTranslation('pages');
    const steps = [
        { label: t('track.stepReported'), amount: recovery.reported, done: true },
        { label: t('track.stepTraced'), amount: recovery.traced, done: recovery.traced > 0 },
        { label: t('track.stepLien'), amount: recovery.lien, done: recovery.lien > 0 },
        { label: t('track.stepReview'), amount: recovery.restorationEligible, done: recovery.stage === 'review' || recovery.stage === 'refunded' },
        { label: t('track.stepRefund'), amount: recovery.stage === 'refunded' ? recovery.restorationEligible : 0, done: recovery.stage === 'refunded' },
    ];
    const activeIndex = recovery.stage === 'reported' ? 0 : recovery.stage === 'traced' ? 1 : recovery.stage === 'lien' ? 2 : recovery.stage === 'review' ? 3 : 4;
    return (_jsxs("div", { className: "rounded-xl border-2 border-brand/25 bg-field p-4 sm:p-5", children: [_jsx("h3", { className: "text-sm font-semibold text-paper", children: t('track.moneyRecovery') }), _jsx("div", { className: "mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
                    [t('track.reportedLoss'), recovery.reported],
                    [t('track.amountTraced'), recovery.traced],
                    [t('track.lienMarked'), recovery.lien],
                    [t('track.eligibleRestoration'), recovery.restorationEligible],
                ].map(([label, value]) => (_jsxs("div", { className: "rounded-xl border border-black/[0.07] bg-card p-4", children: [_jsx("p", { className: "font-mono text-[0.57rem] font-bold uppercase tracking-[0.12em] text-muted", children: label }), _jsx("p", { className: "mt-2 text-xl font-bold tracking-[-0.03em] text-paper", children: formatMoney(Number(value)) })] }, String(label)))) }), _jsx("div", { className: "mt-6 overflow-x-auto pb-1", children: _jsx("div", { className: "min-w-[640px]", children: _jsxs("div", { className: "relative grid grid-cols-5 gap-2", children: [_jsx("div", { className: "absolute left-[10%] right-[10%] top-3 h-px bg-black/[0.12]" }), _jsx("div", { className: "absolute left-[10%] top-3 h-px bg-brand", style: { width: `${(activeIndex / 4) * 80}%` } }), steps.map((item, index) => (_jsxs("div", { className: "relative z-10 text-center", children: [_jsx("span", { className: cx('mx-auto flex h-6 w-6 items-center justify-center rounded-full border-4 border-field', index < activeIndex ? 'bg-brand' : index === activeIndex ? 'bg-card ring-[3px] ring-inset ring-brand' : 'bg-black/15'), children: index < activeIndex ? _jsx(Check, { className: "h-3 w-3 text-ink" }) : null }), _jsx("p", { className: cx('mt-2 text-xs font-semibold', index <= activeIndex ? 'text-paper' : 'text-muted'), children: item.label }), _jsx("p", { className: "mt-1 font-mono text-[0.58rem] text-muted", children: item.amount ? formatMoney(item.amount) : t('track.pending') })] }, item.label)))] }) }) })] }));
}
function getCase(reference) {
    const clean = reference.trim().toUpperCase();
    if (clean === defaultCase.caseId)
        return defaultCase;
    return findCase(clean);
}
function downloadStatus(record) {
    const lines = [
        `${brand.name.toUpperCase()} — COMPLAINT STATUS`,
        '',
        `Reference: ${record.caseId}`,
        `Created: ${record.createdAt}`,
        `Status: ${record.statusLabel}`,
        `Progress: ${record.progress}%`,
        `Assigned unit: ${record.assignedUnit}`,
        record.recovery
            ? `Reported: ${formatMoney(record.recovery.reported)} | Traced: ${formatMoney(record.recovery.traced)} | Lien: ${formatMoney(record.recovery.lien)} | Restoration eligible: ${formatMoney(record.recovery.restorationEligible)}`
            : '',
        '',
        'TIMELINE',
        ...record.timeline.map((item) => `- ${item.label} | ${item.timestamp} | ${item.detail}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${record.caseId}-status.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
}
export function TrackPage() {
    const { t } = useTranslation('pages');
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const caseQuery = searchParams.get('case') ?? '';
    const [reference, setReference] = useState(caseQuery);
    const [record, setRecord] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [cloudCases, setCloudCases] = useState([]);
    const recentCases = useMemo(() => {
        const byCaseId = new Map();
        for (const item of [...cloudCases, ...loadCases()]) {
            if (!byCaseId.has(item.caseId))
                byCaseId.set(item.caseId, item);
        }
        return [...byCaseId.values()];
    }, [cloudCases, record]);
    const hydratedCase = useRef('');
    function writeCase(nextCase, replace = false) {
        setSearchParams((current) => patchSearchParams(current, { case: nextCase }), { replace });
    }
    async function runSearch(value = reference, options = {}) {
        const { delay = true, syncUrl = true } = options;
        const clean = value.trim().toUpperCase();
        if (!clean) {
            setError(t('track.enterRef'));
            setRecord(null);
            if (syncUrl)
                writeCase(null);
            return;
        }
        setLoading(true);
        setError('');
        if (delay)
            await new Promise((resolve) => window.setTimeout(resolve, 280));
        let found = getCase(clean) ?? cloudCases.find((item) => item.caseId.toUpperCase() === clean);
        if (!found && user) {
            try {
                found = await findCloudReport(clean);
                if (found) {
                    setCloudCases((current) => [
                        found,
                        ...current.filter((item) => item.caseId !== found.caseId),
                    ]);
                }
            }
            catch {
                // Local and demo tracking remain available when cloud sync is offline.
            }
        }
        if (!found) {
            setRecord(null);
            setError(t('track.noMatch'));
        }
        else {
            setRecord(found);
            setReference(found.caseId);
            hydratedCase.current = found.caseId;
            writeSession('track', { caseId: found.caseId });
            if (syncUrl)
                writeCase(found.caseId);
        }
        setLoading(false);
    }
    useEffect(() => {
        if (!user) {
            setCloudCases([]);
            return;
        }
        let active = true;
        void loadCloudReports()
            .then((items) => {
            if (active)
                setCloudCases(items);
        })
            .catch(() => {
            if (active)
                setCloudCases([]);
        });
        return () => {
            active = false;
        };
    }, [user]);
    useEffect(() => {
        if (caseQuery) {
            setReference(caseQuery);
            const hydrationKey = `${user?.id ?? 'guest'}:${caseQuery}`;
            if (hydratedCase.current === hydrationKey)
                return;
            hydratedCase.current = hydrationKey;
            void runSearch(caseQuery, { delay: false, syncUrl: false });
            return;
        }
        hydratedCase.current = '';
        setRecord(null);
        // Keep the search box as-is when the case query is cleared with browser back.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [caseQuery, user?.id]);
    const incidentTitle = record
        ? t(`incidents.${record.incidentType}.title`, { defaultValue: record.incidentType })
        : '';
    return (_jsxs(_Fragment, { children: [_jsx(PageIntro, { title: t('track.eyebrow'), aside: _jsxs("button", { type: "button", onClick: () => {
                        setReference(defaultCase.caseId);
                        void runSearch(defaultCase.caseId);
                    }, className: "rounded-lg border-2 border-fieldBorder bg-field px-3 py-2 text-left hover:border-brand/50", children: [_jsx("p", { className: "text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted", children: t('track.recentCase') }), _jsx("p", { className: "font-mono text-sm font-bold text-brand", children: defaultCase.caseId })] }) }), _jsxs("section", { className: "page-shell pb-4", children: [_jsxs("div", { className: "card mx-auto max-w-5xl overflow-hidden", children: [_jsx("div", { className: "border-b border-black/[0.07] p-5 sm:p-6", children: _jsxs("form", { onSubmit: (event) => {
                                        event.preventDefault();
                                        void runSearch();
                                    }, children: [_jsx("label", { htmlFor: "caseReference", className: "field-label", children: t('track.reference') }), _jsxs("div", { className: "relative", children: [_jsx("input", { id: "caseReference", value: reference, onChange: (event) => {
                                                        setReference(event.target.value.toUpperCase());
                                                        setError('');
                                                    }, className: cx('text-field h-12 pr-24 font-mono text-sm uppercase tracking-[0.04em]', error && 'field-invalid'), placeholder: defaultCase.caseId, autoComplete: "off" }), _jsx(Button, { type: "submit", size: "md", loading: loading, className: "absolute right-1 top-1 h-10", children: t('track.track') })] }), error ? (_jsx("p", { className: "mt-3 text-sm font-semibold text-alert", children: error })) : null] }) }), _jsx("div", { className: "p-5 sm:p-6 lg:p-8", children: _jsx(AnimatePresence, { mode: "wait", children: loading ? (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "py-8", children: _jsx("p", { className: "text-sm font-medium text-paper", children: t('track.loading') }) }, "loading")) : record ? (_jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted", children: t('track.currentStatus') }), _jsx("h2", { className: "mt-2 max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-paper sm:text-3xl", children: record.statusLabel }), _jsxs("p", { className: "mt-4 text-sm text-muted", children: [record.caseId, " \u00B7 Created ", record.createdAt, " \u00B7 ", record.progress, "% complete"] })] }), _jsxs("div", { className: "mt-6 grid gap-6 border-y border-black/[0.07] py-5 sm:grid-cols-3", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: t('track.assignedUnit') }), _jsx("p", { className: "mt-2 text-sm font-medium leading-6 text-paper", children: record.assignedUnit })] }), _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: t('report.summaryIncident') }), _jsx("p", { className: "mt-2 text-sm font-medium leading-6 text-paper", children: incidentTitle })] }), _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: t('track.nextAction') }), _jsx("p", { className: "mt-2 text-sm font-medium leading-6 text-paper", children: t('track.waitTimeline') })] })] }), record.recovery ? (_jsx("div", { className: "mt-7", children: _jsx(MoneyRecoveryTracker, { recovery: record.recovery }) })) : null, _jsx(EvidenceList, { files: record.evidenceFiles, className: "mt-7" }), _jsxs("div", { className: "mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]", children: [_jsxs("div", { children: [_jsx("div", { className: "mb-4", children: _jsx("h3", { className: "text-sm font-semibold text-paper", children: t('track.caseTimeline') }) }), _jsx("div", { className: "relative ml-3 border-l border-black/[0.10] pl-7", children: record.timeline.map((item, index) => (_jsxs("div", { className: "relative pb-8 last:pb-0", children: [_jsx("span", { className: cx('absolute -left-[2.23rem] top-0 flex h-5 w-5 items-center justify-center rounded-full border-4 border-card', item.status === 'done' && 'bg-brand', item.status === 'active' && 'bg-card ring-[3px] ring-inset ring-brand', item.status === 'pending' && 'bg-black/15'), children: item.status === 'done' ? _jsx(Check, { className: "h-2.5 w-2.5 text-ink" }) : null }), _jsxs("div", { className: "flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5", children: [_jsxs("div", { children: [_jsx("p", { className: cx('text-sm font-semibold', item.status === 'pending' ? 'text-muted' : 'text-paper'), children: item.label }), _jsx("p", { className: "mt-1 max-w-xl text-xs leading-5 text-muted", children: item.detail })] }), _jsx("span", { className: cx('shrink-0 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em]', item.status === 'active' ? 'text-brand' : 'text-muted'), children: item.timestamp })] })] }, `${item.label}-${index}`))) })] }), _jsxs("aside", { className: "space-y-3", children: [_jsx("p", { className: "text-sm leading-6 text-muted", children: t('track.nextUpdate') }), _jsx(Button, { variant: "secondary", size: "lg", className: "w-full", onClick: () => downloadStatus(record), children: "Download status" }), _jsx("button", { type: "button", onClick: () => navigator.clipboard?.writeText(record.caseId).catch(() => undefined), className: "flex h-11 w-full items-center justify-center text-sm text-muted hover:text-paper", children: "Copy reference" })] })] })] }, record.caseId)) : (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "py-6", children: [_jsx("p", { className: "text-sm leading-6 text-muted", children: t('track.emptyBody') }), _jsx("button", { type: "button", onClick: () => {
                                                    setReference(defaultCase.caseId);
                                                    void runSearch(defaultCase.caseId);
                                                }, className: cx(buttonStyles('primary', 'md'), 'mt-5 w-fit'), children: t('track.openRecent') })] }, "empty")) }) })] }), recentCases.length ? (_jsxs("div", { className: "mx-auto mt-6 max-w-5xl", children: [_jsx("p", { className: "eyebrow mb-3", children: t('track.recent') }), _jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: recentCases.slice(0, 4).map((item) => (_jsxs("button", { type: "button", onClick: () => {
                                        setReference(item.caseId);
                                        void runSearch(item.caseId);
                                    }, className: "group flex items-center justify-between gap-4 rounded-xl border border-black/[0.08] px-4 py-3 text-left transition hover:border-brand/50 hover:bg-mist", children: [_jsxs("div", { children: [_jsx("p", { className: "font-mono text-xs font-bold text-paper group-hover:text-brand", children: item.caseId }), _jsx("p", { className: "mt-1 text-[0.68rem] text-muted", children: item.statusLabel })] }), _jsx(ChevronRight, { className: "h-4 w-4 shrink-0 text-muted" })] }, item.caseId))) })] })) : null] })] }));
}
