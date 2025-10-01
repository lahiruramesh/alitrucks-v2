"use client";

import { AlertCircle, CheckCircle, Clock, Eye, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { DataTable } from "@/components/ui/data-table";
import type { VehicleStatus } from "@/types/vehicle";

interface VehicleWithDetails {
	id: string;
	modelName?: string;
	year?: number;
	status: VehicleStatus;
	submittedAt?: Date;
	pricePerDay: number;
	seller: {
		id: string;
		name: string;
		email: string;
	};
	make?: {
		name: string;
	};
	type?: {
		name: string;
	};
	currentApproval?: {
		status: string;
		comments?: string;
		createdAt: Date;
	};
}

const statusColors: Record<VehicleStatus, string> = {
	DRAFT: "bg-gray-500",
	PENDING: "bg-yellow-500",
	APPROVED: "bg-green-500",
	REJECTED: "bg-red-500",
	PUBLISHED: "bg-blue-500",
	SUSPENDED: "bg-orange-500",
	ARCHIVED: "bg-gray-400",
};

const statusIcons: Record<VehicleStatus, React.ReactNode> = {
	DRAFT: <AlertCircle className="h-4 w-4" />,
	PENDING: <Clock className="h-4 w-4" />,
	APPROVED: <CheckCircle className="h-4 w-4" />,
	REJECTED: <XCircle className="h-4 w-4" />,
	PUBLISHED: <CheckCircle className="h-4 w-4" />,
	SUSPENDED: <AlertCircle className="h-4 w-4" />,
	ARCHIVED: <AlertCircle className="h-4 w-4" />,
};

export default function AdminVehiclesPage() {
	const router = useRouter();
	const [vehicles, setVehicles] = useState<VehicleWithDetails[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<VehicleStatus | "ALL">(
		"PENDING",
	);

	const fetchVehicles = useCallback(async () => {
		try {
			console.log("Fetching vehicles from admin API...");
			const response = await fetch("/api/admin/vehicles");
			console.log("Response status:", response.status);
			if (response.ok) {
				const data = await response.json();
				console.log("Vehicles data:", data);
				setVehicles(data);
			} else {
				console.error(
					"Failed to fetch vehicles:",
					response.status,
					response.statusText,
				);
				const errorData = await response.text();
				console.error("Error details:", errorData);
			}
		} catch (error) {
			console.error("Error fetching vehicles:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchVehicles();
	}, [fetchVehicles]);

	const filteredVehicles = vehicles.filter(
		(vehicle) => statusFilter === "ALL" || vehicle.status === statusFilter,
	);

	const pendingCount = vehicles.filter((v) => v.status === "PENDING").length;
	const approvedCount = vehicles.filter((v) => v.status === "APPROVED").length;
	const rejectedCount = vehicles.filter((v) => v.status === "REJECTED").length;
	const publishedCount = vehicles.filter(
		(v) => v.status === "PUBLISHED",
	).length;

	const columns = [
		{
			key: "modelName",
			header: "Vehicle",
			render: (_: any, vehicle: VehicleWithDetails) => (
				<div>
					<div className="font-medium">
						{vehicle.make?.name} {vehicle.modelName}
					</div>
					<div className="text-sm text-muted-foreground">
						{vehicle.year} • {vehicle.type?.name}
					</div>
				</div>
			),
		},
		{
			key: "seller",
			header: "Seller",
			render: (_: any, vehicle: VehicleWithDetails) => (
				<div>
					<div className="font-medium">{vehicle.seller.name}</div>
					<div className="text-sm text-muted-foreground">
						{vehicle.seller.email}
					</div>
				</div>
			),
		},
		{
			key: "status",
			header: "Status",
			render: (_: any, vehicle: VehicleWithDetails) => (
				<Badge className={`${statusColors[vehicle.status]} text-white`}>
					<span className="mr-2">{statusIcons[vehicle.status]}</span>
					{vehicle.status}
				</Badge>
			),
		},
		{
			key: "submittedAt",
			header: "Submitted",
			render: (_: any, vehicle: VehicleWithDetails) => {
				return vehicle.submittedAt
					? new Date(vehicle.submittedAt).toLocaleDateString()
					: "—";
			},
		},
		{
			key: "pricePerDay",
			header: "Price/Day",
			render: (_: any, vehicle: VehicleWithDetails) =>
				`${vehicle.pricePerDay} SEK`,
		},
	];

	const actions = [
		{
			label: "Review",
			onClick: (vehicle: VehicleWithDetails) =>
				router.push(`/admin/vehicles/${vehicle.id}`),
		},
	];

	if (loading) {
		return (
			<div className="container mx-auto p-4">
				<div className="flex justify-center items-center h-64">
					<div className="text-muted-foreground">Loading vehicles...</div>
				</div>
			</div>
		);
	}

	if (!vehicles || vehicles.length === 0) {
		return (
			<div className="container mx-auto p-4">
				<div className="flex flex-col space-y-4">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold">
							Vehicle Management
						</h1>
						<p className="text-muted-foreground">
							Review and manage vehicle listings
						</p>
					</div>
					<Card>
						<CardContent className="flex flex-col items-center justify-center h-64">
							<Clock className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-medium mb-2">No vehicles found</h3>
							<p className="text-muted-foreground mb-4 text-center">
								No vehicles have been submitted for approval yet.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<div className="flex flex-col space-y-4">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold">Vehicle Management</h1>
					<p className="text-muted-foreground">
						Review and manage vehicle listings
					</p>
				</div>

				{/* Stats Cards - Responsive Grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-xs md:text-sm font-medium">
								Pending Review
							</CardTitle>
							<Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-lg md:text-2xl font-bold">
								{pendingCount}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-xs md:text-sm font-medium">
								Approved
							</CardTitle>
							<CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-lg md:text-2xl font-bold">
								{approvedCount}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-xs md:text-sm font-medium">
								Published
							</CardTitle>
							<CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-lg md:text-2xl font-bold">
								{publishedCount}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-xs md:text-sm font-medium">
								Rejected
							</CardTitle>
							<XCircle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-lg md:text-2xl font-bold">
								{rejectedCount}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Filter Buttons - Responsive Layout */}
				<div className="flex flex-wrap gap-2">
					<Button
						size="sm"
						variant={statusFilter === "ALL" ? "default" : "outline"}
						onClick={() => setStatusFilter("ALL")}
					>
						All ({vehicles.length})
					</Button>
					<Button
						size="sm"
						variant={statusFilter === "PENDING" ? "default" : "outline"}
						onClick={() => setStatusFilter("PENDING")}
					>
						Pending ({pendingCount})
					</Button>
					<Button
						size="sm"
						variant={statusFilter === "APPROVED" ? "default" : "outline"}
						onClick={() => setStatusFilter("APPROVED")}
					>
						Approved ({approvedCount})
					</Button>
					<Button
						size="sm"
						variant={statusFilter === "REJECTED" ? "default" : "outline"}
						onClick={() => setStatusFilter("REJECTED")}
					>
						Rejected ({rejectedCount})
					</Button>
					<Button
						size="sm"
						variant={statusFilter === "PUBLISHED" ? "default" : "outline"}
						onClick={() => setStatusFilter("PUBLISHED")}
					>
						Published ({publishedCount})
					</Button>
				</div>

				{/* Vehicles Table */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg md:text-xl">
							{statusFilter === "ALL"
								? "All Vehicles"
								: `${statusFilter} Vehicles`}
						</CardTitle>
						<CardDescription>
							{filteredVehicles.length} vehicles found
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0 md:p-6">
						<div className="block md:hidden">
							{/* Mobile Card View */}
							<div className="space-y-4 p-4">
								{filteredVehicles.map((vehicle) => (
									<Card key={vehicle.id} className="p-4">
										<div className="space-y-3">
											<div className="flex justify-between items-start">
												<div>
													<div className="font-medium">
														{vehicle.make?.name} {vehicle.modelName}
													</div>
													<div className="text-sm text-muted-foreground">
														{vehicle.year} • {vehicle.type?.name}
													</div>
												</div>
												<Badge
													className={`${statusColors[vehicle.status]} text-white text-xs`}
												>
													<span className="mr-1">
														{statusIcons[vehicle.status]}
													</span>
													{vehicle.status}
												</Badge>
											</div>

											<div className="grid grid-cols-2 gap-2 text-sm">
												<div>
													<span className="text-muted-foreground">Seller:</span>
													<div className="font-medium">
														{vehicle.seller.name}
													</div>
												</div>
												<div>
													<span className="text-muted-foreground">Price:</span>
													<div className="font-medium">
														{vehicle.pricePerDay} SEK/day
													</div>
												</div>
											</div>

											{vehicle.submittedAt && (
												<div className="text-sm">
													<span className="text-muted-foreground">
														Submitted:
													</span>{" "}
													{new Date(vehicle.submittedAt).toLocaleDateString()}
												</div>
											)}

											<Button
												size="sm"
												variant="outline"
												onClick={() =>
													router.push(`/admin/vehicles/${vehicle.id}`)
												}
												className="w-full"
											>
												<Eye className="h-4 w-4 mr-2" />
												Review
											</Button>
										</div>
									</Card>
								))}

								{filteredVehicles.length === 0 && (
									<div className="text-center py-8 text-muted-foreground">
										No vehicles found
									</div>
								)}
							</div>
						</div>

						<div className="hidden md:block">
							{/* Desktop Table View */}
							<DataTable
								columns={columns}
								data={filteredVehicles}
								actions={actions}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
