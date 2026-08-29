import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ArrowRight, BadgeIndianRupee, BookOpen, FileSearch, FileText, ImagePlus, LoaderCircle, Mic, MicOff, Monitor, Search, ShieldCheck, Sparkles, UserRoundX, Zap, } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { buttonStyles } from '../components/Button';
import { cx } from '../lib/cx';
import { resolveCitizenIntent } from '../lib/routeIntent';
import { useResolvedTheme } from '../lib/theme';
import { useVoiceTranscription } from '../lib/useVoiceTranscription';
const heroCardMeta = [
    {
        src: '/cards/women_children.png',
        srcDark: '/cyber_rakshak_card_art_transparent_white-dark/women_children-dark.png',
        icon: ShieldCheck,
        key: 'women',
        to: '/report?type=women-child&anonymous=1',
        offset: 'md:mt-8',
        visibility: '',
    },
    {
        src: '/cards/financial_fraud.png',
        srcDark: '/cyber_rakshak_card_art_transparent_white-dark/financial_fraud-dark.png',
        icon: BadgeIndianRupee,
        key: 'financial',
        to: 'tel:1930',
        offset: 'md:mt-4',
        visibility: '',
    },
    {
        src: '/cards/hacked_account.png',
        srcDark: '/cyber_rakshak_card_art_transparent_white-dark/hacked_account-dark.png',
        icon: UserRoundX,
        key: 'account',
        to: '/report?type=account',
        offset: '',
        visibility: '',
    },
    {
        src: '/cards/suspicious_number.png',
        srcDark: '/cyber_rakshak_card_art_transparent_white-dark/suspicious_number-dark.png',
        icon: Search,
        key: 'check',
        to: '/check',
        offset: 'md:mt-4',
        visibility: '',
    },
    {
        src: '/cards/your_complaint.png',
        srcDark: '/cyber_rakshak_card_art_transparent_white-dark/your_complaint-dark.png',
        icon: FileSearch,
        key: 'track',
        to: '/track',
        offset: 'md:mt-8',
        visibility: 'hidden md:block',
    },
];
const learningMeta = [
    { href: '/learn', icon: BookOpen, key: 'manual', iconClass: 'bg-[#eaf2fd] text-brand dark:bg-white/[0.06] dark:text-paper' },
    { href: '/learn#safety', icon: ShieldCheck, key: 'safety', iconClass: 'bg-[#e8f7ee] text-[#1f8a4c] dark:bg-white/[0.06] dark:text-paper' },
    { href: '/learn#awareness', icon: Monitor, key: 'awareness', iconClass: 'bg-[#eef1f7] text-[#2b4c7e] dark:bg-white/[0.06] dark:text-paper' },
    { href: '/learn#digest', icon: FileText, key: 'digest', iconClass: 'bg-[#fdf3e4] text-[#b45309] dark:bg-white/[0.06] dark:text-paper' },
];
function HeroCard({ src, icon: Icon, label, action, to, offset, visibility, }) {
    const [loaded, setLoaded] = useState(false);
    const isPhone = to.startsWith('tel:');
    const content = (_jsxs(_Fragment, { children: [_jsxs("span", { className: "flex items-center gap-1.5 text-[0.78rem] font-semibold leading-tight text-paper", children: [_jsx(Icon, { className: "h-3.5 w-3.5 shrink-0 text-brand", "aria-hidden": true }), label] }), _jsxs("span", { className: cx('mt-2 inline-flex items-center gap-1 text-[0.74rem] font-semibold', isPhone ? 'text-alert' : 'text-brand'), children: [action, _jsx(ArrowRight, { className: "h-3 w-3 transition group-hover:translate-x-0.5", "aria-hidden": true })] })] }));
    const cardClass = cx('group block w-full min-w-0 overflow-hidden rounded-[1.5rem] border border-black/[0.06] bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-soft dark:hover:translate-y-0 dark:hover:shadow-none', offset, visibility);
    const body = (_jsxs(_Fragment, { children: [_jsxs("span", { className: "relative block aspect-[6/7] w-full bg-card", children: [_jsx("img", { src: src, alt: "", onLoad: () => setLoaded(true), onError: (event) => {
                            event.currentTarget.style.display = 'none';
                        }, className: cx('absolute inset-0 h-full w-full object-contain p-2', loaded ? 'opacity-100' : 'opacity-0') }, src), !loaded ? (_jsx("span", { className: "absolute inset-0 flex items-center justify-center", children: _jsx(ImagePlus, { className: "h-6 w-6 text-[#d6dbe2]", "aria-hidden": true }) })) : null] }), _jsx("span", { className: "block border-t border-black/[0.05] px-3.5 py-3 text-left", children: content })] }));
    return isPhone ? (_jsx("a", { href: to, className: cardClass, children: body })) : (_jsx(Link, { to: to, className: cardClass, children: body }));
}
export function HomePage() {
    const { t, i18n } = useTranslation(['pages', 'common']);
    const navigate = useNavigate();
    const theme = useResolvedTheme();
    const [copilotText, setCopilotText] = useState('');
    const [copilotResult, setCopilotResult] = useState(null);
    const [copilotError, setCopilotError] = useState('');
    const voice = useVoiceTranscription({
        language: i18n.resolvedLanguage || 'en',
        onTranscript(transcript) {
            setCopilotText(transcript.slice(0, 700));
            setCopilotError('');
            setCopilotResult(resolveCitizenIntent(transcript));
        },
    });
    function runCopilot(nextText = copilotText) {
        if (nextText.trim().length < 12) {
            setCopilotResult(null);
            setCopilotError(t('home.copilot.tooShort'));
            return;
        }
        setCopilotError('');
        setCopilotResult(resolveCitizenIntent(nextText));
    }
    function openCopilotRoute() {
        if (!copilotResult)
            return;
        navigate(copilotResult.url);
    }
    return (_jsxs(_Fragment, { children: [_jsxs("section", { className: "relative isolate flex min-h-[calc(100dvh-4rem)] flex-col justify-center py-8", children: [_jsx("img", { src: theme === 'dark' ? '/hero3-dark.png' : '/hero3.png', alt: "", "aria-hidden": true, className: "pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-center" }), _jsxs("div", { className: "page-shell flex flex-col items-center text-center", children: [_jsx("p", { className: "inline-flex rounded-full bg-brand/[0.08] px-3 py-1 text-[0.75rem] font-medium text-brand", children: t('home.badge') }), _jsx("h1", { className: "mt-3.5 max-w-[20ch] text-[clamp(1.9rem,4.2vw,3rem)] font-bold leading-[1.06] tracking-[-0.04em] text-paper", children: t('home.title') }), _jsxs("div", { className: "mt-6 w-full max-w-3xl text-left", children: [_jsxs("div", { className: cx('relative rounded-[1.6rem] border bg-card/95 p-2 shadow-card backdrop-blur-xl transition-colors focus-within:border-brand/45 dark:shadow-none', voice.listening ? 'border-alert/45' : 'border-brand/20'), children: [_jsx("span", { "aria-hidden": true, className: "pointer-events-none absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" }), _jsxs("div", { className: "flex items-center gap-2 px-2.5 pt-2", children: [_jsx(Sparkles, { className: "h-3.5 w-3.5 text-brand", "aria-hidden": true }), _jsx("p", { className: "text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brand", children: t('home.copilot.eyebrow') }), voice.listening ? (_jsxs("span", { className: "ml-auto inline-flex items-center gap-1.5 text-[0.68rem] font-semibold text-alert", children: [_jsxs("span", { className: "relative flex h-2 w-2", children: [_jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-alert opacity-70" }), _jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-alert" })] }), t('home.copilot.stopListening')] })) : null] }), _jsx("textarea", { value: copilotText, onChange: (event) => {
                                                    setCopilotText(event.target.value.slice(0, 700));
                                                    setCopilotResult(null);
                                                    setCopilotError('');
                                                }, rows: 2, className: "mt-1 w-full resize-none bg-transparent px-2.5 py-1.5 text-[0.95rem] leading-6 text-paper outline-none placeholder:text-placeholder", placeholder: t('home.copilot.placeholder') }), _jsxs("div", { className: "flex items-center justify-between gap-2 px-1.5 pb-1.5", children: [_jsxs("button", { type: "button", onClick: voice.toggle, disabled: voice.processing, "aria-label": t('home.copilot.speak'), className: cx('inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition disabled:opacity-60 sm:px-4', voice.listening
                                                            ? 'bg-alert text-ink hover:bg-alertDark'
                                                            : 'bg-brand/[0.10] text-brand hover:bg-brand/[0.16]'), children: [voice.processing ? (_jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" })) : voice.listening ? (_jsx(MicOff, { className: "h-4 w-4" })) : (_jsx(Mic, { className: "h-4 w-4" })), _jsx("span", { className: "hidden sm:inline", children: voice.processing
                                                                    ? t('home.copilot.processing')
                                                                    : voice.listening
                                                                        ? t('home.copilot.stopListening')
                                                                        : t('home.copilot.speak') })] }), _jsxs("button", { type: "button", onClick: () => runCopilot(), className: "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-ink transition hover:bg-brandDark", children: [t('home.copilot.understand'), _jsx(ArrowRight, { className: "h-4 w-4", "aria-hidden": true })] })] })] }), _jsx("div", { className: "mt-3 flex flex-wrap items-center gap-1.5", children: [
                                            t('home.copilot.sampleMoney'),
                                            t('home.copilot.sampleCall'),
                                            t('home.copilot.sampleNotice'),
                                            t('home.copilot.sampleNumber'),
                                        ].map((sample) => (_jsx("button", { type: "button", onClick: () => {
                                                setCopilotText(sample);
                                                runCopilot(sample);
                                            }, className: "rounded-full border border-black/[0.09] bg-card/70 px-2.5 py-1 text-[0.7rem] text-muted backdrop-blur transition hover:border-brand/50 hover:text-paper", children: sample }, sample))) }), copilotError || voice.error ? (_jsx("p", { className: "mt-3 text-sm font-semibold text-alert", children: copilotError || voice.error })) : null, copilotResult ? (_jsxs("div", { className: "mt-3 flex flex-col gap-3 rounded-2xl border border-brand/20 bg-card/95 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("p", { className: "font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-brand", children: [copilotResult.result.severity, " \u00B7 ", copilotResult.destinationLabel] }), _jsx("p", { className: "mt-1 text-sm font-semibold text-paper", children: copilotResult.result.label }), _jsx("p", { className: "mt-1 text-xs leading-5 text-muted", children: copilotResult.result.signals.join(' · ') }), copilotResult.extracted ? (_jsxs("p", { className: "mt-2 truncate font-mono text-[0.7rem] text-brand", children: [t('home.copilot.found'), ": ", copilotResult.extracted.value] })) : null] }), _jsxs("button", { type: "button", onClick: openCopilotRoute, className: cx(copilotResult.destination === 'emergency'
                                                    ? buttonStyles('danger', 'md')
                                                    : buttonStyles('primary', 'md'), 'shrink-0 rounded-full px-5'), children: [copilotResult.actionLabel, _jsx(ArrowRight, { className: "h-4 w-4", "aria-hidden": true })] })] })) : null] }), _jsxs("div", { className: "mt-5 flex flex-wrap items-center justify-center gap-2", children: [_jsxs(Link, { to: "/report?type=financial&mode=emergency", className: cx(buttonStyles('danger', 'sm'), 'rounded-full px-4'), children: [_jsx(Zap, { className: "h-3.5 w-3.5", "aria-hidden": true }), t('home.lostMoney')] }), _jsx("a", { href: "tel:1930", className: cx(buttonStyles('secondary', 'sm'), 'rounded-full px-4'), children: t('actions.call1930', { ns: 'common' }) }), _jsx(Link, { to: "/report", className: cx(buttonStyles('ghost', 'sm'), 'rounded-full px-4'), children: t('actions.startReport', { ns: 'common' }) })] })] }), _jsx("div", { className: "page-shell mt-8 sm:mt-10", children: _jsx("div", { className: "grid grid-cols-2 items-start gap-3 sm:gap-4 md:grid-cols-5", children: heroCardMeta.map((card) => (_jsx(HeroCard, { src: theme === 'dark' ? card.srcDark : card.src, icon: card.icon, label: t(`home.cards.${card.key}.label`), action: t(`home.cards.${card.key}.action`), to: card.to, offset: card.offset, visibility: card.visibility }, card.src))) }) })] }), _jsx("section", { className: "relative isolate overflow-hidden border-t border-black/[0.05] bg-canvas py-14 sm:py-16", children: _jsxs("div", { className: "page-shell", children: [_jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "inline-flex items-center gap-1.5 rounded-full bg-brand/[0.08] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-brand", children: t('home.learning') }), _jsx("h2", { className: "mt-3 max-w-[26ch] text-[clamp(1.5rem,2.8vw,2.1rem)] font-bold leading-[1.12] tracking-[-0.035em] text-paper", children: t('home.learningTitle') })] }), _jsxs(Link, { to: "/learn", className: "group inline-flex shrink-0 items-center gap-1.5 text-[0.9rem] font-semibold text-brand transition hover:text-brandDark", children: [t('home.learningAll'), _jsx(ArrowRight, { className: "h-4 w-4 transition group-hover:translate-x-0.5", "aria-hidden": true })] })] }), _jsx("div", { className: "mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4", children: learningMeta.map((item) => {
                                const Icon = item.icon;
                                return (_jsxs(Link, { to: item.href, className: "group flex flex-col rounded-[1.5rem] border border-black/[0.06] bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft dark:hover:translate-y-0 dark:hover:shadow-none sm:p-6", children: [_jsx("span", { className: cx('inline-flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ring-inset ring-black/[0.04]', item.iconClass), children: _jsx(Icon, { className: "h-5 w-5", "aria-hidden": true }) }), _jsx("h3", { className: "mt-5 text-[1.02rem] font-semibold leading-snug tracking-[-0.02em] text-paper", children: t(`home.learn.${item.key}.title`) }), _jsx("p", { className: "mt-2 flex-1 text-[0.875rem] leading-6 text-muted", children: t(`home.learn.${item.key}.description`) }), _jsxs("span", { className: "mt-5 inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-brand", children: [t('actions.readMore', { ns: 'common' }), _jsx(ArrowRight, { className: "h-3.5 w-3.5 transition group-hover:translate-x-0.5", "aria-hidden": true })] })] }, item.key));
                            }) })] }) })] }));
}
