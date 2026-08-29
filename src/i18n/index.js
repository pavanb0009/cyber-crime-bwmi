import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { common } from './common';
import { pages } from './pages';
export const supportedLocales = [
    'en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'ur', 'or', 'as',
    'ne', 'kok', 'mai', 'brx', 'doi', 'sa', 'sat', 'ks', 'sd', 'mni',
];
export const localeNames = {
    en: 'English',
    hi: 'हिन्दी',
    te: 'తెలుగు',
    ta: 'தமிழ்',
    kn: 'ಕನ್ನಡ',
    ml: 'മലയാളം',
    mr: 'मराठी',
    bn: 'বাংলা',
    gu: 'ગુજરાતી',
    pa: 'ਪੰਜਾਬੀ',
    ur: 'اردو',
    or: 'ଓଡ଼ିଆ',
    as: 'অসমীয়া',
    ne: 'नेपाली',
    kok: 'कोंकणी',
    mai: 'मैथिली',
    brx: 'बरʼ',
    doi: 'डोगरी',
    sa: 'संस्कृतम्',
    sat: 'ᱥᱟᱱᱛᱟᱲᱤ',
    ks: 'کٲشُر',
    sd: 'سنڌي',
    mni: 'মৈতৈলোন্',
};
export const localeEnglishNames = {
    en: 'English',
    hi: 'Hindi',
    te: 'Telugu',
    ta: 'Tamil',
    kn: 'Kannada',
    ml: 'Malayalam',
    mr: 'Marathi',
    bn: 'Bengali',
    gu: 'Gujarati',
    pa: 'Punjabi',
    ur: 'Urdu',
    or: 'Odia',
    as: 'Assamese',
    ne: 'Nepali',
    kok: 'Konkani',
    mai: 'Maithili',
    brx: 'Bodo',
    doi: 'Dogri',
    sa: 'Sanskrit',
    sat: 'Santali',
    ks: 'Kashmiri',
    sd: 'Sindhi',
    mni: 'Manipuri',
};
export const languageGroups = [
    { id: 'popular', locales: ['en', 'hi'] },
    { id: 'south', locales: ['te', 'ta', 'kn', 'ml'] },
    { id: 'west', locales: ['mr', 'gu', 'kok'] },
    { id: 'east', locales: ['bn', 'as', 'or', 'mni'] },
    { id: 'north', locales: ['pa', 'ur', 'ne', 'doi', 'ks', 'sd'] },
    { id: 'other', locales: ['mai', 'brx', 'sa', 'sat'] },
];
const LANGUAGE_KEY = 'rakshak-language';
const rtlLocales = new Set(['ur', 'ks', 'sd']);
const commonCatalog = common;
const pagesCatalog = pages;
export function normalizeLocale(value) {
    const language = value?.toLowerCase().split('-')[0];
    return supportedLocales.includes(language) ? language : 'en';
}
function initialLocale() {
    try {
        const saved = localStorage.getItem(LANGUAGE_KEY);
        if (saved)
            return normalizeLocale(saved);
    }
    catch {
        // Continue with the browser language when storage is unavailable.
    }
    return normalizeLocale(navigator.language);
}
export function persistLocale(locale) {
    try {
        localStorage.setItem(LANGUAGE_KEY, locale);
    }
    catch {
        // Language switching still works for the current session.
    }
}
const hiPageLocales = new Set(['mr', 'ne', 'kok', 'mai', 'brx', 'doi', 'sa', 'sat', 'gu', 'pa', 'as', 'or']);
const urPageLocales = new Set(['ks', 'sd']);
const bnPageLocales = new Set(['mni']);
const resources = Object.fromEntries(supportedLocales.map((locale) => [
    locale,
    {
        common: commonCatalog[locale] ?? commonCatalog.hi ?? common.en,
        pages: pagesCatalog[locale] ??
            (hiPageLocales.has(locale) ? pages.hi : undefined) ??
            (urPageLocales.has(locale) ? pages.ur : undefined) ??
            (bnPageLocales.has(locale) ? pages.bn : undefined) ??
            pages.en,
    },
]));
void i18n.use(initReactI18next).init({
    resources,
    lng: initialLocale(),
    fallbackLng: {
        brx: ['hi', 'en'],
        doi: ['hi', 'en'],
        kok: ['hi', 'en'],
        mai: ['hi', 'en'],
        sa: ['hi', 'en'],
        ne: ['hi', 'en'],
        sat: ['hi', 'en'],
        mr: ['hi', 'en'],
        gu: ['hi', 'en'],
        pa: ['hi', 'en'],
        as: ['hi', 'en'],
        or: ['hi', 'en'],
        ks: ['ur', 'en'],
        sd: ['ur', 'en'],
        mni: ['bn', 'en'],
        default: ['en'],
    },
    defaultNS: 'common',
    ns: ['common', 'pages'],
    interpolation: { escapeValue: false },
    returnNull: false,
});
function applyDocumentLocale(localeValue) {
    const locale = normalizeLocale(localeValue);
    document.documentElement.lang = locale;
    document.documentElement.dir = rtlLocales.has(locale) ? 'rtl' : 'ltr';
    persistLocale(locale);
}
applyDocumentLocale(i18n.resolvedLanguage);
i18n.on('languageChanged', applyDocumentLocale);
export default i18n;
