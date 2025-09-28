"use client";

import { Calendar, CheckCircle, Clock, Truck, Users } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface AdminStats {
	totalUsers: number;
	totalVehicles: number;
	totalBookings: number;
	activeVehicles: number;
	pendingBookings: number;
	recentUsers: Array<{
		id: string;
		name: string;
		email: string;
		role: string;
		createdAt: string;
	}>;
	recentVehicles: Array<{
		id: string;
		model: string;
		make: { name: string } | null;
		seller: { name: string; email: string };
		createdAt: string;
	}>;
}

export default function AdminPage() {
	const t = useTranslations();
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchStats = async () => {
		try {
			const response = await fetch("/api/admin/stats");
			if (response.ok) {
				const data = await response.json();
				setStats(data);
			}
		} catch (error) {
			console.error("Error fetching admin stats:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchStats();
	}, []);

	if (isLoading) {
		return (
			<ProtectedRoute allowedRoles={["ADMIN"]}>
				<DashboardLayout>
					<div className="flex justify-center items-center h-64">
						<div className="text-muted-foreground">Loading dashboard...</div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute allowedRoles={["ADMIN"]}>
			<DashboardLayout>
				<div className="flex flex-1 flex-col gap-4 p-4">
					<div className="mb-4">
						<h1 className="text-2xl font-bold text-foreground">
							{t("dashboard.admin.title")}
						</h1>
						<p className="text-muted-foreground">
							Overview of platform statistics and recent activity
						</p>
					</div>

					{/* Stats Cards */}
					<div className="grid auto-rows-min gap-4 md:grid-cols-5">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Users
								</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{stats?.totalUsers || 0}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Vehicles
								</CardTitle>
								<Truck className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{stats?.totalVehicles || 0}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Active Vehicles
								</CardTitle>
								<CheckCircle className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{stats?.activeVehicles || 0}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Bookings
								</CardTitle>
								<Calendar className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{stats?.totalBookings || 0}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Pending Bookings
								</CardTitle>
								<Clock className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{stats?.pendingBookings || 0}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Quick Actions */}
					<div className="grid gap-4 md:grid-cols-3">
						<Card>
							<CardHeader>
								<CardTitle>Vehicle Management</CardTitle>
								<CardDescription>
									Manage vehicle makes, types, and fuel types
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Link href="/admin/vehicle-management">
									<Button className="w-full">
										<Truck className="h-4 w-4 mr-2" />
										Manage Vehicles
									</Button>
								</Link>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>User Management</CardTitle>
								<CardDescription>
									View and manage platform users
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button className="w-full" disabled>
									<Users className="h-4 w-4 mr-2" />
									Manage Users (Coming Soon)
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Booking Approvals</CardTitle>
								<CardDescription>
									Review and approve pending bookings
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button className="w-full" disabled>
									<CheckCircle className="h-4 w-4 mr-2" />
									Review Bookings (Coming Soon)
								</Button>
							</CardContent>
						</Card>
					</div>

					{/* Recent Activity */}
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Recent Users</CardTitle>
								<CardDescription>Latest user registrations</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{stats?.recentUsers?.map((user) => (
										<div
											key={user.id}
											className="flex items-center justify-between p-2 border rounded"
										>
											<div>
												<p className="font-medium">{user.name}</p>
												<p className="text-sm text-muted-foreground">
													{user.email}
												</p>
											</div>
											<div className="text-right">
												<p className="text-sm font-medium">{user.role}</p>
												<p className="text-xs text-muted-foreground">
													{new Date(user.createdAt).toLocaleDateString()}
												</p>
											</div>
										</div>
									)) || (
										<p className="text-muted-foreground">No recent users</p>
									)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Recent Vehicles</CardTitle>
								<CardDescription>Latest vehicle listings</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{stats?.recentVehicles?.map((vehicle) => (
										<div
											key={vehicle.id}
											className="flex items-center justify-between p-2 border rounded"
										>
											<div>
												<p className="font-medium">
													{vehicle.make?.name} {vehicle.model}
												</p>
												<p className="text-sm text-muted-foreground">
													by {vehicle.seller.name}
												</p>
											</div>
											<div className="text-right">
												<p className="text-xs text-muted-foreground">
													{new Date(vehicle.createdAt).toLocaleDateString()}
												</p>
											</div>
										</div>
									)) || (
										<p className="text-muted-foreground">No recent vehicles</p>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
