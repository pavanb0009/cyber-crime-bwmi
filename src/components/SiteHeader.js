import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Menu, UserRound, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cx } from '../lib/cx';
import { AccessibilityMenu } from './AccessibilityMenu';
import { BrandMark } from './BrandMark';
import { LanguageMenu } from './LanguageMenu';
import { ThemeToggle } from './ThemeToggle';
const navKeys = [
    { to: '/', key: 'nav.home' },
    { to: '/report', key: 'nav.report' },
    { to: '/track', key: 'nav.track' },
    { to: '/check', key: 'nav.check' },
    { to: '/call-scanner', key: 'nav.callScan' },
    { to: '/notice-verifier', key: 'nav.noticeVerifier' },
    { to: '/volunteers', key: 'nav.volunteers' },
    { to: '/learn', key: 'nav.learn' },
    { to: '/contact', key: 'nav.contact' },
];
export function SiteHeader() {
    const { t } = useTranslation('common');
    const { loading: authLoading, signOut, user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);
    return (_jsxs("header", { className: "sticky top-0 z-40 border-b border-black/[0.08] bg-card/70 backdrop-blur-2xl backdrop-saturate-150 dark:bg-canvas/90 dark:backdrop-saturate-100", children: [_jsxs("div", { className: "page-shell grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4", children: [_jsx(BrandMark, {}), _jsx("nav", { className: "hidden items-center justify-center gap-6 xl:gap-7 lg:flex", "aria-label": "Primary navigation", children: navKeys.map((link) => (_jsx(NavLink, { to: link.to, end: link.to === '/', className: ({ isActive }) => cx('relative pb-0.5 text-[0.9rem] transition', isActive
                                ? 'font-bold text-paper after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-brand'
                                : 'font-medium text-muted hover:text-paper'), children: t(link.key) }, link.to))) }), _jsxs("div", { className: "flex items-center justify-end gap-1 sm:gap-2", children: [_jsx(LanguageMenu, {}), _jsx(ThemeToggle, {}), _jsx(AccessibilityMenu, {}), !authLoading ? (user ? (_jsxs("div", { className: "hidden items-center gap-2 lg:flex", children: [_jsx("span", { className: "hidden max-w-28 truncate text-xs font-medium text-muted xl:block", title: user.email, children: user.email }), _jsx("button", { type: "button", onClick: () => void signOut().catch(() => undefined), className: "inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-mist hover:text-paper", "aria-label": t('account.signOut'), title: t('account.signOut'), children: _jsx(LogOut, { className: "h-4 w-4" }) })] })) : (_jsxs(Link, { to: "/login", className: "hidden h-9 w-9 items-center justify-center rounded-lg border border-black/[0.12] text-xs font-semibold text-paper transition hover:border-brand hover:text-brand lg:inline-flex xl:w-auto xl:gap-1.5 xl:px-3", "aria-label": t('account.signIn'), children: [_jsx(UserRound, { className: "h-4 w-4" }), _jsx("span", { className: "hidden xl:inline", children: t('account.signIn') })] }))) : null, _jsx("button", { type: "button", className: "inline-flex h-9 w-9 items-center justify-center text-black lg:hidden", onClick: () => setMobileOpen((value) => !value), "aria-label": t('nav.openNavigation'), "aria-expanded": mobileOpen, children: mobileOpen ? _jsx(X, { className: "h-5 w-5" }) : _jsx(Menu, { className: "h-5 w-5" }) })] })] }), _jsx(AnimatePresence, { children: mobileOpen ? (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "overflow-hidden border-t border-black/[0.06] bg-card lg:hidden", children: _jsxs("nav", { className: "page-shell grid py-2", "aria-label": "Mobile navigation", children: [navKeys.map((link) => (_jsx(NavLink, { to: link.to, end: link.to === '/', className: ({ isActive }) => cx('py-3 text-sm', isActive ? 'font-bold text-paper' : 'font-medium text-muted'), children: t(link.key) }, link.to))), _jsx("div", { className: "mt-1 border-t border-black/[0.07] py-2", children: authLoading ? null : user ? (_jsxs("div", { className: "flex items-center justify-between gap-3 py-2", children: [_jsx("span", { className: "min-w-0 truncate text-sm font-medium text-paper", children: user.email }), _jsxs("button", { type: "button", onClick: () => void signOut().catch(() => undefined), className: "inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-muted hover:text-paper", children: [_jsx(LogOut, { className: "h-4 w-4" }), t('account.signOut')] })] })) : (_jsxs(Link, { to: "/login", className: "flex items-center gap-2 py-2 text-sm font-semibold text-brand", children: [_jsx(UserRound, { className: "h-4 w-4" }), t('account.signIn')] })) })] }) })) : null })] }));
}
