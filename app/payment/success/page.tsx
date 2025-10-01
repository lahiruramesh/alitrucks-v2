"use client";

import { Calendar, CheckCircle, CreditCard, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentSuccessPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [bookingData, setBookingData] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	const sessionId = searchParams.get("session_id");
	const bookingId = searchParams.get("booking_id");

	const fetchBookingDetails = useCallback(async () => {
		try {
			const response = await fetch(`/api/bookings/${bookingId}`);
			if (response.ok) {
				const data = await response.json();
				setBookingData(data);
			} else {
				setError("Failed to load booking details");
			}
		} catch (error) {
			console.error("Error fetching booking:", error);
			setError("Failed to load booking details");
		} finally {
			setLoading(false);
		}
	}, [bookingId]);

	useEffect(() => {
		if (bookingId) {
			fetchBookingDetails();
		}
	}, [bookingId, fetchBookingDetails]);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(price);
	};

	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (loading) {
		return (
			<div className="container max-w-2xl mx-auto py-8">
				<Card>
					<CardHeader>
						<Skeleton className="h-8 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-20" />
						<Skeleton className="h-16" />
						<Skeleton className="h-12" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container max-w-2xl mx-auto py-8">
				<Card>
					<CardContent className="text-center py-8">
						<p className="text-red-600">{error}</p>
						<Button onClick={() => router.push("/dashboard")} className="mt-4">
							Go to Dashboard
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container max-w-2xl mx-auto py-8">
			<Card>
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<CheckCircle className="h-16 w-16 text-green-500" />
					</div>
					<CardTitle className="text-2xl text-green-700 dark:text-green-400">
						Payment Authorization Successful!
					</CardTitle>
					<p className="text-muted-foreground">
						Your payment method has been securely authorized for this booking.
					</p>
				</CardHeader>

				<CardContent className="space-y-6">
					<div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
						<h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
							What happens next?
						</h3>
						<ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
							<li>• The vehicle owner will review your booking request</li>
							<li>• You'll receive an email notification when they respond</li>
							<li>
								• Your card will only be charged if they approve the booking
							</li>
							<li>
								• If rejected, the authorization will be released immediately
							</li>
						</ul>
					</div>

					{bookingData && (
						<div className="space-y-4">
							<h3 className="font-semibold">Booking Details</h3>

							<div className="grid gap-4">
								<div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
									<CreditCard className="h-5 w-5 text-blue-600" />
									<div>
										<p className="font-medium">Total Amount Authorized</p>
										<p className="text-sm text-muted-foreground">
											{formatPrice(Number(bookingData.totalPrice))}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
									<Calendar className="h-5 w-5 text-green-600" />
									<div>
										<p className="font-medium">Rental Period</p>
										<p className="text-sm text-muted-foreground">
											{formatDate(bookingData.startDate)} -{" "}
											{formatDate(bookingData.endDate)}
										</p>
									</div>
								</div>

								{bookingData.vehicle && (
									<div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
										<MapPin className="h-5 w-5 text-purple-600" />
										<div>
											<p className="font-medium">Vehicle</p>
											<p className="text-sm text-muted-foreground">
												{bookingData.vehicle.modelName || "Vehicle"}
												{bookingData.vehicle.year
													? ` (${bookingData.vehicle.year})`
													: ""}
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					<div className="flex gap-3">
						<Button
							onClick={() => router.push("/dashboard")}
							className="flex-1"
						>
							View My Bookings
						</Button>
						<Button
							onClick={() => router.push("/vehicles")}
							variant="outline"
							className="flex-1"
						>
							Browse More Vehicles
						</Button>
					</div>

					{sessionId && (
						<div className="text-xs text-muted-foreground text-center">
							Transaction ID: {sessionId}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
