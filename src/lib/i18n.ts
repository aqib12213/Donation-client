import type { Messages } from "@lingui/core";
import { i18n as linguiI18n } from "@lingui/core";

export const locales = {
	en: "English",
	ur: "اردو",
	ru: "Urdu (Roman)",
} as const;

export type Locale = keyof typeof locales;

export const DEFAULT_LOCALE: Locale = "en";

interface CatalogModule {
	messages: Messages;
}

const loadCatalog = async (locale: Locale): Promise<Messages> => {
	const catalog: CatalogModule = await import(
		`../locales/${locale}/messages.po`
	);
	return catalog.messages;
};

const resolvePreferredLocale = (): Locale => {
	if (typeof navigator === "undefined") {
		return DEFAULT_LOCALE;
	}

	const [languageCode] = navigator.language.split("-");
	if (languageCode && languageCode in locales) {
		return languageCode as Locale;
	}

	return DEFAULT_LOCALE;
};

export const loadAndActivateLocale = async (
	locale: Locale
): Promise<Locale> => {
	try {
		const messages = await loadCatalog(locale);
		linguiI18n.loadAndActivate({ locale, messages });
		return locale;
	} catch (error) {
		if (locale !== DEFAULT_LOCALE) {
			const fallbackMessages = await loadCatalog(DEFAULT_LOCALE);
			linguiI18n.loadAndActivate({
				locale: DEFAULT_LOCALE,
				messages: fallbackMessages,
			});
			return DEFAULT_LOCALE;
		}

		throw error;
	}
};

export const initializeI18n = (): Promise<Locale> => {
	const preferredLocale = resolvePreferredLocale();
	return loadAndActivateLocale(preferredLocale);
};
