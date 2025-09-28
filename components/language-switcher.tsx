"use client";

import { Globe, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";

const languages = {
	en: { name: "English", flag: "🇺🇸" },
	sv: { name: "Svenska", flag: "🇸🇪" },
};

export function LanguageSwitcher() {
	const { locale, setLocale } = useLocale();
	const [isChanging, setIsChanging] = useState(false);

	const handleLanguageChange = (newLocale: string) => {
		if (newLocale === locale) return;

		setIsChanging(true);
		setLocale(newLocale);

		// Force a hard refresh to apply the new locale
		setTimeout(() => {
			window.location.reload();
		}, 100);
	};

	const currentLanguage =
		languages[locale as keyof typeof languages] || languages.en;

	return (
		<Select
			value={locale}
			onValueChange={handleLanguageChange}
			disabled={isChanging}
		>
			<SelectTrigger className="w-[140px]">
				<div className="flex items-center">
					{isChanging ? (
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
					) : (
						<Globe className="h-4 w-4 mr-2" />
					)}
					<span className="flex items-center gap-1">
						<span>{currentLanguage.flag}</span>
						<span>{currentLanguage.name}</span>
					</span>
				</div>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="en">
					<div className="flex items-center gap-2">
						<span>🇺🇸</span>
						<span>English</span>
					</div>
				</SelectItem>
				<SelectItem value="sv">
					<div className="flex items-center gap-2">
						<span>🇸🇪</span>
						<span>Svenska</span>
					</div>
				</SelectItem>
			</SelectContent>
		</Select>
	);
}
