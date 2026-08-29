function normalizeApiUrl(raw) {
    let value = (raw ?? 'http://localhost:8000').trim().replace(/^['"]|['"]$/g, '');
    const nestedRailway = value.match(/\/((?:[\w-]+\.)*up\.railway\.app)(?:\/|$)/i);
    if (nestedRailway && !/^https?:\/\/(?:[\w-]+\.)*up\.railway\.app/i.test(value)) {
        value = `https://${nestedRailway[1]}`;
    }
    if (!/^https?:\/\//i.test(value)) {
        value = `https://${value.replace(/^\/+/, '')}`;
    }
    return value.replace(/\/$/, '');
}
const API_URL = normalizeApiUrl(import.meta.env.VITE_CALL_SCANNER_API_URL);
export async function analyseCall(file, language = 'auto', signal) {
    const body = new FormData();
    body.append('audio', file);
    body.append('language', language);
    let response;
    try {
        response = await fetch(`${API_URL}/analyse`, {
            method: 'POST',
            body,
            signal,
        });
    }
    catch {
        throw new Error('The call scanner API is unreachable. Set VITE_CALL_SCANNER_API_URL to your Railway URL and redeploy.');
    }
    if (!response.ok) {
        let message = 'The scanner could not analyse this recording.';
        try {
            const error = (await response.json());
            if (error.detail)
                message = error.detail;
        }
        catch {
            // Keep the user-friendly fallback for non-JSON server errors.
        }
        throw new Error(message);
    }
    return response.json();
}
export async function transcribeAudio(file, language = 'auto', signal) {
    const body = new FormData();
    body.append('audio', file);
    body.append('language', language);
    let response;
    try {
        response = await fetch(`${API_URL}/transcribe`, {
            method: 'POST',
            body,
            signal,
        });
    }
    catch {
        throw new Error('Voice transcription needs the call-scanner API. Set VITE_CALL_SCANNER_API_URL and redeploy.');
    }
    if (!response.ok) {
        let message = 'The recording could not be turned into text.';
        try {
            const error = (await response.json());
            if (error.detail)
                message = error.detail;
        }
        catch {
            // Keep the user-friendly fallback for non-JSON server errors.
        }
        throw new Error(message);
    }
    const payload = (await response.json());
    const transcript = payload.transcript?.trim() ?? '';
    if (!transcript)
        throw new Error('No speech was recognised. Try speaking a little longer.');
    return transcript;
}
