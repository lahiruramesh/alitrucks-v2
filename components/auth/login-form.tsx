"use client";

import { Loader2, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
	const router = useRouter();
	const t = useTranslations();
	const { refreshUser } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.email.trim()) {
			newErrors.email =
				t("signup.steps.basicInfo.emailRequired") || "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email =
				t("signup.steps.basicInfo.validEmail") ||
				"Please enter a valid email address";
		}

		if (!formData.password) {
			newErrors.password =
				t("signup.steps.basicInfo.passwordRequired") || "Password is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		try {
			const { data, error } = await authClient.signIn.email({
				email: formData.email,
				password: formData.password,
			});

			if (error) {
				setErrors({ general: t("auth.invalidCredentials") });
				return;
			}

			// Refresh user context
			await refreshUser();

			// Redirect based on user role
			const userRole = (data?.user as any)?.role;
			if (userRole === "SELLER") {
				router.push("/seller");
			} else if (userRole === "ADMIN") {
				router.push("/admin");
			} else {
				router.push("/dashboard");
			}
		} catch (error) {
			console.error("Login failed:", error);
			setErrors({ general: t("auth.signInFailed") });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
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
						{t("auth.signIn")}
					</h2>
					<p className="mt-2 text-center text-sm text-muted-foreground">
						{t("auth.welcomeBack")}
					</p>
				</div>

				<Card className="w-full">
					<CardHeader>
						<CardTitle>{t("auth.signIn")}</CardTitle>
						<CardDescription>{t("auth.welcomeBack")}</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{errors.general && (
								<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
									<p className="text-sm text-destructive">{errors.general}</p>
								</div>
							)}

							<div>
								<Label htmlFor="email">{t("auth.email")}</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleInputChange("email", e.target.value)}
									placeholder={t("auth.email")}
									className={errors.email ? "border-destructive" : ""}
									disabled={isLoading}
								/>
								{errors.email && (
									<p className="text-sm text-destructive mt-1">
										{errors.email}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="password">{t("auth.password")}</Label>
								<Input
									id="password"
									type="password"
									value={formData.password}
									onChange={(e) =>
										handleInputChange("password", e.target.value)
									}
									placeholder={t("auth.password")}
									className={errors.password ? "border-destructive" : ""}
									disabled={isLoading}
								/>
								{errors.password && (
									<p className="text-sm text-destructive mt-1">
										{errors.password}
									</p>
								)}
							</div>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										{t("auth.signingIn")}
									</>
								) : (
									t("auth.signIn")
								)}
							</Button>

							<div className="text-center">
								<p className="text-sm text-muted-foreground">
									{t("auth.dontHaveAccount")}{" "}
									<Link href="/signup" className="text-primary hover:underline">
										{t("auth.signUpHere")}
									</Link>
								</p>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
