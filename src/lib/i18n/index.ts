import { en, type Translations } from './en';
import { ja } from './ja';
import type { Lang } from '$lib/types';

const translations: Record<Lang, Translations> = { en, ja: ja as unknown as Translations };

/** Returns a translation lookup function for the given language. */
export function t(lang: Lang) {
	const dict = translations[lang] ?? translations.en;
	return dict;
}

/**
 * Detects the preferred language from a cookie value or Accept-Language header.
 * Falls back to English.
 */
export function detectLang(acceptLanguage: string | null, cookieLang?: string): Lang {
	if (cookieLang === 'en' || cookieLang === 'ja') return cookieLang;
	if (acceptLanguage?.includes('ja')) return 'ja';
	return 'en';
}
