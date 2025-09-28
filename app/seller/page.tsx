"use client";

import { useTranslations } from "next-intl";
import DashboardLayout from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";

export default function SellerPage() {
	const t = useTranslations();

	return (
		<ProtectedRoute allowedRoles={["SELLER"]}>
			<DashboardLayout>
				<div className="flex flex-1 flex-col gap-4 p-4">
					<div className="mb-4">
						<h1 className="text-2xl font-bold text-foreground">
							{t("dashboard.seller.title")}
						</h1>
					</div>
					<div className="grid auto-rows-min gap-4 md:grid-cols-3">
						<div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
							<p className="text-muted-foreground">
								{t("dashboard.seller.myVehicles")}
							</p>
						</div>
						<div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
							<p className="text-muted-foreground">
								{t("dashboard.seller.bookings")}
							</p>
						</div>
						<div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
							<p className="text-muted-foreground">
								{t("dashboard.seller.earnings")}
							</p>
						</div>
					</div>
					<div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min flex items-center justify-center">
						<p className="text-muted-foreground">Seller Dashboard Content</p>
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
