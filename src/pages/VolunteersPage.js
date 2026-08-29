import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageIntro } from '../components/PageIntro';
import { buttonStyles } from '../components/Button';
import { cx } from '../lib/cx';
export function VolunteersPage() {
    const { t } = useTranslation('pages');
    const roles = [
        { title: t('volunteers.r1'), description: t('volunteers.r1d') },
        { title: t('volunteers.r2'), description: t('volunteers.r2d') },
        { title: t('volunteers.r3'), description: t('volunteers.r3d') },
    ];
    return (_jsxs(_Fragment, { children: [_jsx(PageIntro, { title: t('volunteers.eyebrow') }), _jsxs("section", { className: "page-shell page-section pt-0", children: [_jsx("div", { className: "grid gap-4 sm:grid-cols-3", children: roles.map((role) => (_jsxs("div", { className: "card border-t-2 border-t-brand p-5 sm:p-6", children: [_jsx("p", { className: "text-[1.05rem] font-semibold text-paper", children: role.title }), _jsx("p", { className: "mt-2 text-sm leading-6 text-muted", children: role.description })] }, role.title))) }), _jsxs("div", { className: "surface-soft mt-4 p-5 sm:p-7", children: [_jsx("p", { className: "eyebrow", children: t('volunteers.before') }), _jsxs("ul", { className: "mt-4 grid gap-3 text-sm leading-6 text-paper", children: [_jsx("li", { children: t('volunteers.b1') }), _jsx("li", { children: t('volunteers.b2') }), _jsx("li", { children: t('volunteers.b3') })] }), _jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [_jsx(Link, { to: "/learn", className: cx(buttonStyles('primary', 'lg')), children: t('volunteers.safetyLibrary') }), _jsx(Link, { to: "/contact", className: cx(buttonStyles('secondary', 'lg')), children: t('volunteers.contactTeam') })] })] })] })] }));
}
