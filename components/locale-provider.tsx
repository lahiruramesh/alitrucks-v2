"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface LocaleContextType {
	locale: string;
	setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
	const [locale, setLocaleState] = useState("en");

	useEffect(() => {
		// Get locale from cookie on mount
		const cookieLocale = document.cookie
			.split("; ")
			.find((row) => row.startsWith("locale="))
			?.split("=")[1];

		if (cookieLocale) {
			setLocaleState(cookieLocale);
		}
	}, []);

	const setLocale = (newLocale: string) => {
		setLocaleState(newLocale);
		document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
	};

	return (
		<LocaleContext.Provider value={{ locale, setLocale }}>
			{children}
		</LocaleContext.Provider>
	);
}

export function useLocale() {
	const context = useContext(LocaleContext);
	if (context === undefined) {
		throw new Error("useLocale must be used within a LocaleProvider");
	}
	return context;
}
