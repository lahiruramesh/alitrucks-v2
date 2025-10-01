import DashboardLayout from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";

export default function SellerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ProtectedRoute allowedRoles={["SELLER"]}>
			<DashboardLayout>{children}</DashboardLayout>
		</ProtectedRoute>
	);
}
