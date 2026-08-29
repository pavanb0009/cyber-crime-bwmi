import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LoaderCircle } from 'lucide-react';
import { cx } from '../lib/cx';
export function buttonStyles(variant = 'primary', size = 'md') {
    const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-150 disabled:pointer-events-none disabled:opacity-50';
    const variants = {
        primary: 'bg-brand text-ink hover:bg-brandDark active:bg-brandDark',
        secondary: 'border border-black/[0.14] bg-card text-paper hover:border-brand hover:text-brand',
        ghost: 'text-muted hover:text-paper',
        danger: 'bg-alert text-ink hover:bg-alertDark active:bg-alertDark',
    };
    const sizes = {
        sm: 'h-9 px-3.5 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-[0.95rem]',
    };
    return cx(base, variants[variant], sizes[size]);
}
export function Button({ className, variant = 'primary', size = 'md', loading = false, children, disabled, ...props }) {
    return (_jsxs("button", { className: cx(buttonStyles(variant, size), className), disabled: disabled || loading, ...props, children: [loading ? _jsx(LoaderCircle, { className: "h-4 w-4 animate-spin", "aria-hidden": "true" }) : null, children] }));
}
