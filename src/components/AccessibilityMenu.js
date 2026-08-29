import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Check, Minus, Plus, Settings, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
export function AccessibilityMenu() {
    const { t } = useTranslation('common');
    const [open, setOpen] = useState(false);
    const [largeText, setLargeText] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        document.documentElement.classList.toggle('text-large', largeText);
    }, [largeText]);
    useEffect(() => {
        document.documentElement.classList.toggle('reduce-motion', reduceMotion);
    }, [reduceMotion]);
    useEffect(() => {
        function handlePointerDown(event) {
            if (menuRef.current && !menuRef.current.contains(event.target))
                setOpen(false);
        }
        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, []);
    return (_jsxs("div", { ref: menuRef, className: "relative", children: [_jsx("button", { type: "button", onClick: () => setOpen((value) => !value), className: "inline-flex h-9 w-9 items-center justify-center rounded-lg text-black transition hover:bg-black/[0.04]", "aria-label": t('accessibility.label'), "aria-expanded": open, children: _jsx(Settings, { className: "h-4 w-4", "aria-hidden": true }) }), open ? (_jsxs("div", { className: "card absolute right-0 top-9 z-50 w-72 p-4", children: [_jsxs("div", { className: "mb-4 flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-paper", children: t('accessibility.label') }), _jsx("p", { className: "mt-1 text-xs leading-5 text-muted", children: t('accessibility.preferences') })] }), _jsx("button", { type: "button", onClick: () => setOpen(false), className: "rounded-lg p-1.5 text-muted hover:bg-black/[0.04] hover:text-paper", "aria-label": t('accessibility.close'), children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("button", { type: "button", onClick: () => setLargeText((value) => !value), className: "flex w-full items-center justify-between rounded-xl border border-black/[0.08] bg-mist px-3 py-3 text-left hover:bg-canvas", children: [_jsxs("span", { children: [_jsx("span", { className: "block text-sm font-semibold text-paper", children: t('accessibility.largerText') }), _jsx("span", { className: "mt-0.5 block text-xs text-muted", children: t('accessibility.largerTextHint') })] }), _jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-card text-paper", children: largeText ? _jsx(Check, { className: "h-4 w-4" }) : _jsx(Plus, { className: "h-4 w-4" }) })] }), _jsxs("button", { type: "button", onClick: () => setReduceMotion((value) => !value), className: "flex w-full items-center justify-between rounded-xl border border-black/[0.08] bg-mist px-3 py-3 text-left hover:bg-canvas", children: [_jsxs("span", { children: [_jsx("span", { className: "block text-sm font-semibold text-paper", children: t('accessibility.reduceMotion') }), _jsx("span", { className: "mt-0.5 block text-xs text-muted", children: t('accessibility.reduceMotionHint') })] }), _jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-card text-paper", children: reduceMotion ? _jsx(Check, { className: "h-4 w-4" }) : _jsx(Minus, { className: "h-4 w-4" }) })] })] }), _jsx(Button, { variant: "ghost", size: "sm", className: "mt-3 w-full", onClick: () => {
                            setLargeText(false);
                            setReduceMotion(false);
                        }, children: t('accessibility.reset') })] })) : null] }));
}
