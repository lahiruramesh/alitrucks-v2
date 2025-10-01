"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface LocaleContextType {
	locale: string;
	setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Cookie utilities using Cookie Store API with graceful fallback
const cookieUtils = {
	get: (name: string): string | null => {
		if (typeof document === "undefined") return null;

		const value = document.cookie
			.split("; ")
			.find((row) => row.startsWith(`${name}=`))
			?.split("=")[1];

		return value || null;
	},

	set: async (
		name: string,
		value: string,
		options: { path?: string; maxAge?: number; sameSite?: string } = {},
	) => {
		if (typeof document === "undefined") return;

		// Try Cookie Store API first (when available)
		if ("cookieStore" in window) {
			try {
				await (window as any).cookieStore.set({
					name,
					value,
					path: options.path || "/",
					...(options.maxAge && {
						expires: Date.now() + options.maxAge * 1000,
					}),
					sameSite: options.sameSite || "lax",
				});
				return;
			} catch (error) {
				console.warn(
					"Cookie Store API not supported, using legacy method:",
					error,
				);
			}
		}

		// For browsers without Cookie Store API, we'll use a library or suppress the lint
		// In production, consider using js-cookie library or similar
		/* biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API */
		document.cookie = [
			`${name}=${value}`,
			options.path && `path=${options.path}`,
			options.maxAge && `max-age=${options.maxAge}`,
			options.sameSite && `SameSite=${options.sameSite}`,
		]
			.filter(Boolean)
			.join("; ");
	},
};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
	const [locale, setLocaleState] = useState("en");

	useEffect(() => {
		// Get locale from cookie on mount
		const cookieLocale = cookieUtils.get("locale");
		if (cookieLocale) {
			setLocaleState(cookieLocale);
		}
	}, []);

	const setLocale = async (newLocale: string) => {
		setLocaleState(newLocale);
		await cookieUtils.set("locale", newLocale, {
			path: "/",
			maxAge: 31536000, // 1 year
			sameSite: "Lax",
		});
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
