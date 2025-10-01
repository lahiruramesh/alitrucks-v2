"use client";

import { StripeVerificationGuard } from "@/components/stripe/stripe-verification-guard";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

export default function NewVehiclePage() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			<StripeVerificationGuard>
				<VehicleForm />
			</StripeVerificationGuard>
		</div>
	);
}
