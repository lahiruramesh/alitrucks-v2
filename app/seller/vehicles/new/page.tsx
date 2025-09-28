"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

export default function NewVehiclePage() {
	return (
		<ProtectedRoute allowedRoles={["SELLER"]}>
			<DashboardLayout>
				<div className="flex flex-1 flex-col gap-4 p-4">
					<VehicleForm />
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
