import { jsx as _jsx } from "react/jsx-runtime";
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { applyTheme, useResolvedTheme } from '../lib/theme';
export function ThemeToggle() {
    const { t } = useTranslation('common');
    const theme = useResolvedTheme();
    function toggle() {
        const next = theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
    }
    const toLight = theme === 'dark';
    return (_jsx("button", { type: "button", onClick: toggle, className: "inline-flex h-9 w-9 items-center justify-center rounded-lg text-black transition hover:bg-black/[0.04]", "aria-label": toLight ? t('theme.toggleToLight') : t('theme.toggleToDark'), "aria-pressed": theme === 'dark', title: toLight ? t('theme.light') : t('theme.dark'), children: toLight ? _jsx(Sun, { className: "h-4 w-4", "aria-hidden": true }) : _jsx(Moon, { className: "h-4 w-4", "aria-hidden": true }) }));
}
