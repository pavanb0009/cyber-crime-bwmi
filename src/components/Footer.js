import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { brand } from '../data/brand';
import { BrandMark } from './BrandMark';
export function Footer() {
    const { t } = useTranslation(['pages', 'common']);
    const year = new Date().getFullYear();
    const journeys = [
        { to: '/report', label: t('footer.register') },
        { to: '/check', label: t('footer.checkSuspect') },
        { to: '/track', label: t('footer.trackComplaint') },
        { to: '/learn', label: t('footer.learningCorner') },
    ];
    const about = [
        { to: '/volunteers', label: t('footer.volunteers') },
        { to: '/contact', label: t('footer.contact') },
    ];
    return (_jsx("footer", { className: "mt-16 border-t border-black/[0.07] bg-card/80 pb-24 pt-12 backdrop-blur-sm dark:bg-canvas dark:backdrop-blur-none sm:pb-12", children: _jsxs("div", { className: "page-shell", children: [_jsxs("div", { className: "grid gap-10 sm:grid-cols-2 lg:grid-cols-4", children: [_jsxs("div", { className: "max-w-sm", children: [_jsx(BrandMark, {}), _jsx("p", { className: "mt-4 text-sm leading-6 text-muted", children: t('footer.about') })] }), _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: t('footer.journeys') }), _jsx("div", { className: "mt-4 grid gap-2.5 text-sm text-paper", children: journeys.map((item) => (_jsx(Link, { to: item.to, className: "hover:text-brand", children: item.label }, item.to))) })] }), _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: t('footer.aboutLabel') }), _jsxs("div", { className: "mt-4 grid gap-2.5 text-sm text-paper", children: [about.map((item) => (_jsx(Link, { to: item.to, className: "hover:text-brand", children: item.label }, item.to))), _jsx("a", { href: "https://cybercrime.gov.in/", target: "_blank", rel: "noreferrer", className: "hover:text-brand", children: t('footer.officialPortal') })] })] }), _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: t('footer.helpNow') }), _jsxs("div", { className: "mt-4 grid gap-2.5 text-sm", children: [_jsx("a", { href: "tel:1930", className: "font-semibold text-alert hover:text-alertDark", children: t('footer.callFinancial') }), _jsx("a", { href: "tel:1098", className: "text-paper hover:text-brand", children: t('footer.callChild') }), _jsx("p", { className: "leading-6 text-muted", children: t('helpline.emergency', { ns: 'common' }) })] })] })] }), _jsx("p", { className: "mt-12 border-t border-black/[0.07] pt-6 text-sm text-muted", children: t('footer.copyright', { year, name: brand.name }) })] }) }));
}
