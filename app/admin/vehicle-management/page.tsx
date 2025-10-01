"use client";

import { Car, Fuel, Settings, Wrench } from "lucide-react";
import { FuelTypesTable } from "@/components/admin/fuel-types-table";
import { MakesTable } from "@/components/admin/makes-table";
import { ModelsTable } from "@/components/admin/models-table";
import { VehicleTypesTable } from "@/components/admin/vehicle-types-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VehicleManagementPage() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Vehicle Management</h1>
				<p className="text-muted-foreground">
					Manage vehicle types, makes, models, and fuel types
				</p>
			</div>

			<Tabs defaultValue="types" className="space-y-6">
				<TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
					<TabsTrigger
						value="types"
						className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
					>
						<Car className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
						<span className="truncate">Types</span>
						<span className="hidden md:inline">Vehicle Types</span>
					</TabsTrigger>
					<TabsTrigger
						value="makes"
						className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
					>
						<Settings className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
						<span className="truncate">Makes</span>
					</TabsTrigger>
					<TabsTrigger
						value="models"
						className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
					>
						<Wrench className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
						<span className="truncate">Models</span>
					</TabsTrigger>
					<TabsTrigger
						value="fuel-types"
						className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
					>
						<Fuel className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
						<span className="truncate">Fuel</span>
						<span className="hidden md:inline">Types</span>
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
	);
}
