"use client";

import { Car, Fuel, Settings, Wrench } from "lucide-react";
import { FuelTypesTable } from "@/components/admin/fuel-types-table";
import { MakesTable } from "@/components/admin/makes-table";
import { ModelsTable } from "@/components/admin/models-table";
import { VehicleTypesTable } from "@/components/admin/vehicle-types-table";
import DashboardLayout from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VehicleManagementPage() {
	return (
		<ProtectedRoute allowedRoles={["ADMIN"]}>
			<DashboardLayout>
				<div className="flex flex-1 flex-col gap-4 p-4">
					<div className="mb-6">
						<h1 className="text-3xl font-bold">Vehicle Management</h1>
						<p className="text-muted-foreground">
							Manage vehicle types, makes, models, and fuel types
						</p>
					</div>

					<Tabs defaultValue="types" className="space-y-6">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="types" className="flex items-center gap-2">
								<Car className="h-4 w-4" />
								Vehicle Types
							</TabsTrigger>
							<TabsTrigger value="makes" className="flex items-center gap-2">
								<Settings className="h-4 w-4" />
								Makes
							</TabsTrigger>
							<TabsTrigger value="models" className="flex items-center gap-2">
								<Wrench className="h-4 w-4" />
								Models
							</TabsTrigger>
							<TabsTrigger
								value="fuel-types"
								className="flex items-center gap-2"
							>
								<Fuel className="h-4 w-4" />
								Fuel Types
							</TabsTrigger>
						</TabsList>

						<TabsContent value="types">
							<Card>
								<CardHeader>
									<CardTitle>Vehicle Types</CardTitle>
								</CardHeader>
								<CardContent>
									<VehicleTypesTable />
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="makes">
							<Card>
								<CardHeader>
									<CardTitle>Vehicle Makes</CardTitle>
								</CardHeader>
								<CardContent>
									<MakesTable />
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="models">
							<Card>
								<CardHeader>
									<CardTitle>Vehicle Models</CardTitle>
								</CardHeader>
								<CardContent>
									<ModelsTable />
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="fuel-types">
							<Card>
								<CardHeader>
									<CardTitle>Fuel Types</CardTitle>
								</CardHeader>
								<CardContent>
									<FuelTypesTable />
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
