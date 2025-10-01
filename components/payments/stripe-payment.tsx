"use client";

import {
	CardElement,
	Elements,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AlertTriangle, CreditCard, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Initialize Stripe
const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);

interface PaymentFormProps {
	clientSecret: string;
	amount: number;
	onSuccess: () => void;
	onError: (error: string) => void;
}

function PaymentForm({
	clientSecret,
	amount,
	onSuccess,
	onError,
}: PaymentFormProps) {
	const stripe = useStripe();
	const elements = useElements();
	const [processing, setProcessing] = useState(false);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!stripe || !elements) {
			return;
		}

		setProcessing(true);

		const cardElement = elements.getElement(CardElement);

		if (!cardElement) {
			setProcessing(false);
			return;
		}

		const { error, paymentIntent } = await stripe.confirmCardPayment(
			clientSecret,
			{
				payment_method: {
					card: cardElement,
				},
			},
		);

		if (error) {
			console.error("Payment error:", error);
			onError(error.message || "Payment failed");
		} else if (paymentIntent?.status === "requires_capture") {
			// Payment was successfully authorized (pre-auth)
			onSuccess();
		}

		setProcessing(false);
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(price / 100);
	};

	const cardElementOptions = {
		style: {
			base: {
				fontSize: "16px",
				color: "#424770",
				"::placeholder": {
					color: "#aab7c4",
				},
			},
			invalid: {
				color: "#9e2146",
			},
		},
		hidePostalCode: false,
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CreditCard className="h-5 w-5" />
					Payment Information
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
						<div className="flex items-start gap-2">
							<Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
							<div className="text-sm">
								<p className="font-medium text-yellow-800 dark:text-yellow-200">
									Pre-Authorization Only
								</p>
								<p className="text-yellow-700 dark:text-yellow-300">
									We'll authorize {formatPrice(amount)} but won't charge your
									card until the vehicle owner approves your booking.
								</p>
							</div>
						</div>
					</div>

					<div className="p-4 border rounded-lg bg-card">
						<div className="block text-sm font-medium mb-2">
							Card Information
						</div>
						<CardElement options={cardElementOptions} />
					</div>

					<div className="space-y-2 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Lock className="h-4 w-4" />
							<span>Secured by Stripe</span>
						</div>
						<div className="flex items-center gap-2">
							<AlertTriangle className="h-4 w-4" />
							<span>No charge until booking approval</span>
						</div>
					</div>

					<Button
						type="submit"
						disabled={!stripe || processing}
						className="w-full"
						size="lg"
					>
						{processing ? "Processing..." : `Authorize ${formatPrice(amount)}`}
					</Button>

					<p className="text-xs text-muted-foreground text-center">
						Your payment method will be charged only if the vehicle owner
						approves your booking. If rejected, the authorization will be
						released immediately.
					</p>
				</form>
			</CardContent>
		</Card>
	);
}

interface StripePaymentProps {
	amount: number;
	bookingId: string;
	onSuccess: () => void;
	onError: (error: string) => void;
}

export function StripePayment({
	amount,
	bookingId,
	onSuccess,
	onError,
}: StripePaymentProps) {
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const createPaymentIntent = async () => {
		try {
			setLoading(true);

			const response = await fetch("/api/payments/create-intent", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					bookingId,
					amount: amount, // Amount in cents
					currency: "usd",
				}),
			});

			if (response.ok) {
				const { clientSecret } = await response.json();
				setClientSecret(clientSecret);
			} else {
				const error = await response.json();
				onError(error.message || "Failed to initialize payment");
			}
		} catch (error) {
			console.error("Error creating payment intent:", error);
			onError("Failed to initialize payment");
		} finally {
			setLoading(false);
		}
	};

	if (!clientSecret) {
		return (
			<Card>
				<CardContent className="p-6 text-center">
					{loading ? (
						<div>
							<div className="animate-pulse space-y-4">
								<div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
								<div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
							</div>
							<p className="text-sm text-muted-foreground mt-4">
								Initializing secure payment...
							</p>
						</div>
					) : (
						<div>
							<CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
							<h3 className="font-medium mb-2">Ready to authorize payment</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Click below to securely authorize your payment
							</p>
							<Button onClick={createPaymentIntent} size="lg">
								Initialize Payment
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		);
	}

	return (
		<Elements stripe={stripePromise}>
			<PaymentForm
				clientSecret={clientSecret}
				amount={amount}
				onSuccess={onSuccess}
				onError={onError}
			/>
		</Elements>
	);
}
