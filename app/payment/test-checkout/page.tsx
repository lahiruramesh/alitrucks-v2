"use client";

import { AlertCircle, CheckCircle, CreditCard, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function TestCheckoutPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [processing, setProcessing] = useState(false);
	const [selectedCard, setSelectedCard] = useState("4242424242424242");

	const _price = searchParams.get("price");
	const amount = searchParams.get("amount");
	const booking = searchParams.get("booking");

	const testCards = [
		{ number: "4242424242424242", description: "Visa - Succeeds" },
		{ number: "4000000000000002", description: "Visa - Declined" },
		{ number: "4000000000009995", description: "Visa - Insufficient funds" },
		{
			number: "4000000000000341",
			description: "Visa - Requires authentication",
		},
		{ number: "5555555555554444", description: "Mastercard - Succeeds" },
	];

	const formatAmount = (amt: string) => {
		const numAmount = parseInt(amt, 10) || 50000; // Default to $500
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(numAmount / 100);
	};

	const handlePayment = async () => {
		setProcessing(true);

		// Simulate payment processing
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Determine outcome based on test card
		if (
			selectedCard === "4000000000000002" ||
			selectedCard === "4000000000009995"
		) {
			// Simulate failure
			alert(
				`Payment failed: ${selectedCard === "4000000000000002" ? "Card declined" : "Insufficient funds"}`,
			);
			setProcessing(false);
			return;
		}

		if (selectedCard === "4000000000000341") {
			// Simulate 3D Secure
			const confirmed = confirm(
				"3D Secure Authentication Required\n\nClick OK to authenticate, Cancel to fail",
			);
			if (!confirmed) {
				alert("Payment failed: Authentication failed");
				setProcessing(false);
				return;
			}
		}

		// Success case
		const sessionId = `cs_test_${Date.now()}`;
		const successUrl = `/payment/success?session_id=${sessionId}&booking_id=${booking}`;

		setProcessing(false);
		router.push(successUrl);
	};

	const handleCancel = () => {
		const cancelUrl = `/payment/cancel?booking_id=${booking}`;
		router.push(cancelUrl);
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container max-w-md mx-auto">
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Lock className="h-5 w-5 text-blue-600" />
							<CardTitle>Secure Checkout</CardTitle>
						</div>
						<p className="text-sm text-muted-foreground">
							Test environment - Use test cards below
						</p>
					</CardHeader>

					<CardContent className="space-y-6">
						{/* Order Summary */}
						<div className="bg-blue-50 p-4 rounded-lg">
							<h3 className="font-medium mb-2">Order Summary</h3>
							<div className="flex justify-between">
								<span>Vehicle Rental</span>
								<span className="font-semibold">
									{formatAmount(amount || "50000")}
								</span>
							</div>
							<Separator className="my-2" />
							<div className="flex justify-between font-semibold">
								<span>Total</span>
								<span>{formatAmount(amount || "50000")}</span>
							</div>
						</div>

						{/* Test Cards Selection */}
						<div>
							<Label className="text-base font-medium">Select Test Card</Label>
							<div className="mt-2 space-y-2">
								{testCards.map((card) => (
									<div
										key={card.number}
										className="flex items-center space-x-2"
									>
										<input
											type="radio"
											id={card.number}
											name="testCard"
											value={card.number}
											checked={selectedCard === card.number}
											onChange={(e) => setSelectedCard(e.target.value)}
											className="h-4 w-4"
										/>
										<label
											htmlFor={card.number}
											className="text-sm cursor-pointer flex-1"
										>
											<span className="font-mono">{card.number}</span>
											<span className="text-muted-foreground ml-2">
												{card.description}
											</span>
										</label>
									</div>
								))}
							</div>
						</div>

						{/* Card Details Form */}
						<div className="space-y-4">
							<div>
								<Label htmlFor="cardNumber">Card Number</Label>
								<Input
									id="cardNumber"
									value={selectedCard}
									onChange={(e) => setSelectedCard(e.target.value)}
									placeholder="1234 5678 9012 3456"
									className="font-mono"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="expiry">Expiry</Label>
									<Input id="expiry" defaultValue="12/34" placeholder="MM/YY" />
								</div>
								<div>
									<Label htmlFor="cvc">CVC</Label>
									<Input id="cvc" defaultValue="123" placeholder="123" />
								</div>
							</div>

							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									defaultValue="test@example.com"
									placeholder="your@email.com"
								/>
							</div>
						</div>

						{/* Security Notice */}
						<div className="bg-green-50 p-3 rounded-lg border border-green-200">
							<div className="flex items-start gap-2">
								<CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
								<div className="text-xs text-green-700">
									<p className="font-medium">Secure Test Environment</p>
									<p>This is a test checkout. No real charges will be made.</p>
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="space-y-3">
							<Button
								onClick={handlePayment}
								disabled={processing}
								className="w-full"
								size="lg"
							>
								{processing ? (
									"Processing..."
								) : (
									<div className="flex items-center gap-2">
										<CreditCard className="h-4 w-4" />
										<span>Pay {formatAmount(amount || "50000")}</span>
									</div>
								)}
							</Button>

							<Button
								onClick={handleCancel}
								variant="outline"
								className="w-full"
								disabled={processing}
							>
								Cancel Payment
							</Button>
						</div>

						{/* Test Instructions */}
						<div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
							<div className="flex items-start gap-2">
								<AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
								<div className="text-xs text-yellow-700">
									<p className="font-medium">Test Card Instructions</p>
									<ul className="mt-1 space-y-1">
										<li>• Use any future expiry date (e.g., 12/34)</li>
										<li>• Use any 3-digit CVC (e.g., 123)</li>
										<li>• Different cards simulate different outcomes</li>
									</ul>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
