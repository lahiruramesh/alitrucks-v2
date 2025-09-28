"use client";

import {
	ArrowLeft,
	Calendar,
	Edit,
	Fuel,
	Gauge,
	MapPin,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import type { Vehicle } from "@/types/vehicle";

export default function VehicleDetailPage() {
	const params = useParams();
	const router = useRouter();
	const [vehicle, setVehicle] = useState<Vehicle | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchVehicle = async () => {
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
	};

	useEffect(() => {
		if (params.id) {
			fetchVehicle();
		}
	}, [params.id]);

	const deleteVehicle = async () => {
		if (!confirm("Are you sure you want to delete this vehicle?")) return;

		try {
			const response = await fetch(`/api/vehicles/${params.id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				router.push("/seller/vehicles");
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
						<p className="text-muted-foreground mb-4">
							The vehicle you're looking for doesn't exist.
						</p>
						<Link href="/seller/vehicles">
							<Button>Back to Vehicles</Button>
						</Link>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute allowedRoles={["SELLER"]}>
			<DashboardLayout>
				<div className="flex flex-1 flex-col gap-4 p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Button variant="outline" onClick={() => router.back()}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Button>
							<div>
								<h1 className="text-2xl font-bold">
									{vehicle.make?.name} {vehicle.model}
								</h1>
								<p className="text-muted-foreground">
									{vehicle.year} • {vehicle.type?.name}
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							<Link href={`/seller/vehicles/${vehicle.id}/edit`}>
								<Button variant="outline">
									<Edit className="h-4 w-4 mr-2" />
									Edit
								</Button>
							</Link>
							<Button variant="destructive" onClick={deleteVehicle}>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Main Info */}
						<div className="lg:col-span-2 space-y-6">
							<Card>
								<CardHeader>
									<div className="flex justify-between items-start">
										<div>
											<CardTitle>Vehicle Information</CardTitle>
											<CardDescription>Basic vehicle details</CardDescription>
										</div>
										<Badge
											variant={
												vehicle.listingType === "RENT" ? "default" : "secondary"
											}
										>
											{vehicle.listingType}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm">Year: {vehicle.year}</span>
										</div>
										<div className="flex items-center gap-2">
											<Fuel className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm">
												Fuel: {vehicle.fuelType?.name}
											</span>
										</div>
										{vehicle.odometer && (
											<div className="flex items-center gap-2">
												<Gauge className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm">
													Odometer: {vehicle.odometer.toLocaleString()} km
												</span>
											</div>
										)}
										{vehicle.city && (
											<div className="flex items-center gap-2">
												<MapPin className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm">
													Location: {vehicle.city}
												</span>
											</div>
										)}
									</div>

									{vehicle.vinNumber && (
										<>
											<Separator />
											<div>
												<span className="text-sm font-medium">VIN Number:</span>
												<span className="text-sm ml-2">
													{vehicle.vinNumber}
												</span>
											</div>
										</>
									)}

									{vehicle.description && (
										<>
											<Separator />
											<div>
												<span className="text-sm font-medium">
													Description:
												</span>
												<p className="text-sm mt-1 text-muted-foreground">
													{vehicle.description}
												</p>
											</div>
										</>
									)}
								</CardContent>
							</Card>

							{/* Technical Specifications */}
							{(vehicle.enginePower ||
								vehicle.transmission ||
								vehicle.emissionClass) && (
								<Card>
									<CardHeader>
										<CardTitle>Technical Specifications</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{vehicle.enginePower && (
												<div>
													<span className="text-sm font-medium">
														Engine Power:
													</span>
													<span className="text-sm ml-2">
														{vehicle.enginePower}
													</span>
												</div>
											)}
											{vehicle.transmission && (
												<div>
													<span className="text-sm font-medium">
														Transmission:
													</span>
													<span className="text-sm ml-2">
														{vehicle.transmission}
													</span>
												</div>
											)}
											{vehicle.emissionClass && (
												<div>
													<span className="text-sm font-medium">
														Emission Class:
													</span>
													<span className="text-sm ml-2">
														{vehicle.emissionClass}
													</span>
												</div>
											)}
											{vehicle.numberOfSeats && (
												<div>
													<span className="text-sm font-medium">Seats:</span>
													<span className="text-sm ml-2">
														{vehicle.numberOfSeats}
													</span>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Features */}
							<Card>
								<CardHeader>
									<CardTitle>Features & Equipment</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
										{[
											{ key: "hasAC", label: "Air Conditioning" },
											{ key: "hasACC", label: "Adaptive Cruise Control" },
											{ key: "hasCentralLock", label: "Central Lock" },
											{ key: "hasElectricWindows", label: "Electric Windows" },
											{ key: "hasABS", label: "ABS" },
											{
												key: "hasDigitalTachograph",
												label: "Digital Tachograph",
											},
											{ key: "hasTailLift", label: "Tail Lift" },
											{ key: "hasDieselHeater", label: "Diesel Heater" },
											{ key: "hasSunroof", label: "Sunroof" },
											{ key: "hasRefrigerator", label: "Refrigerator" },
											{ key: "hasCoffeeMachine", label: "Coffee Machine" },
											{ key: "hasExtraLights", label: "Extra Lights" },
										]
											.filter(
												(feature) => vehicle[feature.key as keyof Vehicle],
											)
											.map((feature) => (
												<Badge
													key={feature.key}
													variant="outline"
													className="text-xs"
												>
													{feature.label}
												</Badge>
											))}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Pricing</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-primary">
										{formatPrice(vehicle.pricePerDay)}
									</div>
									<p className="text-sm text-muted-foreground">per day</p>
								</CardContent>
							</Card>

							{/* Dimensions & Weights */}
							{(vehicle.length ||
								vehicle.width ||
								vehicle.height ||
								vehicle.kerbWeight) && (
								<Card>
									<CardHeader>
										<CardTitle>Dimensions & Weight</CardTitle>
									</CardHeader>
									<CardContent className="space-y-2">
										{vehicle.length && (
											<div className="flex justify-between">
												<span className="text-sm">Length:</span>
												<span className="text-sm">{vehicle.length} mm</span>
											</div>
										)}
										{vehicle.width && (
											<div className="flex justify-between">
												<span className="text-sm">Width:</span>
												<span className="text-sm">{vehicle.width} mm</span>
											</div>
										)}
										{vehicle.height && (
											<div className="flex justify-between">
												<span className="text-sm">Height:</span>
												<span className="text-sm">{vehicle.height} mm</span>
											</div>
										)}
										{vehicle.kerbWeight && (
											<div className="flex justify-between">
												<span className="text-sm">Kerb Weight:</span>
												<span className="text-sm">{vehicle.kerbWeight} kg</span>
											</div>
										)}
									</CardContent>
								</Card>
							)}

							{/* Environmental */}
							{vehicle.carbonFootprint && (
								<Card>
									<CardHeader>
										<CardTitle>Environmental Impact</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-lg font-semibold text-green-600">
											{vehicle.carbonFootprint.toLocaleString()} kg CO₂e
										</div>
										<p className="text-sm text-muted-foreground">
											Carbon footprint
										</p>
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
