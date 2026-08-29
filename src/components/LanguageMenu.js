import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { languageGroups, localeEnglishNames, localeNames, normalizeLocale, } from '../i18n';
import { cx } from '../lib/cx';
export function LanguageMenu() {
    const { t, i18n } = useTranslation('common');
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const current = normalizeLocale(i18n.resolvedLanguage);
    useEffect(() => {
        function handlePointerDown(event) {
            if (menuRef.current && !menuRef.current.contains(event.target))
                setOpen(false);
        }
        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, []);
    function select(locale) {
        void i18n.changeLanguage(locale);
        setOpen(false);
    }
    return (_jsxs("div", { ref: menuRef, className: "relative", children: [_jsxs("button", { type: "button", onClick: () => setOpen((value) => !value), className: "inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-black transition hover:bg-black/[0.04]", "aria-label": t('language.select'), "aria-expanded": open, "aria-haspopup": "listbox", children: [_jsx(Globe, { className: "h-4 w-4", "aria-hidden": true }), _jsx("span", { className: "hidden max-w-[7.5rem] truncate sm:inline", children: localeNames[current] }), _jsx(ChevronDown, { className: cx('h-3.5 w-3.5 text-muted transition', open && 'rotate-180'), "aria-hidden": true })] }), open ? (_jsxs("div", { role: "listbox", "aria-label": t('language.select'), className: "card absolute right-0 top-10 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden p-2", children: [_jsx("p", { className: "px-2 pb-2 pt-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted", children: t('language.label') }), _jsx("div", { className: "max-h-[min(22rem,70vh)] overflow-y-auto", children: languageGroups.map((group) => (_jsx("div", { className: "mb-2 last:mb-0", children: _jsx("div", { className: "grid grid-cols-1", children: group.locales.map((locale) => {
                                    const active = locale === current;
                                    return (_jsxs("button", { type: "button", role: "option", "aria-selected": active, onClick: () => select(locale), className: cx('flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition', active ? 'bg-brand/[0.08]' : 'hover:bg-mist'), children: [_jsxs("span", { children: [_jsx("span", { className: "block text-sm font-semibold text-paper", children: localeNames[locale] }), _jsx("span", { className: "mt-0.5 block text-[0.7rem] text-muted", children: localeEnglishNames[locale] })] }), active ? _jsx(Check, { className: "h-4 w-4 text-brand", "aria-hidden": true }) : null] }, locale));
                                }) }) }, group.id))) })] })) : null] }));
}
