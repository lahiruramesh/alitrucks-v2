"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type {
	CreateVehicleData,
	FuelType,
	Vehicle,
	VehicleMake,
	VehicleType,
} from "@/types/vehicle";

interface VehicleFormProps {
	vehicle?: Vehicle;
	isEditing?: boolean;
}

export function VehicleForm({ vehicle, isEditing = false }: VehicleFormProps) {
	const _t = useTranslations();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [vehicleMakes, setVehicleMakes] = useState<VehicleMake[]>([]);
	const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
	const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);

	const [formData, setFormData] = useState<CreateVehicleData>({
		makeId: vehicle?.makeId || undefined,
		typeId: vehicle?.typeId || undefined,
		fuelTypeId: vehicle?.fuelTypeId || undefined,
		model: vehicle?.model || "",
		year: vehicle?.year || new Date().getFullYear(),
		vinNumber: vehicle?.vinNumber || "",
		pricePerDay: vehicle?.pricePerDay || 0,
		description: vehicle?.description || "",
		listingType: vehicle?.listingType || "RENT",

		// Registration & Status
		isRegistered: vehicle?.isRegistered || false,
		odometer: vehicle?.odometer || undefined,
		enginePower: vehicle?.enginePower || "",
		emissionClass: vehicle?.emissionClass || "",
		transmission: vehicle?.transmission || "",
		towbarType: vehicle?.towbarType || "",
		numberOfSeats: vehicle?.numberOfSeats || 1,
		numberOfKeys: vehicle?.numberOfKeys || 1,
		vehicleStatus: vehicle?.vehicleStatus || "",
		isImported: vehicle?.isImported || false,
		category: vehicle?.category || "",

		// Dimensions & Weights
		kerbWeight: vehicle?.kerbWeight || undefined,
		grossVehicleWeight: vehicle?.grossVehicleWeight || undefined,
		maxLoadWeight: vehicle?.maxLoadWeight || undefined,
		allowedLoadWeight: vehicle?.allowedLoadWeight || undefined,
		maxTrailerWeight: vehicle?.maxTrailerWeight || undefined,
		maxCombinedWeight: vehicle?.maxCombinedWeight || undefined,
		length: vehicle?.length || undefined,
		width: vehicle?.width || undefined,
		height: vehicle?.height || undefined,
		cargoCompartmentLength: vehicle?.cargoCompartmentLength || undefined,
		axleDistance: vehicle?.axleDistance || "",

		// Features & Equipment
		hasAC: vehicle?.hasAC || false,
		hasACC: vehicle?.hasACC || false,
		hasCentralLock: vehicle?.hasCentralLock || false,
		hasElectricWindows: vehicle?.hasElectricWindows || false,
		hasABS: vehicle?.hasABS || false,
		hasDigitalTachograph: vehicle?.hasDigitalTachograph || false,
		hasTailLift: vehicle?.hasTailLift || false,
		hasDieselHeater: vehicle?.hasDieselHeater || false,
		hasSunroof: vehicle?.hasSunroof || false,
		hasRefrigerator: vehicle?.hasRefrigerator || false,
		hasCoffeeMachine: vehicle?.hasCoffeeMachine || false,
		hasExtraLights: vehicle?.hasExtraLights || false,
		hasTruxWildbar: vehicle?.hasTruxWildbar || false,
		hasCompartmentHeater: vehicle?.hasCompartmentHeater || false,

		// Condition & Location
		usageInfo: vehicle?.usageInfo || "",
		knownRemarks: vehicle?.knownRemarks || "",
		serviceHistory: vehicle?.serviceHistory || "",
		startDriveStatus: vehicle?.startDriveStatus || "",
		city: vehicle?.city || "",
		region: vehicle?.region || "",

		// Environmental
		carbonFootprint: vehicle?.carbonFootprint || undefined,

		// Media
		images: vehicle?.images || [],
		videoTourUrl: vehicle?.videoTourUrl || "",

		// Other
		auctionId: vehicle?.auctionId || "",
		reservationPrice: vehicle?.reservationPrice || undefined,
		vatStatus: vehicle?.vatStatus || "",
	});

	const fetchDropdownData = useCallback(async () => {
		try {
			const [makesRes, typesRes, fuelTypesRes] = await Promise.all([
				fetch("/api/vehicle-makes"),
				fetch("/api/vehicle-types"),
				fetch("/api/fuel-types"),
			]);

			const [makes, types, fuelTypes] = await Promise.all([
				makesRes.json(),
				typesRes.json(),
				fuelTypesRes.json(),
			]);

			setVehicleMakes(makes);
			setVehicleTypes(types);
			setFuelTypes(fuelTypes);
		} catch (error) {
			console.error("Error fetching dropdown data:", error);
		}
	}, []);

	useEffect(() => {
		fetchDropdownData();
	}, [fetchDropdownData]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const url = isEditing ? `/api/vehicles/${vehicle?.id}` : "/api/vehicles";
			const method = isEditing ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				router.push("/seller/vehicles");
			} else {
				console.error("Error saving vehicle");
			}
		} catch (error) {
			console.error("Error saving vehicle:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const updateFormData = (field: keyof CreateVehicleData, value: unknown) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button type="button" variant="outline" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<div>
						<h1 className="text-2xl font-bold">
							{isEditing ? "Edit Vehicle" : "Add New Vehicle"}
						</h1>
						<p className="text-muted-foreground">
							{isEditing
								? "Update vehicle information"
								: "Add a new vehicle to your fleet"}
						</p>
					</div>
				</div>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? (
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
					) : (
						<Save className="h-4 w-4 mr-2" />
					)}
					{isEditing ? "Update Vehicle" : "Save Vehicle"}
				</Button>
			</div>

			<Tabs defaultValue="basic" className="w-full">
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="basic">Basic Info</TabsTrigger>
					<TabsTrigger value="registration">Registration</TabsTrigger>
					<TabsTrigger value="dimensions">Dimensions</TabsTrigger>
					<TabsTrigger value="features">Features</TabsTrigger>
					<TabsTrigger value="condition">Condition</TabsTrigger>
				</TabsList>

				<TabsContent value="basic">
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
							<CardDescription>
								Enter the basic details of your vehicle
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="make">Vehicle Make</Label>
									<Select
										value={formData.makeId?.toString()}
										onValueChange={(value) =>
											updateFormData("makeId", parseInt(value, 10))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select make" />
										</SelectTrigger>
										<SelectContent>
											{vehicleMakes.map((make) => (
												<SelectItem key={make.id} value={make.id.toString()}>
													{make.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="model">Model</Label>
									<Input
										id="model"
										value={formData.model}
										onChange={(e) => updateFormData("model", e.target.value)}
										placeholder="e.g., FH 64R"
									/>
								</div>

								<div>
									<Label htmlFor="type">Vehicle Type</Label>
									<Select
										value={formData.typeId?.toString()}
										onValueChange={(value) =>
											updateFormData("typeId", parseInt(value, 10))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											{vehicleTypes.map((type) => (
												<SelectItem key={type.id} value={type.id.toString()}>
													{type.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="year">Year</Label>
									<Input
										id="year"
										type="number"
										value={formData.year}
										onChange={(e) =>
											updateFormData("year", parseInt(e.target.value, 10))
										}
										min="1990"
										max={new Date().getFullYear() + 1}
									/>
								</div>

								<div>
									<Label htmlFor="fuelType">Fuel Type</Label>
									<Select
										value={formData.fuelTypeId?.toString()}
										onValueChange={(value) =>
											updateFormData("fuelTypeId", parseInt(value, 10))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select fuel type" />
										</SelectTrigger>
										<SelectContent>
											{fuelTypes.map((fuelType) => (
												<SelectItem
													key={fuelType.id}
													value={fuelType.id.toString()}
												>
													{fuelType.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="pricePerDay">Price per Day (SEK)</Label>
									<Input
										id="pricePerDay"
										type="number"
										step="0.01"
										value={formData.pricePerDay}
										onChange={(e) =>
											updateFormData("pricePerDay", parseFloat(e.target.value))
										}
										required
									/>
								</div>

								<div>
									<Label htmlFor="listingType">Listing Type</Label>
									<Select
										value={formData.listingType}
										onValueChange={(value) =>
											updateFormData("listingType", value)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="RENT">For Rent</SelectItem>
											<SelectItem value="SELL">For Sale</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="vinNumber">VIN/Chassis Number</Label>
									<Input
										id="vinNumber"
										value={formData.vinNumber}
										onChange={(e) =>
											updateFormData("vinNumber", e.target.value)
										}
										placeholder="e.g., YV2RT40D9KA841004"
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) =>
										updateFormData("description", e.target.value)
									}
									placeholder="Describe your vehicle..."
									rows={4}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="city">City</Label>
									<Input
										id="city"
										value={formData.city}
										onChange={(e) => updateFormData("city", e.target.value)}
										placeholder="e.g., Stockholm"
									/>
								</div>

								<div>
									<Label htmlFor="region">Region</Label>
									<Input
										id="region"
										value={formData.region}
										onChange={(e) => updateFormData("region", e.target.value)}
										placeholder="e.g., Stockholm County"
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="registration">
					<Card>
						<CardHeader>
							<CardTitle>Registration & Status</CardTitle>
							<CardDescription>
								Vehicle registration and status information
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="isRegistered"
									checked={formData.isRegistered}
									onCheckedChange={(checked) =>
										updateFormData("isRegistered", checked)
									}
								/>
								<Label htmlFor="isRegistered">
									Registered with Transport Authority
								</Label>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="isImported"
									checked={formData.isImported}
									onCheckedChange={(checked) =>
										updateFormData("isImported", checked)
									}
								/>
								<Label htmlFor="isImported">Imported Vehicle</Label>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="odometer">Odometer (km)</Label>
									<Input
										id="odometer"
										type="number"
										value={formData.odometer || ""}
										onChange={(e) =>
											updateFormData(
												"odometer",
												e.target.value
													? parseInt(e.target.value, 10)
													: undefined,
											)
										}
										placeholder="e.g., 610543"
									/>
								</div>

								<div>
									<Label htmlFor="enginePower">Engine Power</Label>
									<Input
										id="enginePower"
										value={formData.enginePower}
										onChange={(e) =>
											updateFormData("enginePower", e.target.value)
										}
										placeholder="e.g., 375 kW / 509 hp"
									/>
								</div>

								<div>
									<Label htmlFor="emissionClass">Emission Class</Label>
									<Input
										id="emissionClass"
										value={formData.emissionClass}
										onChange={(e) =>
											updateFormData("emissionClass", e.target.value)
										}
										placeholder="e.g., 6"
									/>
								</div>

								<div>
									<Label htmlFor="transmission">Transmission</Label>
									<Input
										id="transmission"
										value={formData.transmission}
										onChange={(e) =>
											updateFormData("transmission", e.target.value)
										}
										placeholder="e.g., Automat"
									/>
								</div>

								<div>
									<Label htmlFor="numberOfSeats">Number of Seats</Label>
									<Input
										id="numberOfSeats"
										type="number"
										value={formData.numberOfSeats}
										onChange={(e) =>
											updateFormData(
												"numberOfSeats",
												parseInt(e.target.value, 10),
											)
										}
										min="1"
									/>
								</div>

								<div>
									<Label htmlFor="numberOfKeys">Number of Keys</Label>
									<Input
										id="numberOfKeys"
										type="number"
										value={formData.numberOfKeys}
										onChange={(e) =>
											updateFormData(
												"numberOfKeys",
												parseInt(e.target.value, 10),
											)
										}
										min="1"
									/>
								</div>

								<div>
									<Label htmlFor="vehicleStatus">Vehicle Status</Label>
									<Input
										id="vehicleStatus"
										value={formData.vehicleStatus}
										onChange={(e) =>
											updateFormData("vehicleStatus", e.target.value)
										}
										placeholder="e.g., Avställd"
									/>
								</div>

								<div>
									<Label htmlFor="category">Category</Label>
									<Input
										id="category"
										value={formData.category}
										onChange={(e) => updateFormData("category", e.target.value)}
										placeholder="e.g., N3"
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="dimensions">
					<Card>
						<CardHeader>
							<CardTitle>Dimensions & Weights</CardTitle>
							<CardDescription>
								Vehicle dimensions and weight specifications
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="kerbWeight">Kerb Weight (kg)</Label>
									<Input
										id="kerbWeight"
										type="number"
										value={formData.kerbWeight || ""}
										onChange={(e) =>
											updateFormData(
												"kerbWeight",
												e.target.value
													? parseInt(e.target.value, 10)
													: undefined,
											)
										}
										placeholder="e.g., 14110"
									/>
								</div>

								<div>
									<Label htmlFor="grossVehicleWeight">
										Gross Vehicle Weight (kg)
									</Label>
									<Input
										id="grossVehicleWeight"
										type="number"
										value={formData.grossVehicleWeight || ""}
										onChange={(e) =>
											updateFormData(
												"grossVehicleWeight",
												e.target.value
													? parseInt(e.target.value, 10)
													: undefined,
											)
										}
										placeholder="e.g., 29000"
									/>
								</div>

								<div>
									<Label htmlFor="maxLoadWeight">Max Load Weight (kg)</Label>
									<Input
										id="maxLoadWeight"
										type="number"
										value={formData.maxLoadWeight || ""}
										onChange={(e) =>
											updateFormData(
												"maxLoadWeight",
												e.target.value
													? parseInt(e.target.value, 10)
													: undefined,
											)
										}
										placeholder="e.g., 14890"
									/>
								</div>

								<div>
									<Label htmlFor="allowedLoadWeight">
										Allowed Load Weight (kg)
									</Label>
									<Input
										id="allowedLoadWeight"
										type="number"
										value={formData.allowedLoadWeight || ""}
										onChange={(e) =>
											updateFormData(
												"allowedLoadWeight",
												e.target.value
													? parseInt(e.target.value, 10)
													: undefined,
											)
										}
										placeholder="e.g., 13890"
									/>
								</div>

								<div>
									<Label htmlFor="length">Length (mm)</Label>
									<Input
										id="length"
										type="number"
										value={formData.length || ""}
										onChange={(e) =>
											updateFormData(
												"length",
												e.target.value
													? parseInt(e.target.value, 10)
													: undefined,
											)
										}
										placeholder="e.g., 9805"
									/>
								</div>

								<div>
									<Label htmlFor="width">Width (mm)</Label>
									<Input
										id="width"
										type="number"
										value={formData.width || ""}
										onChange={(e) =>
											updateFormData(
												"width",
												e.target.value
													? parseInt(e.target.value, 10)
													: undefined,
											)
										}
										placeholder="e.g., 2600"
									/>
								</div>

								<div>
									<Label htmlFor="height">Height (mm)</Label>
									<Input
										id="height"
										type="number"
										value={formData.height || ""}
										onChange={(e) =>
											updateFormData(
												"height",
												e.target.value
													? parseInt(e.target.value, 10)
													: undefined,
											)
										}
										placeholder="e.g., 4480"
									/>
								</div>

								<div>
									<Label htmlFor="cargoCompartmentLength">
										Cargo Compartment Length (mm)
									</Label>
									<Input
										id="cargoCompartmentLength"
										type="number"
										value={formData.cargoCompartmentLength || ""}
										onChange={(e) =>
											updateFormData(
												"cargoCompartmentLength",
												e.target.value
													? parseInt(e.target.value, 10)
													: undefined,
											)
										}
										placeholder="e.g., 7300"
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="axleDistance">Axle Distance</Label>
								<Input
									id="axleDistance"
									value={formData.axleDistance}
									onChange={(e) =>
										updateFormData("axleDistance", e.target.value)
									}
									placeholder="e.g., 4900 / 1370 / 0"
								/>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="features">
					<Card>
						<CardHeader>
							<CardTitle>Features & Equipment</CardTitle>
							<CardDescription>
								Select the features and equipment available in your vehicle
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								{[
									{ key: "hasAC", label: "Air Conditioning" },
									{ key: "hasACC", label: "Adaptive Cruise Control" },
									{ key: "hasCentralLock", label: "Central Lock" },
									{ key: "hasElectricWindows", label: "Electric Windows" },
									{ key: "hasABS", label: "ABS" },
									{ key: "hasDigitalTachograph", label: "Digital Tachograph" },
									{ key: "hasTailLift", label: "Tail Lift" },
									{ key: "hasDieselHeater", label: "Diesel Heater" },
									{ key: "hasSunroof", label: "Sunroof" },
									{ key: "hasRefrigerator", label: "Refrigerator" },
									{ key: "hasCoffeeMachine", label: "Coffee Machine" },
									{ key: "hasExtraLights", label: "Extra Lights" },
									{ key: "hasTruxWildbar", label: "Trux Wildbar" },
									{ key: "hasCompartmentHeater", label: "Compartment Heater" },
								].map((feature) => (
									<div
										key={feature.key}
										className="flex items-center space-x-2"
									>
										<Checkbox
											id={feature.key}
											checked={
												formData[
													feature.key as keyof CreateVehicleData
												] as boolean
											}
											onCheckedChange={(checked) =>
												updateFormData(
													feature.key as keyof CreateVehicleData,
													checked,
												)
											}
										/>
										<Label htmlFor={feature.key}>{feature.label}</Label>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="condition">
					<Card>
						<CardHeader>
							<CardTitle>Condition & Additional Info</CardTitle>
							<CardDescription>
								Provide information about the vehicle's condition and usage
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="usageInfo">Usage Information</Label>
								<Textarea
									id="usageInfo"
									value={formData.usageInfo}
									onChange={(e) => updateFormData("usageInfo", e.target.value)}
									placeholder="Describe the operational status and recent usage..."
									rows={3}
								/>
							</div>

							<div>
								<Label htmlFor="knownRemarks">Known Remarks & Faults</Label>
								<Textarea
									id="knownRemarks"
									value={formData.knownRemarks}
									onChange={(e) =>
										updateFormData("knownRemarks", e.target.value)
									}
									placeholder="List any known issues, dents, missing parts, etc..."
									rows={3}
								/>
							</div>

							<div>
								<Label htmlFor="serviceHistory">Service History</Label>
								<Textarea
									id="serviceHistory"
									value={formData.serviceHistory}
									onChange={(e) =>
										updateFormData("serviceHistory", e.target.value)
									}
									placeholder="Describe the service history and maintenance records..."
									rows={3}
								/>
							</div>

							<div>
								<Label htmlFor="startDriveStatus">Start/Drive Status</Label>
								<Input
									id="startDriveStatus"
									value={formData.startDriveStatus}
									onChange={(e) =>
										updateFormData("startDriveStatus", e.target.value)
									}
									placeholder="e.g., Starts and drives forward/backward"
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="carbonFootprint">
										Carbon Footprint (kg CO₂e)
									</Label>
									<Input
										id="carbonFootprint"
										type="number"
										step="0.01"
										value={formData.carbonFootprint || ""}
										onChange={(e) =>
											updateFormData(
												"carbonFootprint",
												e.target.value ? parseFloat(e.target.value) : undefined,
											)
										}
										placeholder="e.g., 97359"
									/>
								</div>

								<div>
									<Label htmlFor="videoTourUrl">Video Tour URL</Label>
									<Input
										id="videoTourUrl"
										type="url"
										value={formData.videoTourUrl}
										onChange={(e) =>
											updateFormData("videoTourUrl", e.target.value)
										}
										placeholder="https://..."
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</form>
	);
}
