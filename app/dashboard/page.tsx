"use client";

import {
	AlertTriangle,
	Calendar,
	Car,
	CheckCircle,
	Clock,
	DollarSign,
	TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
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

interface DashboardStats {
	totalBookings: number;
	pendingBookings: number;
	approvedBookings: number;
	totalSpent: number;
	totalEarnings: number;
	activeVehicles: number;
}

interface RecentBooking {
	id: string;
	status: string;
	totalPrice: number;
	startDate: string;
	vehicle: {
		modelName: string;
		make?: { name: string };
		images: string[];
	};
}

export default function DashboardPage() {
	const router = useRouter();
	const { user } = useAuth();
	const [stats, setStats] = useState<DashboardStats>({
		totalBookings: 0,
		pendingBookings: 0,
		approvedBookings: 0,
		totalSpent: 0,
		totalEarnings: 0,
		activeVehicles: 0,
	});
	const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchDashboardData = useCallback(async () => {
		try {
			setLoading(true);

			// Fetch user's bookings for stats
			const bookingsResponse = await fetch("/api/bookings?limit=5");
			if (bookingsResponse.ok) {
				const bookingsData = await bookingsResponse.json();
				setRecentBookings(bookingsData.bookings || []);

				// Calculate stats from bookings
				const bookings = bookingsData.bookings || [];
				const pendingCount = bookings.filter(
					(b: any) => b.status === "PENDING",
				).length;
				const approvedCount = bookings.filter(
					(b: any) => b.status === "APPROVED",
				).length;
				const totalSpent = bookings
					.filter((b: any) => b.status === "APPROVED")
					.reduce((sum: number, b: any) => sum + Number(b.totalPrice), 0);

				setStats((prev) => ({
					...prev,
					totalBookings: bookings.length,
					pendingBookings: pendingCount,
					approvedBookings: approvedCount,
					totalSpent: totalSpent,
				}));
			}

			// If user is a seller, fetch vehicle stats
			if (user?.role === "SELLER") {
				const sellerBookingsResponse = await fetch(
					"/api/bookings/seller?limit=100",
				);
				if (sellerBookingsResponse.ok) {
					const sellerData = await sellerBookingsResponse.json();
					const sellerBookings = sellerData.bookings || [];
					const totalEarnings = sellerBookings
						.filter((b: any) => b.status === "APPROVED")
						.reduce((sum: number, b: any) => sum + Number(b.totalPrice), 0);

					setStats((prev) => ({
						...prev,
						totalEarnings: totalEarnings,
					}));
				}

				// Fetch vehicles count
				const vehiclesResponse = await fetch("/api/vehicles");
				if (vehiclesResponse.ok) {
					const vehiclesData = await vehiclesResponse.json();
					setStats((prev) => ({
						...prev,
						activeVehicles: vehiclesData.vehicles?.length || 0,
					}));
				}
			}
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
		} finally {
			setLoading(false);
		}
	}, [user?.role]); // useCallback dependencies

	useEffect(() => {
		if (user) {
			fetchDashboardData();
		}
	}, [user, fetchDashboardData]);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(price);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "PENDING":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "APPROVED":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "REJECTED":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
		}
	};

	if (loading) {
		return (
			<ProtectedRoute allowedRoles={["BUYER", "SELLER", "ADMIN"]}>
				<DashboardLayout>
					<div className="animate-pulse space-y-6">
						<div className="h-8 bg-muted rounded"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{Array.from({ length: 4 }, (_, i) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: Fixed skeleton loader elements don't reorder
									key={`dashboard-skeleton-card-${i}`}
									className="h-32 bg-muted rounded"
								></div>
							))}
						</div>
						<div className="h-64 bg-muted rounded"></div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute allowedRoles={["BUYER", "SELLER", "ADMIN"]}>
			<DashboardLayout>
				<div className="space-y-6 p-4">
					{/* Welcome Header */}
					<div>
						<h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
						<p className="text-muted-foreground">
							Here's what's happening with your {user?.role?.toLowerCase()}{" "}
							account
						</p>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{/* Total Bookings */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									{user?.role === "SELLER" ? "Total Requests" : "My Bookings"}
								</CardTitle>
								<Calendar className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats.totalBookings}</div>
								<p className="text-xs text-muted-foreground">
									{user?.role === "SELLER"
										? "Booking requests received"
										: "Bookings made"}
								</p>
							</CardContent>
						</Card>

						{/* Pending */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Pending</CardTitle>
								<Clock className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{stats.pendingBookings}
								</div>
								<p className="text-xs text-muted-foreground">
									{user?.role === "SELLER"
										? "Awaiting your approval"
										: "Awaiting approval"}
								</p>
							</CardContent>
						</Card>

						{/* Approved/Revenue */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									{user?.role === "SELLER" ? "Earnings" : "Approved"}
								</CardTitle>
								{user?.role === "SELLER" ? (
									<DollarSign className="h-4 w-4 text-muted-foreground" />
								) : (
									<CheckCircle className="h-4 w-4 text-muted-foreground" />
								)}
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{user?.role === "SELLER"
										? formatPrice(stats.totalEarnings)
										: stats.approvedBookings}
								</div>
								<p className="text-xs text-muted-foreground">
									{user?.role === "SELLER"
										? "Total earnings"
										: "Confirmed bookings"}
								</p>
							</CardContent>
						</Card>

						{/* Vehicles/Spent */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									{user?.role === "SELLER" ? "Vehicles" : "Total Spent"}
								</CardTitle>
								{user?.role === "SELLER" ? (
									<Car className="h-4 w-4 text-muted-foreground" />
								) : (
									<DollarSign className="h-4 w-4 text-muted-foreground" />
								)}
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{user?.role === "SELLER"
										? stats.activeVehicles
										: formatPrice(stats.totalSpent)}
								</div>
								<p className="text-xs text-muted-foreground">
									{user?.role === "SELLER" ? "Active listings" : "On rentals"}
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Quick Actions */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Recent Activity */}
						<Card>
							<CardHeader>
								<CardTitle>Recent Bookings</CardTitle>
								<CardDescription>
									Your latest{" "}
									{user?.role === "SELLER" ? "booking requests" : "bookings"}
								</CardDescription>
							</CardHeader>
							<CardContent>
								{recentBookings.length === 0 ? (
									<div className="text-center py-8">
										<Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
										<p className="text-muted-foreground">No recent bookings</p>
									</div>
								) : (
									<div className="space-y-4">
										{recentBookings.slice(0, 3).map((booking) => (
											<div
												key={booking.id}
												className="flex items-center justify-between p-3 bg-muted rounded-lg"
											>
												<div className="flex items-center gap-3">
													<Image
														src={
															booking.vehicle.images?.[0] ||
															"/placeholder-truck.png"
														}
														alt={`${booking.vehicle.make?.name} ${booking.vehicle.modelName}`}
														width={40}
														height={40}
														className="w-10 h-10 object-cover rounded"
													/>
													<div>
														<p className="font-medium text-sm">
															{booking.vehicle.make?.name}{" "}
															{booking.vehicle.modelName}
														</p>
														<p className="text-xs text-muted-foreground">
															{new Date(booking.startDate).toLocaleDateString()}
														</p>
													</div>
												</div>
												<div className="text-right">
													<Badge className={getStatusColor(booking.status)}>
														{booking.status}
													</Badge>
													<p className="text-sm font-medium mt-1">
														{formatPrice(Number(booking.totalPrice))}
													</p>
												</div>
											</div>
										))}
									</div>
								)}

								<div className="mt-4">
									<Button
										variant="outline"
										className="w-full"
										onClick={() =>
											router.push(
												user?.role === "SELLER"
													? "/seller/bookings"
													: "/bookings",
											)
										}
									>
										View All Bookings
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Quick Actions */}
						<Card>
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
								<CardDescription>Common tasks and shortcuts</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{user?.role === "SELLER" ? (
									<>
										<Button
											className="w-full justify-start"
											variant="outline"
											onClick={() => router.push("/seller/vehicles/new")}
										>
											<Car className="h-4 w-4 mr-2" />
											Add New Vehicle
										</Button>
										<Button
											className="w-full justify-start"
											variant="outline"
											onClick={() => router.push("/seller/vehicles")}
										>
											<TrendingUp className="h-4 w-4 mr-2" />
											Manage Vehicles
										</Button>
										<Button
											className="w-full justify-start"
											variant="outline"
											onClick={() => router.push("/seller/bookings")}
										>
											<Calendar className="h-4 w-4 mr-2" />
											Booking Requests
										</Button>
									</>
								) : (
									<>
										<Button
											className="w-full justify-start"
											variant="outline"
											onClick={() => router.push("/vehicles")}
										>
											<Car className="h-4 w-4 mr-2" />
											Browse Vehicles
										</Button>
										<Button
											className="w-full justify-start"
											variant="outline"
											onClick={() => router.push("/bookings")}
										>
											<Calendar className="h-4 w-4 mr-2" />
											My Bookings
										</Button>
										{stats.pendingBookings > 0 && (
											<Button
												className="w-full justify-start"
												variant="default"
												onClick={() => router.push("/bookings")}
											>
												<AlertTriangle className="h-4 w-4 mr-2" />
												{stats.pendingBookings} Pending Booking
												{stats.pendingBookings > 1 ? "s" : ""}
											</Button>
										)}
									</>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
