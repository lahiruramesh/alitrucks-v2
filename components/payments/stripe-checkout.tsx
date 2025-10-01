"use client";

import { AlertTriangle, CreditCard, ExternalLink, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StripeCheckoutProps {
	amount: number;
	bookingId: string;
	onSuccess: () => void;
	onError: (error: string) => void;
}

export function StripeCheckout({
	amount,
	bookingId,
	onSuccess,
	onError,
}: StripeCheckoutProps) {
	const [loading, setLoading] = useState(false);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(price / 100);
	};

	const handleCheckout = async () => {
		try {
			setLoading(true);

			const response = await fetch("/api/payments/create-checkout-session", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					bookingId,
				}),
			});

			if (response.ok) {
				const data = await response.json();

				if (data.status === "success" && data.checkoutUrl) {
					// Redirect to the actual test checkout page
					window.location.href = data.checkoutUrl;
				} else if (data.status === "ready") {
					// Fallback for demo mode
					const message =
						`Stripe Checkout Integration Ready!\n\n` +
						`Booking: ${data.data.bookingId}\n` +
						`Amount: $${(data.data.amount / 100).toFixed(2)}\n` +
						`Product: ${data.data.productName}\n\n` +
						`In production, you would:\n` +
						data.implementation.steps.join("\n") +
						"\n\nFor demo: Redirecting to success page...";

					alert(message);
					onSuccess();
					window.location.href = data.data.successUrl;
				} else if (data.checkoutUrl) {
					window.location.href = data.checkoutUrl;
				} else if (data.url) {
					window.location.href = data.url;
				} else {
					onError("Unexpected response format from checkout API");
				}
			} else {
				const error = await response.json();
				onError(error.message || "Failed to create checkout session");
			}
		} catch (error) {
			console.error("Error creating checkout session:", error);
			onError("Failed to initialize checkout");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CreditCard className="h-5 w-5" />
					Secure Payment with Stripe
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
						<div className="flex items-start gap-2">
							<Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
							<div className="text-sm">
								<p className="font-medium text-blue-800 dark:text-blue-200">
									Secure Payment Authorization
								</p>
								<p className="text-blue-700 dark:text-blue-300">
									You'll be redirected to Stripe's secure payment page to
									authorize {formatPrice(amount)} for this booking.
								</p>
							</div>
						</div>
					</div>

					<div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
						<div className="flex items-start gap-2">
							<AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
							<div className="text-sm">
								<p className="font-medium text-yellow-800 dark:text-yellow-200">
									Pre-Authorization Only
								</p>
								<p className="text-yellow-700 dark:text-yellow-300">
									Your card won't be charged until the vehicle owner approves
									your booking. If rejected, the authorization will be released
									immediately.
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-2 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Lock className="h-4 w-4" />
							<span>Powered by Stripe - Industry-leading security</span>
						</div>
						<div className="flex items-center gap-2">
							<ExternalLink className="h-4 w-4" />
							<span>You'll be redirected to Stripe's secure payment page</span>
						</div>
					</div>

					<Button
						onClick={handleCheckout}
						disabled={loading}
						className="w-full"
						size="lg"
					>
						{loading ? (
							"Preparing checkout..."
						) : (
							<div className="flex items-center gap-2">
								<span>Continue to Stripe Checkout</span>
								<ExternalLink className="h-4 w-4" />
							</div>
						)}
					</Button>

					<p className="text-xs text-muted-foreground text-center">
						By clicking "Continue to Stripe Checkout", you'll be redirected to
						Stripe's secure payment page to authorize your payment method for
						this booking.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
