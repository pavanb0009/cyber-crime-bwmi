import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { SiteHeader } from './SiteHeader';
export function Layout() {
    const location = useLocation();
    const { t } = useTranslation(['common', 'pages']);
    useEffect(() => {
        document.title = t('meta.title');
        const description = document.querySelector('meta[name="description"]');
        if (description)
            description.setAttribute('content', t('meta.description'));
    }, [t]);
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.slice(1);
            const frame = window.requestAnimationFrame(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
            });
            return () => window.cancelAnimationFrame(frame);
        }
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [location.pathname, location.hash]);
    return (_jsxs("div", { className: "relative min-h-screen overflow-x-hidden bg-canvas", children: [_jsx(SiteHeader, {}), _jsx("div", { className: "top-glow", "aria-hidden": true }), _jsx("main", { children: _jsx(Outlet, {}) }), _jsx(Footer, {}), _jsx("a", { href: "tel:1930", className: "fixed inset-x-4 bottom-4 z-40 flex h-12 items-center justify-center rounded-xl bg-alert text-sm font-semibold text-ink shadow-soft sm:hidden", children: t('helpline.financial', { number: '1930' }) })] }));
}
