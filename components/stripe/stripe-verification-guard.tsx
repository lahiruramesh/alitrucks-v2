"use client";

import { AlertCircle, CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStripeAccount } from "@/hooks/use-stripe-account";

interface StripeVerificationGuardProps {
	children: React.ReactNode;
}

export function StripeVerificationGuard({
	children,
}: StripeVerificationGuardProps) {
	const { isVerified, hasAccount, isLoading } = useStripeAccount();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-muted-foreground">Checking account status...</div>
			</div>
		);
	}

	if (!isVerified) {
		return (
			<div className="space-y-6">
				<Card className="border-amber-200 bg-amber-50">
					<CardContent className="pt-6">
						<div className="flex items-start gap-3">
							<AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
							<div className="space-y-3">
								<div>
									<h3 className="font-medium text-amber-900">
										Bank Account Setup Required
									</h3>
									<p className="text-sm text-amber-800 mt-1">
										{!hasAccount
											? "You need to set up a bank account before you can publish vehicles for sale."
											: "Please complete your bank account verification to start publishing vehicles."}
									</p>
								</div>

								<div className="flex gap-3">
									<Button asChild size="sm">
										<Link
											href="/profile"
											className="inline-flex items-center gap-1"
										>
											<CreditCard className="h-3 w-3" />
											{!hasAccount
												? "Set Up Bank Account"
												: "Complete Verification"}
										</Link>
									</Button>
									<Button asChild size="sm" variant="outline">
										<Link href="/seller">Back to Dashboard</Link>
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="opacity-50 pointer-events-none">
					<CardContent className="pt-6">
						<div className="text-center text-muted-foreground">
							Vehicle publishing form will be available after bank account
							verification
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return <>{children}</>;
}
