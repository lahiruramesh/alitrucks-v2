"use client";

import { Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { MultiStepSignup } from "@/components/auth/multi-step-signup";
import { LanguageSwitcher } from "@/components/language-switcher";
import { RedirectAuthenticated } from "@/components/redirect-authenticated";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function SignupPage() {
	const t = useTranslations();

	return (
		<RedirectAuthenticated>
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-2xl w-full space-y-8">
					{/* Header with logo and controls */}
					<div className="flex justify-between items-center">
						<div className="flex items-center">
							<Truck className="h-8 w-8 text-primary" />
							<span className="ml-2 text-xl font-bold text-foreground">
								{t("common.aliTrucks")}
							</span>
						</div>
						<div className="flex gap-2">
							<ThemeSwitcher />
							<LanguageSwitcher />
						</div>
					</div>

					<div>
						<h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
							{t("signup.title")}
						</h2>
						<p className="mt-2 text-center text-sm text-muted-foreground">
							{t("signup.subtitle")}
						</p>
					</div>
					<MultiStepSignup />
				</div>
			</div>
		</RedirectAuthenticated>
	);
}
