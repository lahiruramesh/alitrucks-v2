"use client";

import { AlertTriangle, ArrowLeft, CreditCard } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { StripeCheckout } from "@/components/payments/stripe-checkout";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";

interface BookingWithDetails {
	id: string;
	startDate: string;
	endDate: string;
	totalPrice: number;
	status: string;
	vehicle: {
		id: string;
		modelName: string;
		images: string[];
		make?: { name: string };
		type?: { name: string };
		city?: string;
		region?: string;
		seller: {
			name: string;
			email: string;
		};
	};
	buyer: {
		name: string;
		email: string;
	};
	payments: {
		id: string;
		amount: number;
		paymentStatus: string;
		stripePaymentIntentId?: string;
	}[];
}

export default function BookingPaymentPage() {
	const router = useRouter();
	const params = useParams();
	const { user } = useAuth();
	const bookingId = Array.isArray(params.id) ? params.id[0] : params.id;

	const [booking, setBooking] = useState<BookingWithDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [_paymentLoading, _setPaymentLoading] = useState(false);

	const fetchBooking = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/bookings/${bookingId}`);

			if (response.ok) {
				const data = await response.json();
				setBooking(data);
			} else {
				console.error("Booking not found");
				router.push("/dashboard");
			}
		} catch (error) {
			console.error("Error fetching booking:", error);
			router.push("/dashboard");
		} finally {
			setLoading(false);
		}
	}, [bookingId, router]); // Dependencies for useCallback

	useEffect(() => {
		if (bookingId && user) {
			fetchBooking();
		}
	}, [bookingId, user, fetchBooking]);

	const _handlePayment = async () => {
		// This will be handled by the StripeCheckout component
		return;
	};

	const handlePaymentSuccess = () => {
		alert(
			"Payment authorized successfully! The vehicle owner will review your booking.",
		);
		router.push("/dashboard");
	};

	const handlePaymentError = (error: string) => {
		alert(`Payment failed: ${error}`);
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(price);
	};

	const calculateDays = (startDate: string, endDate: string) => {
		const start = new Date(startDate);
		const end = new Date(endDate);
		const diffTime = Math.abs(end.getTime() - start.getTime());
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	};

	if (loading) {
		return (
			<ProtectedRoute allowedRoles={["BUYER", "SELLER"]}>
				<DashboardLayout>
					<div className="animate-pulse space-y-6">
						<div className="h-8 bg-muted rounded"></div>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<div className="h-96 bg-muted rounded"></div>
							<div className="h-96 bg-muted rounded"></div>
						</div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	if (!booking) {
		return (
			<ProtectedRoute allowedRoles={["BUYER", "SELLER"]}>
				<DashboardLayout>
					<div className="text-center py-12">
						<h1 className="text-2xl font-bold mb-4">Booking not found</h1>
						<Button onClick={() => router.push("/dashboard")}>
							Back to Dashboard
						</Button>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	const hasPayment = booking.payments.length > 0;
	const _isPaid =
		hasPayment && booking.payments.some((p) => p.paymentStatus === "COMPLETED");
	const isPending = booking.status === "PENDING";

	return (
		<ProtectedRoute allowedRoles={["BUYER", "SELLER"]}>
			<DashboardLayout>
				<div className="max-w-4xl mx-auto space-y-6">
					{/* Header */}
					<div className="flex items-center gap-4">
						<Button variant="outline" onClick={() => router.back()}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Button>
						<div>
							<h1 className="text-2xl font-bold">Complete Your Booking</h1>
							<p className="text-muted-foreground">Booking ID: {booking.id}</p>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Booking Details */}
						<Card>
							<CardHeader>
								<CardTitle>Booking Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Vehicle Info */}
								<div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
									<Image
										src={
											booking.vehicle.images?.[0] || "/placeholder-truck.png"
										}
										alt={`${booking.vehicle.make?.name} ${booking.vehicle.modelName}`}
										width={64}
										height={64}
										className="w-16 h-16 object-cover rounded"
									/>
									<div>
										<h4 className="font-medium">
											{booking.vehicle.make?.name} {booking.vehicle.modelName}
										</h4>
										<p className="text-sm text-muted-foreground">
											{booking.vehicle.city}, {booking.vehicle.region}
										</p>
										<p className="text-sm text-muted-foreground">
											Owner: {booking.vehicle.seller.name}
										</p>
									</div>
								</div>

								<Separator />

								{/* Dates and Duration */}
								<div className="space-y-2">
									<div className="flex justify-between">
										<span>Check-in:</span>
										<span>
											{new Date(booking.startDate).toLocaleDateString()}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Check-out:</span>
										<span>
											{new Date(booking.endDate).toLocaleDateString()}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Duration:</span>
										<span>
											{calculateDays(booking.startDate, booking.endDate)} days
										</span>
									</div>
								</div>

								<Separator />

								{/* Pricing */}
								<div className="space-y-2">
									<div className="flex justify-between font-medium text-lg">
										<span>Total:</span>
										<span>{formatPrice(Number(booking.totalPrice))}</span>
									</div>
								</div>

								{/* Status */}
								<div className="flex items-center gap-2">
									<span>Status:</span>
									<span
										className={`px-2 py-1 rounded text-sm font-medium ${
											booking.status === "PENDING"
												? "bg-yellow-100 text-yellow-800"
												: booking.status === "APPROVED"
													? "bg-green-100 text-green-800"
													: booking.status === "REJECTED"
														? "bg-red-100 text-red-800"
														: "bg-gray-100 text-gray-800"
										}`}
									>
										{booking.status}
									</span>
								</div>
							</CardContent>
						</Card>

						{/* Payment Section */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="h-5 w-5" />
									Payment
								</CardTitle>
								<CardDescription>
									Secure payment with pre-authorization
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{!hasPayment && isPending && (
									<StripeCheckout
										amount={booking.totalPrice * 100} // Convert to cents
										bookingId={booking.id}
										onSuccess={handlePaymentSuccess}
										onError={handlePaymentError}
									/>
								)}

								{hasPayment && (
									<div className="space-y-4">
										{booking.payments.map((payment) => (
											<div key={payment.id} className="p-4 bg-muted rounded-lg">
												<div className="flex justify-between items-center">
													<span>Payment Status:</span>
													<span
														className={`px-2 py-1 rounded text-sm font-medium ${
															payment.paymentStatus === "COMPLETED"
																? "bg-green-100 text-green-800"
																: payment.paymentStatus === "PENDING"
																	? "bg-yellow-100 text-yellow-800"
																	: payment.paymentStatus === "PROCESSING"
																		? "bg-blue-100 text-blue-800"
																		: "bg-gray-100 text-gray-800"
														}`}
													>
														{payment.paymentStatus}
													</span>
												</div>
												<div className="flex justify-between items-center mt-2">
													<span>Amount:</span>
													<span className="font-medium">
														{formatPrice(Number(payment.amount))}
													</span>
												</div>
											</div>
										))}

										{booking.status === "PENDING" && (
											<div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
												<div className="flex items-start gap-2">
													<AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
													<div className="text-sm">
														<p className="font-medium text-yellow-800 dark:text-yellow-200">
															Waiting for Approval
														</p>
														<p className="text-yellow-700 dark:text-yellow-300">
															Your payment has been authorized. The vehicle
															owner will review your booking and respond soon.
														</p>
													</div>
												</div>
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
