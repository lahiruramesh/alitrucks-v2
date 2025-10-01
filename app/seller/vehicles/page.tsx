"use client";

import {
	AlertCircle,
	CheckCircle,
	Clock,
	Plus,
	Truck,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import {
	type Action,
	type Column,
	DataTable,
} from "@/components/ui/data-table";
import { useAuth } from "@/contexts/auth-context";
import type { Vehicle, VehicleStatus } from "@/types/vehicle";

interface VehicleWithApproval extends Omit<Vehicle, "currentApproval"> {
	currentApproval?: {
		status: string;
		comments?: string;
		reviewedAt?: Date;
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

export default function SellerVehiclesPage() {
	const _t = useTranslations();
	const { user } = useAuth();
	const router = useRouter();
	const [vehicles, setVehicles] = useState<VehicleWithApproval[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [statusFilter, setStatusFilter] = useState<VehicleStatus | "ALL">(
		"ALL",
	);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	});

	const fetchVehicles = useCallback(async () => {
		if (!user?.id) return;

		setIsLoading(true);
		try {
			const response = await fetch(
				`/api/vehicles?sellerId=${user.id}&page=${pagination.page}&limit=${pagination.limit}`,
			);
			const data = await response.json();

			setVehicles(data.vehicles || []);
			// Only update pagination if it's different to avoid infinite loops
			if (
				data.pagination &&
				(data.pagination.total !== pagination.total ||
					data.pagination.pages !== pagination.pages)
			) {
				setPagination((prev) => ({
					...prev,
					total: data.pagination.total,
					pages: data.pagination.pages,
				}));
			}
		} catch (error) {
			console.error("Error fetching vehicles:", error);
		} finally {
			setIsLoading(false);
		}
	}, [
		user?.id,
		pagination.page,
		pagination.limit,
		pagination.total,
		pagination.pages,
	]);

	useEffect(() => {
		if (user?.id) {
			fetchVehicles();
		}
	}, [user?.id, fetchVehicles]);

	const deleteVehicle = async (id: string) => {
		if (!confirm("Are you sure you want to delete this vehicle?")) return;

		try {
			const response = await fetch(`/api/vehicles/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				fetchVehicles();
			}
		} catch (error) {
			console.error("Error deleting vehicle:", error);
		}
	};

	const submitForApproval = async (id: string) => {
		if (!confirm("Submit this vehicle for approval?")) return;

		try {
			const response = await fetch(`/api/vehicles/${id}/submit`, {
				method: "POST",
			});

			if (response.ok) {
				fetchVehicles();
			}
		} catch (error) {
			console.error("Error submitting vehicle:", error);
		}
	};

	const filteredVehicles = vehicles.filter(
		(vehicle) => statusFilter === "ALL" || vehicle.status === statusFilter,
	);

	const statusCounts = {
		draft: vehicles.filter((v) => v.status === "DRAFT").length,
		pending: vehicles.filter((v) => v.status === "PENDING").length,
		approved: vehicles.filter((v) => v.status === "APPROVED").length,
		rejected: vehicles.filter((v) => v.status === "REJECTED").length,
		published: vehicles.filter((v) => v.status === "PUBLISHED").length,
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("sv-SE", {
			style: "currency",
			currency: "SEK",
		}).format(price);
	};

	const vehicleColumns: Column<VehicleWithApproval>[] = [
		{
			key: "vehicle",
			header: "Vehicle",
			sortable: false,
			render: (_value, vehicle) => (
				<div className="space-y-1">
					<div className="font-medium text-sm md:text-base">
						{vehicle.year} {vehicle.make?.name || ""} {vehicle.modelName || ""}
					</div>
					<div className="text-xs md:text-sm text-muted-foreground">
						{vehicle.type?.name || ""} • {vehicle.city || ""}
					</div>
					{/* Mobile-only status display */}
					<div className="flex items-center gap-2 md:hidden">
						<Badge
							variant="outline"
							className={`text-white ${statusColors[vehicle.status]}`}
						>
							{statusIcons[vehicle.status]}
							<span className="ml-1">{vehicle.status}</span>
						</Badge>
					</div>
					{/* Mobile-only rejection reason */}
					{vehicle.status === "REJECTED" &&
						vehicle.currentApproval?.comments && (
							<div className="text-xs text-red-600 md:hidden">
								Rejection: {vehicle.currentApproval.comments}
							</div>
						)}
				</div>
			),
		},
		{
			key: "details",
			header: "Details",
			sortable: false,
			render: (_value, vehicle) => (
				<div className="space-y-1 text-sm hidden md:block">
					<div>Odometer: {vehicle.odometer?.toLocaleString() || "N/A"} km</div>
					<div>Fuel: {vehicle.fuelType?.name || "N/A"}</div>
					<div>Transmission: {vehicle.transmission || "N/A"}</div>
				</div>
			),
		},
		{
			key: "pricePerDay",
			header: "Price/Day",
			sortable: true,
			render: (value, vehicle) => (
				<div className="text-right">
					<div className="font-medium">
						{value ? formatPrice(value) : "N/A"}
					</div>
					<div className="text-xs text-muted-foreground hidden md:block">
						Listed: {new Date(vehicle.createdAt).toLocaleDateString()}
					</div>
				</div>
			),
		},
		{
			key: "status",
			header: "Status",
			sortable: true,
			render: (_value, vehicle) => (
				<div className="space-y-2 hidden md:block">
					<Badge
						variant="outline"
						className={`text-white ${statusColors[vehicle.status]}`}
					>
						{statusIcons[vehicle.status]}
						<span className="ml-1">{vehicle.status}</span>
					</Badge>
					{vehicle.status === "REJECTED" &&
						vehicle.currentApproval?.comments && (
							<div className="text-xs text-red-600 max-w-40 truncate">
								{vehicle.currentApproval.comments}
							</div>
						)}
				</div>
			),
		},
	];

	const vehicleActions: Action<VehicleWithApproval>[] = [
		{
			label: "View Details",
			onClick: (vehicle) => {
				window.open(`/seller/vehicles/${vehicle.id}`, "_blank");
			},
		},
		{
			label: "Edit Vehicle",
			onClick: (vehicle) => {
				window.open(`/seller/vehicles/${vehicle.id}/edit`, "_blank");
			},
		},
		{
			label: "Submit for Approval",
			onClick: (vehicle) => submitForApproval(vehicle.id),
		},
		{
			label: "Set Availability",
			onClick: (vehicle) => {
				router.push(`/seller/vehicles/${vehicle.id}/availability`);
			},
		},
		{
			label: "View Rejection Reason",
			onClick: (vehicle) => {
				alert(
					`Rejection Reason: ${vehicle.currentApproval?.comments || "No reason provided"}`,
				);
			},
		},
		{
			label: "Delete Vehicle",
			onClick: (vehicle) => deleteVehicle(vehicle.id),
			variant: "destructive",
		},
	];

	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			{/* Header with Create Button */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
				<div>
					<h1 className="text-2xl font-bold text-foreground">My Vehicles</h1>
					<p className="text-muted-foreground text-sm">
						Manage your vehicle listings and approval status
					</p>
				</div>
				<Link href="/seller/vehicles/new">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Vehicle
					</Button>
				</Link>
			</div>

			{/* Status Overview Cards */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
				<Card className="p-4">
					<div className="flex items-center space-x-2">
						<AlertCircle className="h-5 w-5 text-gray-500" />
						<div>
							<p className="text-sm font-medium">Draft</p>
							<p className="text-2xl font-bold">{statusCounts.draft}</p>
						</div>
					</div>
				</Card>
				<Card className="p-4">
					<div className="flex items-center space-x-2">
						<Clock className="h-5 w-5 text-yellow-500" />
						<div>
							<p className="text-sm font-medium">Pending</p>
							<p className="text-2xl font-bold">{statusCounts.pending}</p>
						</div>
					</div>
				</Card>
				<Card className="p-4">
					<div className="flex items-center space-x-2">
						<CheckCircle className="h-5 w-5 text-green-500" />
						<div>
							<p className="text-sm font-medium">Approved</p>
							<p className="text-2xl font-bold">{statusCounts.approved}</p>
						</div>
					</div>
				</Card>
				<Card className="p-4">
					<div className="flex items-center space-x-2">
						<XCircle className="h-5 w-5 text-red-500" />
						<div>
							<p className="text-sm font-medium">Rejected</p>
							<p className="text-2xl font-bold">{statusCounts.rejected}</p>
						</div>
					</div>
				</Card>
				<Card className="p-4">
					<div className="flex items-center space-x-2">
						<CheckCircle className="h-5 w-5 text-blue-500" />
						<div>
							<p className="text-sm font-medium">Published</p>
							<p className="text-2xl font-bold">{statusCounts.published}</p>
						</div>
					</div>
				</Card>
			</div>

			{/* Status Filter Tabs */}
			<div className="flex flex-wrap gap-2 mb-4">
				{(
					[
						"ALL",
						"DRAFT",
						"PENDING",
						"APPROVED",
						"REJECTED",
						"PUBLISHED",
					] as const
				).map((status) => (
					<Button
						key={status}
						variant={statusFilter === status ? "default" : "outline"}
						size="sm"
						onClick={() => setStatusFilter(status)}
						className="text-xs"
					>
						{status === "ALL" ? "All" : status}
						{status !== "ALL" && (
							<Badge variant="secondary" className="ml-2">
								{vehicles.filter((v) => v.status === status).length}
							</Badge>
						)}
					</Button>
				))}
			</div>

			{/* Vehicle List */}
			{isLoading ? (
				<div className="flex justify-center items-center h-64">
					<div className="text-muted-foreground">Loading vehicles...</div>
				</div>
			) : vehicles.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center h-64">
						<Truck className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium mb-2">No vehicles yet</h3>
						<p className="text-muted-foreground mb-4">
							Start by adding your first vehicle
						</p>
						<Link href="/seller/vehicles/new">
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Vehicle
							</Button>
						</Link>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Truck className="h-5 w-5" />
							Vehicles ({filteredVehicles.length})
						</CardTitle>
						<CardDescription>
							Track the status of your vehicle listings and manage approvals
						</CardDescription>
					</CardHeader>
					<CardContent>
						<DataTable
							data={filteredVehicles}
							columns={vehicleColumns}
							actions={vehicleActions}
							searchPlaceholder="Search vehicles by make, model, or location..."
							emptyMessage="No vehicles found"
							isLoading={isLoading}
							pagination={{
								...pagination,
								onPageChange: (page) => {
									setPagination((prev) => ({ ...prev, page }));
								},
							}}
						/>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
