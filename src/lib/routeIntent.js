import { classifyIncident } from './intelligence';
function firstIdentifier(text) {
    const phone = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}/)?.[0];
    const url = text.match(/(?:https?:\/\/)?(?:www\.)?(?:[\w-]+\.)+[a-z]{2,}(?:\/\S*)?/i)?.[0];
    const atValue = text.match(/[\w.-]{2,}@[\w.-]{2,}/)?.[0];
    const numericAmount = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/i)?.[1];
    const scaledAmount = text.match(/([\d,.]+)\s*(lakh|lac|thousand)/i);
    const amount = numericAmount
        ?? (scaledAmount
            ? String(Math.round(Number(scaledAmount[1].replace(/,/g, ''))
                * (/thousand/i.test(scaledAmount[2]) ? 1_000 : 100_000)))
            : undefined);
    const transactionId = text.match(/(?:transaction|txn|utr|reference)(?:\s*(?:id|number|no\.?))?\s*[:#-]?\s*([a-z0-9-]{6,})/i)?.[1];
    const looksEmail = Boolean(atValue && /@[a-z0-9.-]+\.[a-z]{2,}$/i.test(atValue));
    if (atValue && !looksEmail) {
        return { amount, transactionId, identifier: atValue, identifierType: 'upi', channel: 'UPI / payment app' };
    }
    if (phone)
        return { amount, transactionId, identifier: phone, identifierType: 'phone', channel: 'Phone call / SMS' };
    if (atValue) {
        return {
            amount,
            transactionId,
            identifier: atValue,
            identifierType: 'email',
            channel: 'Email',
        };
    }
    if (url)
        return { amount, transactionId, identifier: url, identifierType: 'url', channel: 'Website / mobile app' };
    return { amount, transactionId };
}
export function extractStoryDetails(input) {
    const details = firstIdentifier(input);
    const text = input.toLowerCase();
    if (!details.channel) {
        if (/(whatsapp|telegram)/.test(text))
            details.channel = 'WhatsApp / Telegram';
        else if (/(instagram|facebook|social)/.test(text))
            details.channel = 'Instagram / Facebook / social media';
        else if (/(email|mail)/.test(text))
            details.channel = 'Email';
        else if (/(website|link|url|app)/.test(text))
            details.channel = 'Website / mobile app';
        else if (/(call|phone|sms|message)/.test(text))
            details.channel = 'Phone call / SMS';
    }
    return details;
}
function buildUrl(path, params) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value)
            query.set(key, value);
    }
    return `${path}?${query.toString()}`;
}
export function resolveCitizenIntent(input) {
    const story = input.trim();
    const text = story.toLowerCase();
    const result = classifyIncident(story);
    const details = extractStoryDetails(story);
    const loss = /(?:money|amount|funds?).{0,24}(?:lost|gone|debited|deducted|transferred|sent|paid)|(?:lost|sent|paid|transferred|debited|deducted).{0,24}(?:₹|rs|rupee|money|amount|upi|bank)|₹\s*[\d,]+.{0,30}(?:sent|paid|lost|transferred|debited)/i.test(story);
    const callIntent = /(?:call recording|recorded call|recording of|upload.{0,12}call|someone called|got a call|received a call|phone call)/i.test(story);
    const noticeIntent = /(?:notice|summons|warrant|legal letter|court order|challan|income tax letter|ed letter)/i.test(story);
    const checkIntent = /(?:check|verify|is (?:this|it).{0,16}(?:safe|scam|fake)|unknown (?:number|upi|email|website)|suspicious (?:number|upi|email|website|link))/i.test(story);
    if (loss) {
        return {
            destination: 'emergency',
            destinationLabel: 'Golden Minutes response',
            actionLabel: 'Start urgent recovery',
            url: buildUrl('/report', {
                type: 'financial',
                mode: 'emergency',
                story,
                suspect: details.identifier,
            }),
            result: { ...result, incidentType: 'financial', severity: 'Critical', route: 'Emergency financial flow' },
            extracted: details.identifier && details.identifierType
                ? { type: details.identifierType, value: details.identifier }
                : undefined,
        };
    }
    if (callIntent) {
        return {
            destination: 'call',
            destinationLabel: 'Call fraud scanner',
            actionLabel: 'Upload the call recording',
            url: buildUrl('/call-scanner', { hint: story }),
            result: {
                ...result,
                label: 'Suspicious call needs analysis',
                severity: 'High',
                signals: ['Call or recording mentioned', 'Voice scam signals can be checked', 'Upload the recording safely'],
            },
        };
    }
    if (noticeIntent) {
        return {
            destination: 'notice',
            destinationLabel: 'Fake notice checker',
            actionLabel: 'Check the notice',
            url: buildUrl('/notice-verifier', { text: story }),
            result: {
                ...result,
                label: 'Official-looking notice needs verification',
                severity: /(?:pay|arrest|urgent|confidential)/.test(text) ? 'High' : 'Medium',
                signals: ['Notice or warrant mentioned', 'Authority and payment language should be checked', 'Upload the document for a stronger result'],
            },
        };
    }
    if (checkIntent && details.identifier && details.identifierType) {
        return {
            destination: 'check',
            destinationLabel: 'Number / UPI / link check',
            actionLabel: 'Check it now',
            url: buildUrl('/check', { type: details.identifierType, q: details.identifier }),
            result: {
                ...result,
                incidentType: 'suspicious-content',
                label: `Check this ${details.identifierType === 'url' ? 'website' : details.identifierType}`,
                severity: 'Medium',
                signals: ['Identifier found in your story', 'No payment loss detected', 'Repository check recommended before interacting'],
            },
            extracted: { type: details.identifierType, value: details.identifier },
        };
    }
    return {
        destination: 'report',
        destinationLabel: 'Guided cybercrime report',
        actionLabel: 'Continue with details filled',
        url: buildUrl('/report', {
            type: result.incidentType,
            story,
            suspect: details.identifier,
            anonymous: result.incidentType === 'women-child' ? '1' : undefined,
        }),
        result,
        extracted: details.identifier && details.identifierType
            ? { type: details.identifierType, value: details.identifier }
            : undefined,
    };
}
