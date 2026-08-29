import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Download, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getEvidenceSignedUrl } from '../lib/reportsApi';
import { cx } from '../lib/cx';
function formatSize(bytes) {
    if (!bytes || bytes <= 0)
        return '';
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function isImage(file) {
    return Boolean(file.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(file.name));
}
export function EvidenceList({ files, className, }) {
    const { t } = useTranslation('pages');
    const [urls, setUrls] = useState({});
    useEffect(() => {
        let active = true;
        async function resolve() {
            if (!files?.length)
                return;
            const next = {};
            await Promise.all(files.map(async (file, index) => {
                const key = `${file.path ?? file.name}-${index}`;
                if (file.url) {
                    next[key] = file.url;
                    return;
                }
                if (!file.path)
                    return;
                try {
                    next[key] = await getEvidenceSignedUrl(file.path);
                }
                catch {
                    // Signed URL may fail for guests or offline; keep the file name visible.
                }
            }));
            if (active)
                setUrls(next);
        }
        void resolve();
        return () => {
            active = false;
        };
    }, [files]);
    if (!files?.length)
        return null;
    return (_jsxs("div", { className: cx('rounded-xl border border-black/[0.08] bg-mist/60 p-4', className), children: [_jsx("p", { className: "text-sm font-semibold text-paper", children: t('report.evidenceAttached') }), _jsx("p", { className: "mt-1 text-xs leading-5 text-muted", children: t('report.evidenceAttachedHint') }), _jsx("ul", { className: "mt-3 space-y-2", children: files.map((file, index) => {
                    const key = `${file.path ?? file.name}-${index}`;
                    const href = urls[key];
                    const Icon = isImage(file) ? ImageIcon : FileText;
                    return (_jsxs("li", { className: "flex items-center gap-3 rounded-lg border border-black/[0.07] bg-card px-3 py-2.5", children: [_jsx("span", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/[0.08] text-brand", children: _jsx(Icon, { className: "h-4 w-4" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "truncate text-sm font-medium text-paper", children: file.name }), _jsxs("p", { className: "mt-0.5 text-[0.68rem] text-muted", children: [[file.type || t('report.evidenceFile'), formatSize(file.size)].filter(Boolean).join(' · '), file.path ? ` · ${t('report.evidenceInCloud')}` : ` · ${t('report.evidenceOnDevice')}`] })] }), href ? (_jsxs("a", { href: href, target: "_blank", rel: "noreferrer", className: "inline-flex h-8 items-center gap-1.5 rounded-lg border border-black/[0.12] px-2.5 text-xs font-semibold text-paper hover:border-brand hover:text-brand", children: [isImage(file) ? _jsx(ExternalLink, { className: "h-3.5 w-3.5" }) : _jsx(Download, { className: "h-3.5 w-3.5" }), t('report.openEvidence')] })) : null] }, key));
                }) })] }));
}
