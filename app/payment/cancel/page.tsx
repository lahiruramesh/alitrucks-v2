"use client";

import { Home, RotateCcw, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentCancelPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [bookingData, setBookingData] = useState<any>(null);

	const bookingId = searchParams.get("booking_id");

	const fetchBookingDetails = useCallback(async () => {
		try {
			const response = await fetch(`/api/bookings/${bookingId}`);
			if (response.ok) {
				const data = await response.json();
				setBookingData(data);
			}
		} catch (error) {
			console.error("Error fetching booking:", error);
		}
	}, [bookingId]);

	useEffect(() => {
		if (bookingId) {
			fetchBookingDetails();
		}
	}, [bookingId, fetchBookingDetails]);

	const retryPayment = () => {
		if (bookingId) {
			router.push(`/vehicles/${bookingData?.vehicleId}?booking=${bookingId}`);
		} else {
			router.push("/vehicles");
		}
	};

	return (
		<div className="container max-w-2xl mx-auto py-8">
			<Card>
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<XCircle className="h-16 w-16 text-orange-500" />
					</div>
					<CardTitle className="text-2xl text-orange-700 dark:text-orange-400">
						Payment Cancelled
					</CardTitle>
					<p className="text-muted-foreground">
						You cancelled the payment process. Your booking is still pending.
					</p>
				</CardHeader>

				<CardContent className="space-y-6">
					<div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
						<h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
							What happened?
						</h3>
						<ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
							<li>• You chose to cancel the payment authorization</li>
							<li>• Your booking request is still saved</li>
							<li>• No charges were made to your payment method</li>
							<li>• You can complete the payment at any time</li>
						</ul>
					</div>

					{bookingData && (
						<div className="space-y-4">
							<h3 className="font-semibold">Your Pending Booking</h3>

							<div className="p-4 bg-muted rounded-lg">
								<div className="flex justify-between items-start">
									<div>
										<p className="font-medium">
											{bookingData.vehicle?.modelName || "Vehicle"}
											{bookingData.vehicle?.year
												? ` (${bookingData.vehicle.year})`
												: ""}
										</p>
										<p className="text-sm text-muted-foreground">
											{new Date(bookingData.startDate).toLocaleDateString()} -{" "}
											{new Date(bookingData.endDate).toLocaleDateString()}
										</p>
									</div>
									<div className="text-right">
										<p className="font-semibold">
											${Number(bookingData.totalPrice).toFixed(2)}
										</p>
										<p className="text-xs text-muted-foreground">Total</p>
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
						<p className="text-sm text-blue-700 dark:text-blue-300">
							<strong>Ready to complete your booking?</strong> You can return to
							the vehicle page to authorize payment and submit your booking
							request to the owner.
						</p>
					</div>

					<div className="flex gap-3">
						<Button onClick={retryPayment} className="flex-1">
							<RotateCcw className="h-4 w-4 mr-2" />
							Complete Payment
						</Button>
						<Button
							onClick={() => router.push("/dashboard")}
							variant="outline"
							className="flex-1"
						>
							<Home className="h-4 w-4 mr-2" />
							Go to Dashboard
						</Button>
					</div>

					<div className="text-center">
						<Button
							onClick={() => router.push("/vehicles")}
							variant="ghost"
							size="sm"
						>
							Browse Other Vehicles
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
