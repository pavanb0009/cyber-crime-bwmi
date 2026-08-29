import { useEffect, useState } from 'react';
export const THEME_KEY = 'rakshak-theme-pref';
export const THEME_EVENT = 'rakshak-theme';
export function getStoredTheme() {
    try {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'dark' || saved === 'light')
            return saved;
    }
    catch {
        // Storage can be unavailable in private mode.
    }
    return 'light';
}
export function applyTheme(theme) {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta)
        meta.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
    try {
        localStorage.setItem(THEME_KEY, theme);
    }
    catch {
        // Theme still applies for this session.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
}
export function initTheme() {
    applyTheme(getStoredTheme());
}
export function useResolvedTheme() {
    const [theme, setTheme] = useState(() => getStoredTheme());
    useEffect(() => {
        function sync() {
            setTheme(getStoredTheme());
        }
        window.addEventListener(THEME_EVENT, sync);
        return () => window.removeEventListener(THEME_EVENT, sync);
    }, []);
    return theme;
}
