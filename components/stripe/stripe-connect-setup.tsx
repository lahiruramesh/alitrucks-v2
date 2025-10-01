"use client";

import {
	AlertCircle,
	CheckCircle,
	CreditCard,
	ExternalLink,
	Loader2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

interface StripeAccountData {
	hasAccount: boolean;
	account: {
		id: string;
		detailsSubmitted: boolean;
		chargesEnabled: boolean;
		payoutsEnabled: boolean;
		status: string;
	} | null;
	error?: string;
}

export function StripeConnectSetup() {
	const { user } = useAuth();
	const [accountData, setAccountData] = useState<StripeAccountData | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);
	const [onboarding, setOnboarding] = useState(false);
	const [accessingDashboard, setAccessingDashboard] = useState(false);

	// Fetch account status
	const fetchAccountStatus = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/stripe/connect/account");
			if (response.ok) {
				const data = await response.json();
				setAccountData(data);
			} else {
				console.error("Failed to fetch account status");
			}
		} catch (error) {
			console.error("Error fetching account status:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (user?.role === "SELLER") {
			fetchAccountStatus();
		}
	}, [user, fetchAccountStatus]);

	// Create Stripe account
	const createAccount = async () => {
		try {
			setCreating(true);
			const response = await fetch("/api/stripe/connect/account", {
				method: "POST",
			});

			if (response.ok) {
				await fetchAccountStatus();
			} else {
				const error = await response.json();
				console.error("Failed to create account:", error);
			}
		} catch (error) {
			console.error("Error creating account:", error);
		} finally {
			setCreating(false);
		}
	};

	// Start onboarding process
	const startOnboarding = async () => {
		try {
			setOnboarding(true);
			const response = await fetch("/api/stripe/connect/onboarding", {
				method: "POST",
			});

			if (response.ok) {
				const { url } = await response.json();
				window.location.href = url;
			} else {
				console.error("Failed to create onboarding link");
			}
		} catch (error) {
			console.error("Error starting onboarding:", error);
		} finally {
			setOnboarding(false);
		}
	};

	// Access Stripe dashboard
	const accessDashboard = async () => {
		try {
			setAccessingDashboard(true);
			const response = await fetch("/api/stripe/connect/dashboard", {
				method: "POST",
			});

			if (response.ok) {
				const { url } = await response.json();
				window.open(url, "_blank");
			} else {
				console.error("Failed to create dashboard link");
			}
		} catch (error) {
			console.error("Error accessing dashboard:", error);
		} finally {
			setAccessingDashboard(false);
		}
	};

	if (user?.role !== "SELLER") {
		return null;
	}

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CreditCard className="h-5 w-5" />
						Bank Account Setup
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CreditCard className="h-5 w-5" />
					Bank Account Setup
				</CardTitle>
				<CardDescription>
					Connect your bank account to receive payments from vehicle sales
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{!accountData?.hasAccount ? (
					// No account created yet
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-amber-600">
							<AlertCircle className="h-4 w-4" />
							<span className="text-sm">
								You need to set up a bank account to sell vehicles
							</span>
						</div>
						<Button
							onClick={createAccount}
							disabled={creating}
							className="w-full"
						>
							{creating ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating Account...
								</>
							) : (
								"Create Stripe Account"
							)}
						</Button>
					</div>
				) : accountData.account?.detailsSubmitted ? (
					// Account is fully set up
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-green-600">
							<CheckCircle className="h-4 w-4" />
							<span className="text-sm">
								Bank account is connected and verified
							</span>
						</div>

						<div className="flex gap-2 flex-wrap">
							<Badge
								variant={
									accountData.account.chargesEnabled ? "default" : "secondary"
								}
							>
								{accountData.account.chargesEnabled
									? "Charges Enabled"
									: "Charges Disabled"}
							</Badge>
							<Badge
								variant={
									accountData.account.payoutsEnabled ? "default" : "secondary"
								}
							>
								{accountData.account.payoutsEnabled
									? "Payouts Enabled"
									: "Payouts Disabled"}
							</Badge>
						</div>

						<Button
							onClick={accessDashboard}
							disabled={accessingDashboard}
							variant="outline"
							className="w-full"
						>
							{accessingDashboard ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Accessing Dashboard...
								</>
							) : (
								<>
									<ExternalLink className="mr-2 h-4 w-4" />
									Access Stripe Dashboard
								</>
							)}
						</Button>
					</div>
				) : (
					// Account created but onboarding not completed
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-amber-600">
							<AlertCircle className="h-4 w-4" />
							<span className="text-sm">
								Please complete your bank account setup
							</span>
						</div>

						<Button
							onClick={startOnboarding}
							disabled={onboarding}
							className="w-full"
						>
							{onboarding ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Starting Setup...
								</>
							) : (
								"Complete Bank Account Setup"
							)}
						</Button>
					</div>
				)}

				{accountData?.error && (
					<div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
						{accountData.error}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
