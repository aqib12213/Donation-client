import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { createContext, useContext, useEffect, useState } from "react";
import { DirectionProvider } from "@/components/ui/direction";
import { getCookie, removeCookie, setCookie } from "@/lib/cookies";
import { DEFAULT_LOCALE, type Locale, loadAndActivateLocale } from "@/lib/i18n";

export type Direction = "ltr" | "rtl";

const LOCALE_COOKIE_NAME = "locale";
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_YEAR = 365;
const ONE_YEAR_IN_SECONDS =
	SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY * DAYS_PER_YEAR;
const LOCALE_COOKIE_MAX_AGE = ONE_YEAR_IN_SECONDS;

// RTL locales - direction is automatically derived from locale
const RTL_LOCALES = new Set(["ur", "ar"]);

const getDirectionFromLocale = (locale: Locale): Direction =>
	RTL_LOCALES.has(locale) ? "rtl" : "ltr";

interface LinguiContextType {
	dir: Direction;
	locale: Locale;
	resetLocale: () => Promise<void>;
	setLocale: (locale: Locale) => Promise<void>;
}

const LinguiContext = createContext<LinguiContextType | null>(null);

export function LinguiProvider({ children }: { children: React.ReactNode }) {
	// Load saved locale from cookie, fallback to default
	const [locale, _setLocale] = useState<Locale>(
		() => (getCookie(LOCALE_COOKIE_NAME) as Locale) || DEFAULT_LOCALE
	);
	const [isLocaleReady, setIsLocaleReady] = useState(false);

	// Direction is always derived from current locale
	const [dir, setDir] = useState<Direction>(() =>
		getDirectionFromLocale(locale)
	);

	// Load and activate the saved locale on mount
	useEffect(() => {
		const initializeLocale = async () => {
			await loadAndActivateLocale(locale);
			setIsLocaleReady(true);
		};
		initializeLocale();
	}, [locale]);

	// Update HTML dir attribute whenever direction changes
	useEffect(() => {
		const htmlElement = document.documentElement;
		htmlElement.setAttribute("dir", dir);
	}, [dir]);

	const setLocale = async (newLocale: Locale) => {
		if (newLocale === locale) {
			return;
		}

		// Load and activate the new locale
		await loadAndActivateLocale(newLocale);

		// Update locale state and persist to cookie
		_setLocale(newLocale);
		setCookie(LOCALE_COOKIE_NAME, newLocale, LOCALE_COOKIE_MAX_AGE);

		// Automatically update direction based on the new locale
		const newDir = getDirectionFromLocale(newLocale);
		setDir(newDir);
		setIsLocaleReady(true);
	};

	const resetLocale = async () => {
		// Reset to default locale
		await loadAndActivateLocale(DEFAULT_LOCALE);
		_setLocale(DEFAULT_LOCALE);
		removeCookie(LOCALE_COOKIE_NAME);

		// Reset direction based on default locale
		const defaultDir = getDirectionFromLocale(DEFAULT_LOCALE);
		setDir(defaultDir);
		setIsLocaleReady(true);
	};

	if (!isLocaleReady) {
		return null;
	}

	return (
		<LinguiContext
			value={{
				dir,
				locale,
				setLocale,
				resetLocale,
			}}
		>
			<DirectionProvider direction={dir}>
				<I18nProvider i18n={i18n}>{children}</I18nProvider>
			</DirectionProvider>
		</LinguiContext>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLingui() {
	const context = useContext(LinguiContext);
	if (!context) {
		throw new Error("useLingui must be used within a LinguiProvider");
	}
	return context;
}
