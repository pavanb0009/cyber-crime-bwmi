export function readSession(key) {
    try {
        const raw = localStorage.getItem(`rakshak-task:${key}`);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}
export function writeSession(key, value) {
    try {
        localStorage.setItem(`rakshak-task:${key}`, JSON.stringify(value));
    }
    catch {
        // Task state still works for the current view if storage is unavailable.
    }
}
export function clearSession(key) {
    try {
        localStorage.removeItem(`rakshak-task:${key}`);
    }
    catch {
        // No-op when storage is unavailable.
    }
}
export function patchSearchParams(current, patch) {
    const next = new URLSearchParams(current);
    for (const [key, value] of Object.entries(patch)) {
        if (value == null || value === '')
            next.delete(key);
        else
            next.set(key, value);
    }
    return next;
}
