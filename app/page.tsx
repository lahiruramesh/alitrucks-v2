"use client";

import { Shield, Truck, Users, Zap } from "lucide-react";
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
							<a
								href="/signup"
								className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
							>
								{t("auth.signUp")}
							</a>
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
						Rent Trucks with
						<span className="text-primary"> Confidence</span>
					</h1>
					<p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
						Connect truck owners with renters. Whether you're an individual or
						managing a fleet, our platform makes truck rental simple, secure,
						and sustainable.
					</p>
					<div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
						<div className="rounded-md shadow">
							<a
								href="/signup"
								className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10 transition-colors"
							>
								Start Renting
							</a>
						</div>
						<div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
							<a
								href="/signup"
								className="w-full flex items-center justify-center px-8 py-3 border border-border text-base font-medium rounded-md text-primary bg-card hover:bg-accent md:py-4 md:text-lg md:px-10 transition-colors"
							>
								List Your Truck
							</a>
						</div>
					</div>
				</div>

				{/* Features */}
				<div className="mt-20">
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
						<div className="text-center">
							<div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground mx-auto">
								<Truck className="h-6 w-6" />
							</div>
							<h3 className="mt-6 text-lg font-medium text-foreground">
								Wide Selection
							</h3>
							<p className="mt-2 text-base text-muted-foreground">
								Choose from thousands of trucks for any job size
							</p>
						</div>

						<div className="text-center">
							<div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-500 text-white mx-auto">
								<Shield className="h-6 w-6" />
							</div>
							<h3 className="mt-6 text-lg font-medium text-foreground">
								Secure Payments
							</h3>
							<p className="mt-2 text-base text-muted-foreground">
								Protected transactions with Stripe integration
							</p>
						</div>

						<div className="text-center">
							<div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white mx-auto">
								<Users className="h-6 w-6" />
							</div>
							<h3 className="mt-6 text-lg font-medium text-foreground">
								Fleet Management
							</h3>
							<p className="mt-2 text-muted-foreground">
								Manage multiple vehicles with our fleet tools
							</p>
						</div>

						<div className="text-center">
							<div className="flex items-center justify-center h-12 w-12 rounded-md bg-lime-500 text-white mx-auto">
								<Zap className="h-6 w-6" />
							</div>
							<h3 className="mt-6 text-lg font-medium text-foreground">
								Carbon Tracking
							</h3>
							<p className="mt-2 text-base text-muted-foreground">
								Monitor environmental impact of your rentals
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
