import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/Button';
import { PageIntro } from '../components/PageIntro';
import { safetyGuides } from '../data/content';
import { cx } from '../lib/cx';
import { useTranslation } from 'react-i18next';
export function LearnPage() {
    const { t } = useTranslation(['pages', 'common']);
    const categories = [
        { id: 'All', label: t('learn.all') },
        { id: 'Money', label: t('learn.catMoney') },
        { id: 'Accounts', label: t('learn.catAccounts') },
        { id: 'Harassment', label: t('learn.catHarassment') },
        { id: 'Family', label: t('learn.catFamily') },
        { id: 'General', label: t('learn.catGeneral') },
    ];
    const quickActions = [
        { title: t('learn.money'), action: t('learn.moneyAction'), detail: t('learn.moneyDetail'), href: 'tel:1930', external: true },
        { title: t('learn.account'), action: t('learn.accountAction'), detail: t('learn.accountDetail'), href: '/report?type=account', external: false },
        { title: t('learn.threat'), action: t('learn.threatAction'), detail: t('learn.threatDetail'), href: '/report?type=harassment', external: false },
    ];
    const scamQuestions = [t('learn.q1'), t('learn.q2'), t('learn.q3'), t('learn.q4'), t('learn.q5')];
    const [category, setCategory] = useState('All');
    const [query, setQuery] = useState('');
    const [openGuide, setOpenGuide] = useState(safetyGuides[0].id);
    const [answers, setAnswers] = useState(scamQuestions.map(() => false));
    const filteredGuides = useMemo(() => {
        const clean = query.trim().toLowerCase();
        return safetyGuides.filter((guide) => {
            const matchesCategory = category === 'All' || guide.category === category;
            const matchesQuery = !clean ||
                guide.title.toLowerCase().includes(clean) ||
                guide.summary.toLowerCase().includes(clean) ||
                guide.steps.some((step) => step.toLowerCase().includes(clean));
            return matchesCategory && matchesQuery;
        });
    }, [category, query]);
    const score = answers.filter(Boolean).length;
    const assessment = score >= 3
        ? {
            title: t('learn.strongTitle'),
            detail: t('learn.strongDetail'),
            tone: 'solid',
        }
        : score >= 1
            ? {
                title: t('learn.pauseTitle'),
                detail: t('learn.pauseDetail'),
                tone: 'filled',
            }
            : {
                title: t('learn.noneTitle'),
                detail: t('learn.noneDetail'),
                tone: 'outline',
            };
    return (_jsxs(_Fragment, { children: [_jsx(PageIntro, { title: t('learn.eyebrow') }), _jsx("section", { id: "safety", className: "page-shell scroll-mt-24", children: _jsx("div", { className: "grid gap-4 sm:grid-cols-3", children: quickActions.map((item) => {
                        const inner = (_jsxs(_Fragment, { children: [_jsx("p", { className: "eyebrow text-brand", children: item.title }), _jsx("h2", { className: "mt-2 text-[1.05rem] font-semibold text-paper group-hover:text-brand", children: item.action }), _jsx("p", { className: "mt-2 text-sm leading-6 text-muted", children: item.detail })] }));
                        const className = 'card group block p-5 transition hover:border-brand/50';
                        return item.external ? (_jsx("a", { href: item.href, className: className, children: inner }, item.title)) : (_jsx(Link, { to: item.href, className: className, children: inner }, item.title));
                    }) }) }), _jsx("section", { id: "digest", className: "page-shell page-section scroll-mt-24", children: _jsxs("div", { className: "grid gap-6 lg:grid-cols-[1.08fr_.92fr] lg:gap-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "mb-4 flex items-end justify-between gap-3", children: [_jsx("h2", { className: "text-lg font-semibold tracking-[-0.02em] text-paper", children: t('learn.playbooks') }), _jsx("span", { className: "text-sm text-muted", children: t('learn.results', { count: filteredGuides.length }) })] }), _jsxs("div", { className: "surface p-4 sm:p-5", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { value: query, onChange: (event) => setQuery(event.target.value), className: "text-field pr-16", placeholder: "Search: UPI, password, harassment\u2026" }), query ? (_jsx("button", { type: "button", onClick: () => setQuery(''), className: "absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted hover:text-paper", "aria-label": "Clear search", children: "Clear" })) : null] }), _jsx("div", { className: "mt-3 flex gap-4 overflow-x-auto border-b border-black/[0.08]", children: categories.map((item) => (_jsx("button", { type: "button", onClick: () => setCategory(item.id), className: cx('-mb-px shrink-0 border-b-2 py-2 text-sm transition', category === item.id
                                                    ? 'border-brand font-semibold text-brand'
                                                    : 'border-transparent text-muted hover:text-paper'), children: item.label }, item.id))) })] }), _jsxs("div", { className: "mt-4 space-y-2", children: [filteredGuides.map((guide) => {
                                            const open = openGuide === guide.id;
                                            return (_jsxs("div", { className: "overflow-hidden rounded-2xl border border-black/[0.08] bg-card", children: [_jsxs("button", { type: "button", onClick: () => setOpenGuide(open ? null : guide.id), className: "flex w-full items-start justify-between gap-5 p-5 text-left sm:p-6", "aria-expanded": open, children: [_jsxs("div", { children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted", children: [_jsx("span", { children: guide.category }), _jsx("span", { "aria-hidden": true, children: "\u00B7" }), _jsx("span", { children: guide.readingTime })] }), _jsx("h3", { className: "mt-3 text-lg font-semibold tracking-[-0.02em] text-paper sm:text-xl", children: guide.title }), _jsx("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-muted", children: guide.summary })] }), _jsx("span", { className: cx('mt-1 shrink-0 text-sm text-muted', open && 'text-paper'), children: open ? t('actions.close', { ns: 'common' }) : t('actions.open', { ns: 'common' }) })] }), _jsx(AnimatePresence, { initial: false, children: open ? (_jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: 'auto', opacity: 1 }, exit: { height: 0, opacity: 0 }, className: "overflow-hidden", children: _jsx("div", { className: "border-t border-black/[0.08] px-5 py-5 sm:px-6", children: _jsx("ol", { className: "space-y-4", children: guide.steps.map((step, index) => (_jsxs("li", { className: "flex gap-3", children: [_jsx("span", { className: "w-4 shrink-0 text-sm text-muted", children: index + 1 }), _jsx("p", { className: "text-sm leading-6 text-paper", children: step })] }, step))) }) }) })) : null })] }, guide.id));
                                        }), !filteredGuides.length ? (_jsxs("div", { className: "py-8", children: [_jsx("p", { className: "text-sm font-medium text-paper", children: "No guide matches that search." }), _jsx("button", { type: "button", onClick: () => { setQuery(''); setCategory('All'); }, className: "link-accent mt-3 text-sm", children: "Clear filters" })] })) : null] })] }), _jsxs("aside", { id: "awareness", className: "scroll-mt-24 lg:sticky lg:top-24 lg:self-start", children: [_jsxs("div", { className: "card p-5 sm:p-6", children: [_jsx("h2", { className: "text-lg font-semibold tracking-[-0.02em] text-paper", children: t('learn.scamCheck') }), _jsx("div", { className: "mt-6 space-y-2", children: scamQuestions.map((question, index) => (_jsxs("button", { type: "button", onClick: () => setAnswers((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value)), className: cx('flex w-full items-start gap-3 rounded-xl border-2 p-3.5 text-left transition', answers[index]
                                                    ? 'border-brand bg-brand/[0.06]'
                                                    : 'border-fieldBorder bg-field hover:border-brand/50 hover:bg-card'), children: [_jsx("span", { className: cx('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border', answers[index] ? 'border-brand bg-brand text-ink' : 'border-black/20 text-transparent'), children: _jsx(Check, { className: "h-3 w-3" }) }), _jsx("span", { className: "text-xs font-medium leading-5 text-paper", children: question })] }, question))) }), _jsxs(motion.div, { layout: true, className: cx('mt-5 rounded-2xl border p-4', assessment.tone === 'solid' && 'border-alert bg-alert', assessment.tone === 'filled' && 'border-alert/30 bg-alert/[0.05]', assessment.tone === 'outline' && 'border-brand/30 bg-brand/[0.04]'), children: [_jsx("p", { className: cx('text-sm font-semibold', assessment.tone === 'solid' ? 'text-ink' : 'text-paper'), children: assessment.title }), _jsx("p", { className: cx('mt-1.5 text-xs leading-5', assessment.tone === 'solid' ? 'text-white/75' : 'text-muted'), children: assessment.detail })] }), _jsxs("div", { className: "mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2", children: [_jsx(Link, { to: "/check", className: buttonStyles('primary', 'md'), children: "Check a number or UPI" }), _jsx(Link, { to: "/report", className: buttonStyles('secondary', 'md'), children: "Start report" })] }), _jsx("button", { type: "button", onClick: () => setAnswers(scamQuestions.map(() => false)), className: "mt-3 w-full text-center text-xs font-semibold text-muted hover:text-paper", children: "Reset checklist" })] }), _jsx("p", { className: "mt-5 text-sm leading-6 text-muted", children: "For immediate physical danger, contact local emergency services." })] })] }) })] }));
}
