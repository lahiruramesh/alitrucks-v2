"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import type { Vehicle } from "@/types/vehicle";

export default function EditVehiclePage() {
	const params = useParams();
	const [vehicle, setVehicle] = useState<Vehicle | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchVehicle = useCallback(async () => {
		try {
			const response = await fetch(`/api/vehicles/${params.id}`);
			if (response.ok) {
				const data = await response.json();
				setVehicle(data);
			}
		} catch (error) {
			console.error("Error fetching vehicle:", error);
		} finally {
			setIsLoading(false);
		}
	}, [params.id]);

	useEffect(() => {
		if (params.id) {
			fetchVehicle();
		}
	}, [params.id, fetchVehicle]);

	if (isLoading) {
		return (
			<ProtectedRoute allowedRoles={["SELLER"]}>
				<DashboardLayout>
					<div className="flex justify-center items-center h-64">
						<div className="text-muted-foreground">Loading vehicle...</div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	if (!vehicle) {
		return (
			<ProtectedRoute allowedRoles={["SELLER"]}>
				<DashboardLayout>
					<div className="flex flex-col items-center justify-center h-64">
						<h2 className="text-xl font-semibold mb-2">Vehicle not found</h2>
						<p className="text-muted-foreground">
							The vehicle you're trying to edit doesn't exist.
						</p>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			<VehicleForm vehicle={vehicle} isEditing={true} />
		</div>
	);
}
