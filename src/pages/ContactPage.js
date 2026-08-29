import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PageIntro } from '../components/PageIntro';
import { cx } from '../lib/cx';
import { useTranslation } from 'react-i18next';
export function ContactPage() {
    const { t } = useTranslation('pages');
    const channels = [
        {
            label: t('contact.financial'),
            value: '1930',
            href: 'tel:1930',
            note: t('contact.financialNote'),
            urgent: true,
        },
        {
            label: t('contact.child'),
            value: '1098',
            href: 'tel:1098',
            note: t('contact.childNote'),
            urgent: true,
        },
        {
            label: t('contact.portal'),
            value: 'cybercrime.gov.in',
            href: 'https://cybercrime.gov.in/',
            note: t('contact.portalNote'),
            urgent: false,
        },
    ];
    return (_jsxs(_Fragment, { children: [_jsx(PageIntro, { title: t('contact.eyebrow') }), _jsx("section", { className: "page-shell page-section pt-0", children: _jsx("div", { className: "grid gap-4 sm:grid-cols-3", children: channels.map((channel) => (_jsxs("a", { href: channel.href, target: channel.href.startsWith('http') ? '_blank' : undefined, rel: channel.href.startsWith('http') ? 'noreferrer' : undefined, className: "card group p-5 transition hover:border-brand/50 sm:p-6", children: [_jsx("p", { className: "eyebrow text-brand", children: channel.label }), _jsx("p", { className: cx('mt-2 text-xl font-semibold', channel.urgent ? 'text-alert' : 'text-paper'), children: channel.value }), _jsx("p", { className: "mt-2 text-sm leading-6 text-muted", children: channel.note })] }, channel.label))) }) })] }));
}
