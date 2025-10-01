"use client";

import { ArrowLeft, Calendar } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
import { VehicleAvailabilityManager } from "@/components/vehicles/vehicle-availability-manager";
import type { Vehicle } from "@/types/vehicle";

export default function VehicleAvailabilityPage() {
	const router = useRouter();
	const params = useParams();
	const vehicleId = params.id as string;

	const [vehicle, setVehicle] = useState<Vehicle | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchVehicle = useCallback(async () => {
		try {
			const response = await fetch(`/api/vehicles/${vehicleId}`);
			if (response.ok) {
				const data = await response.json();
				setVehicle(data);
			}
		} catch (error) {
			console.error("Error fetching vehicle:", error);
		} finally {
			setLoading(false);
		}
	}, [vehicleId]);

	useEffect(() => {
		if (vehicleId) {
			fetchVehicle();
		}
	}, [vehicleId, fetchVehicle]);

	if (loading) {
		return (
			<ProtectedRoute allowedRoles={["SELLER"]}>
				<DashboardLayout>
					<div>Loading...</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	if (!vehicle) {
		return (
			<ProtectedRoute allowedRoles={["SELLER"]}>
				<DashboardLayout>
					<div>Vehicle not found</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	const canSetAvailability = ["APPROVED", "PUBLISHED"].includes(vehicle.status);

	if (!canSetAvailability) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="outline" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<div>
						<h1 className="text-2xl font-bold">Vehicle Availability</h1>
						<p className="text-muted-foreground">
							{vehicle.make?.name} {vehicle.modelName}
						</p>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Availability Not Available</CardTitle>
						<CardDescription>
							This vehicle must be approved before you can set availability
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-center py-8">
							<Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-muted-foreground mb-4">
								Current status:{" "}
								<Badge variant="secondary">{vehicle.status}</Badge>
							</p>
							<p className="text-sm text-muted-foreground">
								{vehicle.status === "DRAFT" &&
									"Submit your vehicle for approval first"}
								{vehicle.status === "PENDING" &&
									"Your vehicle is being reviewed by our team"}
								{vehicle.status === "REJECTED" &&
									"Please address the feedback and resubmit"}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="outline" onClick={() => router.back()}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
				<div>
					<h1 className="text-2xl font-bold">Vehicle Availability</h1>
					<p className="text-muted-foreground">
						{vehicle.make?.name} {vehicle.modelName} • {vehicle.year}
					</p>
				</div>
				<Badge variant="default">{vehicle.status}</Badge>
			</div>

			<VehicleAvailabilityManager
				vehicleId={vehicleId}
				pricePerDay={Number(vehicle.pricePerDay)}
				onSave={() => {
					// Optionally refresh vehicle data or show success message
				}}
			/>
		</div>
	);
}
