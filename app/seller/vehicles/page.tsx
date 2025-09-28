"use client";

import { Plus, Truck } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	type Action,
	type Column,
	DataTable,
} from "@/components/ui/data-table";
import { useAuth } from "@/contexts/auth-context";
import type { Vehicle } from "@/types/vehicle";

export default function SellerVehiclesPage() {
	const _t = useTranslations();
	const { user } = useAuth();
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	});

	const fetchVehicles = async () => {
		if (!user?.id) return;

		setIsLoading(true);
		try {
			const response = await fetch(
				`/api/vehicles?sellerId=${user.id}&page=${pagination.page}&limit=${pagination.limit}`,
			);
			const data = await response.json();

			setVehicles(data.vehicles || []);
			setPagination(data.pagination || pagination);
		} catch (error) {
			console.error("Error fetching vehicles:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (user?.id) {
			fetchVehicles();
		}
	}, [user?.id]);

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

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("sv-SE", {
			style: "currency",
			currency: "SEK",
		}).format(price);
	};

	const vehicleColumns: Column<Vehicle>[] = [
		{
			key: "make.name",
			header: "Make",
			sortable: true,
			searchable: true,
			render: (value, row) => `${value || ""} ${row.model || ""}`.trim(),
		},
		{
			key: "year",
			header: "Year",
			sortable: true,
		},
		{
			key: "type.name",
			header: "Type",
			render: (value) => value || "-",
		},
		{
			key: "listingType",
			header: "Listing",
			render: (value) => (
				<Badge variant={value === "RENT" ? "default" : "secondary"}>
					{value}
				</Badge>
			),
		},
		{
			key: "pricePerDay",
			header: "Price/Day",
			sortable: true,
			render: (value) => formatPrice(value),
		},
		{
			key: "city",
			header: "Location",
			searchable: true,
			render: (value) => value || "-",
		},
		{
			key: "odometer",
			header: "Odometer",
			render: (value) => (value ? `${value.toLocaleString()} km` : "-"),
		},
		{
			key: "isActive",
			header: "Status",
			render: (value) => (
				<Badge variant={value ? "default" : "secondary"}>
					{value ? "Active" : "Inactive"}
				</Badge>
			),
		},
	];

	const vehicleActions: Action<Vehicle>[] = [
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
			label: "Delete Vehicle",
			onClick: (vehicle) => deleteVehicle(vehicle.id),
			variant: "destructive",
		},
	];

	return (
		<ProtectedRoute allowedRoles={["SELLER"]}>
			<DashboardLayout>
				<div className="flex flex-1 flex-col gap-4 p-4">
					<div className="flex justify-between items-center mb-4">
						<div>
							<h1 className="text-2xl font-bold text-foreground">
								My Vehicles
							</h1>
							<p className="text-muted-foreground">
								Manage your vehicle listings
							</p>
						</div>
						<Link href="/seller/vehicles/new">
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Vehicle
							</Button>
						</Link>
					</div>

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
						<DataTable
							data={vehicles}
							columns={vehicleColumns}
							actions={vehicleActions}
							searchPlaceholder="Search vehicles by make, model, or location..."
							emptyMessage="No vehicles found"
							isLoading={isLoading}
							pagination={{
								...pagination,
								onPageChange: (page) =>
									setPagination((prev) => ({ ...prev, page })),
							}}
						/>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
