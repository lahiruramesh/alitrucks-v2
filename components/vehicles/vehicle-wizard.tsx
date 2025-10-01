"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
	CreateVehicleData,
	FuelType,
	VehicleMake,
	VehicleType,
} from "@/types/vehicle";
import { PhotoUploadWizard } from "./photo-upload-wizard";

interface VehicleWizardProps {
	currentStep: number;
	totalSteps: number;
	formData: CreateVehicleData;
	vehicleMakes: VehicleMake[];
	vehicleTypes: VehicleType[];
	fuelTypes: FuelType[];
	onNext: () => void;
	onPrev: () => void;
	onStepClick: (step: number) => void;
	updateFormData: (field: keyof CreateVehicleData, value: unknown) => void;
	restrictedFields?: string[];
	canEdit?: boolean;
}

const WIZARD_STEPS = [
	{ id: "basic", title: "Basic Info", description: "Vehicle details" },
	{ id: "registration", title: "Registration", description: "Legal & status" },
	{ id: "dimensions", title: "Dimensions", description: "Size & weight" },
	{ id: "features", title: "Features", description: "Equipment" },
	{ id: "condition", title: "Condition", description: "State & location" },
	{ id: "photos", title: "Photos", description: "Vehicle images" },
];

export function VehicleWizard({
	currentStep,
	totalSteps,
	formData,
	vehicleMakes,
	vehicleTypes,
	fuelTypes,
	onNext,
	onPrev,
	onStepClick,
	updateFormData,
	restrictedFields = [],
	canEdit = true,
}: VehicleWizardProps) {
	const progress = ((currentStep + 1) / totalSteps) * 100;
	const _step = WIZARD_STEPS[currentStep];
	const isFieldRestricted = (fieldName: string) =>
		restrictedFields.includes(fieldName);
	const isEditable = (fieldName: string) =>
		canEdit && !isFieldRestricted(fieldName);

	const renderStepIndicators = () => (
		<div className="mb-6">
			{/* Progress Bar */}
			<div className="mb-4">
				<div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
					<span>
						Step {currentStep + 1} of {totalSteps}
					</span>
					<span>{Math.round(progress)}% Complete</span>
				</div>
				<Progress value={progress} className="h-2" />
			</div>

			{/* Step Indicators */}
			<div className="hidden md:flex items-center justify-between">
				{WIZARD_STEPS.map((wizardStep, index) => (
					<button
						key={wizardStep.id}
						type="button"
						onClick={() => onStepClick(index)}
						className={`flex flex-col items-center space-y-2 p-2 rounded-lg transition-colors ${
							index === currentStep
								? "bg-primary text-primary-foreground"
								: index < currentStep
									? "bg-muted text-foreground hover:bg-muted/80"
									: "text-muted-foreground hover:bg-muted/50"
						}`}
					>
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
								index === currentStep
									? "bg-primary-foreground text-primary"
									: index < currentStep
										? "bg-primary text-primary-foreground"
										: "bg-muted border-2 border-muted-foreground/20"
							}`}
						>
							{index + 1}
						</div>
						<div className="text-center">
							<div className="text-xs font-medium">{wizardStep.title}</div>
							<div className="text-xs opacity-70">{wizardStep.description}</div>
						</div>
					</button>
				))}
			</div>

			{/* Mobile Step Indicator */}
			<div className="md:hidden flex items-center justify-center space-x-1">
				{WIZARD_STEPS.map((step, index) => (
					<button
						key={`mobile-step-${step.title}-${index}`}
						type="button"
						onClick={() => onStepClick(index)}
						className={`w-3 h-3 rounded-full transition-colors ${
							index === currentStep
								? "bg-primary"
								: index < currentStep
									? "bg-primary/60"
									: "bg-muted-foreground/20"
						}`}
					/>
				))}
			</div>
		</div>
	);

	const renderBasicStep = () => (
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
							disabled={!isEditable("makeId")}
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
						<Label htmlFor="modelName">Model</Label>
						<Input
							id="modelName"
							value={formData.modelName}
							onChange={(e) => updateFormData("modelName", e.target.value)}
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
									<SelectItem key={fuelType.id} value={fuelType.id.toString()}>
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
							onValueChange={(value) => updateFormData("listingType", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="RENT">For Rent</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="vinNumber">VIN/Chassis Number</Label>
						<Input
							id="vinNumber"
							value={formData.vinNumber}
							onChange={(e) => updateFormData("vinNumber", e.target.value)}
							placeholder="e.g., YV2RT40D9KA841004"
						/>
					</div>
				</div>

				<div>
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						value={formData.description}
						onChange={(e) => updateFormData("description", e.target.value)}
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
	);

	const renderRegistrationStep = () => (
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
						onCheckedChange={(checked) => updateFormData("isImported", checked)}
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
									e.target.value ? parseInt(e.target.value, 10) : undefined,
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
							onChange={(e) => updateFormData("enginePower", e.target.value)}
							placeholder="e.g., 375 kW / 509 hp"
						/>
					</div>

					<div>
						<Label htmlFor="emissionClass">Emission Class</Label>
						<Input
							id="emissionClass"
							value={formData.emissionClass}
							onChange={(e) => updateFormData("emissionClass", e.target.value)}
							placeholder="e.g., 6"
						/>
					</div>

					<div>
						<Label htmlFor="transmission">Transmission</Label>
						<Input
							id="transmission"
							value={formData.transmission}
							onChange={(e) => updateFormData("transmission", e.target.value)}
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
								updateFormData("numberOfSeats", parseInt(e.target.value, 10))
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
								updateFormData("numberOfKeys", parseInt(e.target.value, 10))
							}
							min="1"
						/>
					</div>

					<div>
						<Label htmlFor="vehicleStatus">Vehicle Status</Label>
						<Input
							id="vehicleStatus"
							value={formData.vehicleStatus}
							onChange={(e) => updateFormData("vehicleStatus", e.target.value)}
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
	);

	const renderDimensionsStep = () => (
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
									e.target.value ? parseInt(e.target.value, 10) : undefined,
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
									e.target.value ? parseInt(e.target.value, 10) : undefined,
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
									e.target.value ? parseInt(e.target.value, 10) : undefined,
								)
							}
							placeholder="e.g., 14890"
						/>
					</div>

					<div>
						<Label htmlFor="allowedLoadWeight">Allowed Load Weight (kg)</Label>
						<Input
							id="allowedLoadWeight"
							type="number"
							value={formData.allowedLoadWeight || ""}
							onChange={(e) =>
								updateFormData(
									"allowedLoadWeight",
									e.target.value ? parseInt(e.target.value, 10) : undefined,
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
									e.target.value ? parseInt(e.target.value, 10) : undefined,
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
									e.target.value ? parseInt(e.target.value, 10) : undefined,
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
									e.target.value ? parseInt(e.target.value, 10) : undefined,
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
									e.target.value ? parseInt(e.target.value, 10) : undefined,
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
						onChange={(e) => updateFormData("axleDistance", e.target.value)}
						placeholder="e.g., 4900 / 1370 / 0"
					/>
				</div>
			</CardContent>
		</Card>
	);

	const renderFeaturesStep = () => (
		<Card>
			<CardHeader>
				<CardTitle>Features & Equipment</CardTitle>
				<CardDescription>
					Select the features and equipment available in your vehicle
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
						<div key={feature.key} className="flex items-center space-x-2">
							<Checkbox
								id={feature.key}
								checked={
									formData[feature.key as keyof CreateVehicleData] as boolean
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
	);

	const renderConditionStep = () => (
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
						onChange={(e) => updateFormData("knownRemarks", e.target.value)}
						placeholder="List any known issues, dents, missing parts, etc..."
						rows={3}
					/>
				</div>

				<div>
					<Label htmlFor="serviceHistory">Service History</Label>
					<Textarea
						id="serviceHistory"
						value={formData.serviceHistory}
						onChange={(e) => updateFormData("serviceHistory", e.target.value)}
						placeholder="Describe the service history and maintenance records..."
						rows={3}
					/>
				</div>

				<div>
					<Label htmlFor="startDriveStatus">Start/Drive Status</Label>
					<Input
						id="startDriveStatus"
						value={formData.startDriveStatus}
						onChange={(e) => updateFormData("startDriveStatus", e.target.value)}
						placeholder="e.g., Starts and drives forward/backward"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label htmlFor="carbonFootprint">Carbon Footprint (kg CO₂e)</Label>
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
							onChange={(e) => updateFormData("videoTourUrl", e.target.value)}
							placeholder="https://..."
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	const renderPhotosStep = () => (
		<PhotoUploadWizard
			images={formData.images || []}
			onImagesChange={(images: string[]) => updateFormData("images", images)}
		/>
	);

	const renderStepContent = () => {
		switch (currentStep) {
			case 0:
				return renderBasicStep();
			case 1:
				return renderRegistrationStep();
			case 2:
				return renderDimensionsStep();
			case 3:
				return renderFeaturesStep();
			case 4:
				return renderConditionStep();
			case 5:
				return renderPhotosStep();
			default:
				return renderBasicStep();
		}
	};

	const renderNavigationButtons = () => (
		<div className="flex flex-row gap-3 mt-6">
			<Button
				type="button"
				variant="outline"
				onClick={onPrev}
				disabled={currentStep === 0}
				className="flex-1"
			>
				<ChevronLeft className="h-4 w-4 mr-2" />
				Previous
			</Button>

			<Button
				type="button"
				onClick={onNext}
				disabled={currentStep === totalSteps - 1}
				className="flex-1"
			>
				Next
				<ChevronRight className="h-4 w-4 ml-2" />
			</Button>
		</div>
	);

	return (
		<div className="space-y-6">
			{renderStepIndicators()}
			{renderStepContent()}
			{renderNavigationButtons()}
		</div>
	);
}
