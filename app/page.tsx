"use client";

import { Clock, Mail, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
	const t = useTranslations();

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950">
			{/* Header */}
			<header className="bg-card shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div className="flex items-center">
							<Truck className="h-8 w-8 text-primary" />
							<span className="ml-2 text-xl font-bold text-foreground">
								{t("common.aliTrucks")}
							</span>
						</div>
						<div className="flex items-center gap-4">
							<ThemeSwitcher />
							<LanguageSwitcher />
							<a
								href="/login"
								className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
							>
								{t("auth.signIn")}
							</a>
						</div>
					</div>
				</div>
			</header>

			{/* Coming Soon Section */}
			<main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
				<div className="max-w-3xl mx-auto text-center">
					<div className="mb-8">
						<div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary text-primary-foreground mx-auto mb-6">
							<Truck className="h-10 w-10" />
						</div>
						<h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
							Coming Soon
						</h1>
						<p className="mt-4 text-xl text-muted-foreground">
							We're building something amazing for truck rentals
						</p>
					</div>

					<div className="bg-card rounded-lg shadow-lg p-8 mb-8">
						<div className="flex items-center justify-center mb-4">
							<Clock className="h-6 w-6 text-primary mr-2" />
							<span className="text-lg font-medium text-foreground">
								Our platform is under development
							</span>
						</div>
						<p className="text-muted-foreground mb-6">
							Connect truck owners with renters. Whether you're an individual or
							managing a fleet, our platform will make truck rental simple,
							secure, and sustainable.
						</p>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
							<div className="text-center">
								<div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-2">
									<Truck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
								</div>
								<h3 className="font-medium text-foreground">Wide Selection</h3>
								<p className="text-muted-foreground">
									Thousands of trucks for any job
								</p>
							</div>
							<div className="text-center">
								<div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-2">
									<Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
								</div>
								<h3 className="font-medium text-foreground">Secure Platform</h3>
								<p className="text-muted-foreground">Protected transactions</p>
							</div>
							<div className="text-center">
								<div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-2">
									<Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
								</div>
								<h3 className="font-medium text-foreground">
									Fleet Management
								</h3>
								<p className="text-muted-foreground">
									Manage multiple vehicles
								</p>
							</div>
						</div>
					</div>

					<div className="text-center">
						<p className="text-sm text-muted-foreground mb-4">
							Want to be notified when we launch? Get in touch with us!
						</p>
						<a
							href="mailto:info@alitrucks.com"
							className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
						>
							<Mail className="h-5 w-5 mr-2" />
							Contact Us
						</a>
					</div>
				</div>
			</main>
		</div>
	);
}
