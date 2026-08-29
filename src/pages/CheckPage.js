import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, buttonStyles } from '../components/Button';
import { PageIntro } from '../components/PageIntro';
import { identifierConfig, suspectReports } from '../data/content';
import { cx } from '../lib/cx';
import { patchSearchParams, writeSession } from '../lib/session';
import { useTranslation } from 'react-i18next';
function normalise(type, value) {
    const trimmed = value.trim().toLowerCase();
    if (type === 'phone')
        return trimmed.replace(/\D/g, '');
    if (type === 'url')
        return trimmed.replace(/\/$/, '');
    return trimmed;
}
function validate(type, value, t) {
    const clean = value.trim();
    const field = t(`check.fields.${type}.label`);
    if (!clean)
        return t('check.enterValue', { field });
    if (type === 'phone' && !/^\d{10}$/.test(clean.replace(/\D/g, '')))
        return t('check.phoneFormat');
    if (type === 'upi' && !/^[\w.-]{2,}@[\w.-]{2,}$/.test(clean))
        return t('check.upiFormat');
    if (type === 'email' && !/^\S+@\S+\.\S+$/.test(clean))
        return t('check.emailFormat');
    if (type === 'url') {
        try {
            const url = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
            if (!url.hostname.includes('.'))
                return t('check.websiteIncomplete');
        }
        catch {
            return t('check.websiteInvalid');
        }
    }
    return '';
}
function clearResult(type) {
    return {
        risk: 'clear',
        title: 'No reports found for this identifier',
        summary: `This ${identifierConfig[type].label.toLowerCase()} has not been reported yet. That is not proof that it is safe.`,
        reports: 0,
        firstSeen: null,
        signals: ['No matching reports', 'New scam identifiers appear every day', 'Scammers change identifiers quickly'],
        nextSteps: ['Verify through another trusted channel', 'Do not share OTPs, PINs or screen access', 'Report anything suspicious or harmful'],
    };
}
const riskStyles = {
    high: {
        labelKey: 'check.highRisk',
        panel: 'border-alert bg-alert',
        title: 'text-ink',
        body: 'text-white/75',
        badge: 'bg-white text-alert',
    },
    medium: {
        labelKey: 'check.caution',
        panel: 'border-alert/30 bg-alert/[0.05]',
        title: 'text-paper',
        body: 'text-muted',
        badge: 'bg-alert text-ink',
    },
    clear: {
        labelKey: 'check.noMatch',
        panel: 'border-brand/30 bg-brand/[0.04]',
        title: 'text-paper',
        body: 'text-muted',
        badge: 'bg-brand text-ink',
    },
};
export function CheckPage() {
    const { t } = useTranslation(['pages', 'common']);
    const [searchParams, setSearchParams] = useSearchParams();
    const identifierTypes = [
        { id: 'phone', label: t('check.phone') },
        { id: 'upi', label: t('check.upi') },
        { id: 'email', label: t('check.email') },
        { id: 'url', label: t('check.website') },
    ];
    const queryType = (['phone', 'upi', 'email', 'url'].includes(searchParams.get('type') ?? '')
        ? searchParams.get('type')
        : 'phone');
    const queryValue = searchParams.get('q') ?? '';
    const [type, setType] = useState(queryType);
    const [value, setValue] = useState(queryValue);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [checkedValue, setCheckedValue] = useState('');
    const hydratedQuery = useRef('');
    function writeQuery(nextType, nextValue, replace = false) {
        setSearchParams((current) => patchSearchParams(current, { type: nextType, q: nextValue }), { replace });
    }
    async function runCheck(inputValue = value, options = {}) {
        const { delay = true, syncUrl = true, nextType = type } = options;
        const validationError = validate(nextType, inputValue, t);
        if (validationError) {
            setError(validationError);
            setResult(null);
            return;
        }
        setError('');
        setLoading(true);
        setResult(null);
        if (delay)
            await new Promise((resolve) => window.setTimeout(resolve, 420));
        const key = normalise(nextType, inputValue);
        const matched = suspectReports[nextType]?.[key];
        const nextResult = matched ?? clearResult(nextType);
        setResult(nextResult);
        setCheckedValue(inputValue.trim());
        hydratedQuery.current = `${nextType}:${inputValue.trim()}`;
        writeSession('check', { type: nextType, q: inputValue.trim() });
        if (syncUrl)
            writeQuery(nextType, inputValue.trim());
        setLoading(false);
    }
    function chooseType(nextType) {
        setType(nextType);
        setValue('');
        setError('');
        setResult(null);
        setCheckedValue('');
        writeQuery(nextType, null);
    }
    function useExample() {
        const example = identifierConfig[type].example;
        setValue(example);
        setError('');
        void runCheck(example);
    }
    useEffect(() => {
        setType(queryType);
        if (queryValue) {
            setValue(queryValue);
            if (hydratedQuery.current === `${queryType}:${queryValue}`)
                return;
            hydratedQuery.current = `${queryType}:${queryValue}`;
            void runCheck(queryValue, { delay: false, syncUrl: false, nextType: queryType });
            return;
        }
        hydratedQuery.current = '';
        setResult(null);
        setCheckedValue('');
        // Keep the typed value when browser back clears the query.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryType, queryValue]);
    return (_jsxs(_Fragment, { children: [_jsx(PageIntro, { title: t('check.eyebrow') }), _jsx("section", { className: "page-shell pb-4", children: _jsxs("div", { className: "grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]", children: [_jsx("div", { children: _jsxs("div", { className: "card overflow-hidden", children: [_jsxs("div", { className: "border-b border-black/[0.07] p-5 sm:p-6", children: [_jsx("label", { className: "field-label", children: t('check.whatCheck') }), _jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: identifierTypes.map((item) => {
                                                    const active = type === item.id;
                                                    return (_jsx("button", { type: "button", onClick: () => chooseType(item.id), className: cx('rounded-lg border-2 px-3.5 py-2 text-sm font-medium transition', active
                                                            ? 'border-brand bg-brand/[0.08] text-brand'
                                                            : 'border-fieldBorder bg-field text-muted hover:border-brand/50 hover:text-paper'), children: item.label }, item.id));
                                                }) }), _jsxs("form", { className: "mt-5", onSubmit: (event) => {
                                                    event.preventDefault();
                                                    void runCheck();
                                                }, children: [_jsx("label", { htmlFor: "identifier", className: "field-label", children: t(`check.fields.${type}.label`) }), _jsxs("div", { className: "relative", children: [_jsx("input", { id: "identifier", value: value, inputMode: type === 'phone' ? 'numeric' : 'text', onChange: (event) => {
                                                                    setValue(event.target.value);
                                                                    setError('');
                                                                }, className: cx('text-field h-12 pr-24 text-base', error && 'field-invalid'), placeholder: t(`check.fields.${type}.placeholder`), autoComplete: "off" }), value ? (_jsx("button", { type: "button", onClick: () => {
                                                                    setValue('');
                                                                    setResult(null);
                                                                }, className: "absolute right-[5.6rem] top-1/2 -translate-y-1/2 text-sm text-muted hover:text-paper", "aria-label": t('check.clearInput'), children: t('actions.clear', { ns: 'common' }) })) : null, _jsx(Button, { type: "submit", size: "md", loading: loading, className: "absolute right-1 top-1 h-10", children: t('check.checkAction') })] }), _jsxs("div", { className: "mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [_jsx("p", { className: "text-sm text-muted", children: t(`check.fields.${type}.helper`) }), _jsx("button", { type: "button", onClick: useExample, className: "link-accent text-left text-sm", children: t('check.tryReported') })] }), error ? (_jsx("p", { className: "mt-3 text-sm font-semibold text-alert", children: error })) : null] })] }), _jsx("div", { className: "min-h-[8rem] p-5 sm:p-6", children: _jsx(AnimatePresence, { mode: "wait", children: loading ? (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "py-8", children: [_jsx("p", { className: "text-sm font-medium text-paper", children: t('check.checking') }), _jsx("p", { className: "mt-2 max-w-sm text-sm leading-6 text-muted", children: t('check.matching') })] }, "loading")) : result ? (_jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, children: [_jsxs("div", { className: cx('rounded-2xl border p-5 sm:p-6', riskStyles[result.risk].panel), children: [_jsx("span", { className: cx('inline-flex rounded-full px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em]', riskStyles[result.risk].badge), children: t(riskStyles[result.risk].labelKey) }), _jsx("h3", { className: cx('mt-3 text-xl font-semibold tracking-[-0.02em] sm:text-2xl', riskStyles[result.risk].title), children: result.title }), _jsx("p", { className: cx('mt-2 max-w-2xl text-sm leading-6', riskStyles[result.risk].body), children: result.summary }), _jsxs("p", { className: cx('mt-4 text-sm', riskStyles[result.risk].body), children: [t('check.checked'), ": ", _jsx("span", { className: cx('font-medium', riskStyles[result.risk].title), children: checkedValue }), result.reports !== null
                                                                        ? ` · ${t('check.reports', { count: result.reports })} · ${t('check.firstSeen')} ${result.firstSeen ?? '—'}`
                                                                        : null] })] }), _jsxs("div", { className: "mt-6 grid gap-6 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: t('check.whyResult') }), _jsx("ul", { className: "mt-3 space-y-2 border-t border-black/[0.07] pt-3", children: result.signals.map((signal) => (_jsx("li", { className: "text-sm leading-6 text-paper", children: signal }, signal))) })] }), _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: t('check.whatNext') }), _jsx("ul", { className: "mt-3 space-y-2 border-t border-black/[0.07] pt-3", children: result.nextSteps.map((step) => (_jsx("li", { className: "text-sm leading-6 text-paper", children: step }, step))) })] })] }), _jsxs("div", { className: "mt-6 flex flex-col gap-3 border-t border-black/[0.07] pt-5 sm:flex-row", children: [_jsx(Link, { to: result.risk === 'high'
                                                                    ? `/report?type=financial&mode=emergency&suspect=${encodeURIComponent(checkedValue)}`
                                                                    : `/report?type=suspicious-content&suspect=${encodeURIComponent(checkedValue)}`, className: buttonStyles(result.risk === 'high' ? 'danger' : 'primary', 'lg'), children: result.risk === 'high' ? (_jsxs(_Fragment, { children: [t('check.alreadyPaid'), " ", _jsx(ArrowRight, { className: "h-4 w-4" })] })) : (t('check.reportIdentifier')) }), result.risk === 'high' ? (_jsx(Link, { to: `/report?type=suspicious-content&suspect=${encodeURIComponent(checkedValue)}`, className: buttonStyles('secondary', 'lg'), children: t('check.reportIdentifier') })) : null, _jsx(Button, { variant: "secondary", size: "lg", onClick: () => {
                                                                    navigator.clipboard?.writeText(checkedValue).catch(() => undefined);
                                                                }, children: t('check.copyIdentifier') })] })] }, `${result.risk}-${checkedValue}`)) : (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "py-6", children: _jsx("p", { className: "max-w-md text-sm leading-6 text-muted", children: t('check.emptyBody') }) }, "empty")) }) })] }) }), _jsxs("aside", { className: "space-y-4 lg:sticky lg:top-6 lg:self-start", children: [_jsxs("div", { className: "surface-soft p-4", children: [_jsx("p", { className: "text-sm font-medium text-paper", children: t('check.beforeTrust') }), _jsxs("ul", { className: "mt-3 space-y-2 text-sm leading-5 text-muted", children: [_jsx("li", { children: t('check.before1') }), _jsx("li", { children: t('check.before2') }), _jsx("li", { children: t('check.before3') })] })] }), _jsxs("div", { className: "rounded-2xl bg-alert p-5 text-ink", children: [_jsx("p", { className: "text-sm font-semibold", children: t('home.lostMoney') }), _jsx("p", { className: "mt-2 text-xs leading-5 text-white/75", children: t('check.lostMoneyHelp') }), _jsx(Link, { to: "/report?type=financial&mode=emergency", className: "mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-white text-sm font-semibold text-alert hover:bg-white/90", children: t('home.lostMoney') }), _jsx("a", { href: "tel:1930", className: "mt-2 flex h-9 w-full items-center justify-center rounded-lg bg-white/10 text-sm font-semibold text-white hover:bg-white/15", children: t('actions.call1930', { ns: 'common' }) })] }), _jsx("div", { className: "surface-soft p-5", children: _jsx("p", { className: "text-sm leading-6 text-muted", children: t('check.caveat') }) })] })] }) })] }));
}
