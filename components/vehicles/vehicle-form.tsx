"use client";

import { AlertCircle, ArrowLeft, Loader2, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
	CreateVehicleData,
	FuelType,
	Vehicle,
	VehicleMake,
	VehicleStatus,
	VehicleStatusInfo,
	VehicleType,
} from "@/types/vehicle";
import { VehicleWizard } from "./vehicle-wizard";

interface VehicleFormProps {
	vehicle?: Vehicle;
	isEditing?: boolean;
}

const WIZARD_STEPS = [
	{ id: "basic", title: "Basic Info", description: "Vehicle details" },
	{ id: "registration", title: "Registration", description: "Legal & status" },
	{ id: "dimensions", title: "Dimensions", description: "Size & weight" },
	{ id: "features", title: "Features", description: "Equipment" },
	{ id: "condition", title: "Condition", description: "State & location" },
	{ id: "photos", title: "Photos", description: "Vehicle images" },
];

export function VehicleForm({ vehicle, isEditing = false }: VehicleFormProps) {
	const _t = useTranslations();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [vehicleMakes, setVehicleMakes] = useState<VehicleMake[]>([]);
	const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
	const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);

	// Status management
	const getVehicleStatusInfo = (status: VehicleStatus): VehicleStatusInfo => {
		switch (status) {
			case "DRAFT":
				return {
					status,
					canEdit: true,
					canSubmit: true,
					canPublish: false,
					canSetAvailability: false,
					restrictedFields: [],
					statusMessage:
						"Draft - You can edit all fields and submit for approval when ready.",
				};
			case "PENDING":
				return {
					status,
					canEdit: false,
					canSubmit: false,
					canPublish: false,
					canSetAvailability: false,
					restrictedFields: [],
					statusMessage:
						"Pending approval - Your vehicle is being reviewed by our team.",
				};
			case "APPROVED":
				return {
					status,
					canEdit: true,
					canSubmit: false,
					canPublish: true,
					canSetAvailability: true,
					restrictedFields: [
						"makeId",
						"typeId",
						"fuelTypeId",
						"modelName",
						"year",
						"vinNumber",
						"images",
					],
					statusMessage:
						"Approved - You can set availability and publish your vehicle. Some fields are now locked.",
				};
			case "REJECTED":
				return {
					status,
					canEdit: true,
					canSubmit: true,
					canPublish: false,
					canSetAvailability: false,
					restrictedFields: [],
					statusMessage:
						"Rejected - Please review the feedback, make necessary changes, and resubmit.",
				};
			case "PUBLISHED":
				return {
					status,
					canEdit: true,
					canSubmit: false,
					canPublish: false,
					canSetAvailability: true,
					restrictedFields: [
						"makeId",
						"typeId",
						"fuelTypeId",
						"modelName",
						"year",
						"vinNumber",
						"images",
					],
					statusMessage:
						"Published - Your vehicle is live and available for booking. Limited editing allowed.",
				};
			case "SUSPENDED":
				return {
					status,
					canEdit: true,
					canSubmit: false,
					canPublish: false,
					canSetAvailability: false,
					restrictedFields: [
						"makeId",
						"typeId",
						"fuelTypeId",
						"modelName",
						"year",
						"vinNumber",
						"images",
					],
					statusMessage: "Suspended - Contact support for assistance.",
				};
			case "ARCHIVED":
				return {
					status,
					canEdit: false,
					canSubmit: false,
					canPublish: false,
					canSetAvailability: false,
					restrictedFields: [],
					statusMessage: "Archived - This vehicle listing is no longer active.",
				};
			default:
				return {
					status: "DRAFT",
					canEdit: true,
					canSubmit: true,
					canPublish: false,
					canSetAvailability: false,
					restrictedFields: [],
					statusMessage:
						"Draft - You can edit all fields and submit for approval when ready.",
				};
		}
	};

	const statusInfo = getVehicleStatusInfo(vehicle?.status || "DRAFT");

	const [formData, setFormData] = useState<CreateVehicleData>({
		makeId: vehicle?.makeId || undefined,
		typeId: vehicle?.typeId || undefined,
		fuelTypeId: vehicle?.fuelTypeId || undefined,
		modelName: vehicle?.modelName || "",
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

	const handleSubmitForApproval = async () => {
		if (!vehicle?.id) return;

		setIsSubmitting(true);
		try {
			const response = await fetch(`/api/vehicles/${vehicle.id}/submit`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			if (response.ok) {
				router.push("/seller/vehicles");
			} else {
				console.error("Error submitting for approval");
			}
		} catch (error) {
			console.error("Error submitting for approval:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const updateFormData = (field: keyof CreateVehicleData, value: unknown) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const nextStep = () => {
		if (currentStep < WIZARD_STEPS.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const goToStep = (step: number) => {
		setCurrentStep(step);
	};

	const _progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

	return (
		<form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
			<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
				<div className="flex items-center gap-4">
					<Button type="button" variant="outline" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-xl md:text-2xl font-bold">
								{isEditing ? "Edit Vehicle" : "Add New Vehicle"}
							</h1>
							{vehicle && (
								<Badge
									variant={
										statusInfo.status === "APPROVED"
											? "default"
											: statusInfo.status === "PENDING"
												? "secondary"
												: statusInfo.status === "REJECTED"
													? "destructive"
													: statusInfo.status === "PUBLISHED"
														? "default"
														: "secondary"
									}
								>
									{statusInfo.status}
								</Badge>
							)}
						</div>
						<p className="text-sm md:text-base text-muted-foreground">
							{isEditing
								? statusInfo.statusMessage
								: "Add a new vehicle to your fleet"}
						</p>
					</div>
				</div>

				{/* Action buttons - hidden on mobile, shown on desktop */}
				<div className="hidden md:flex gap-2">
					{statusInfo.canEdit && (
						<Button type="submit" disabled={isLoading} variant="outline">
							{isLoading ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<Save className="h-4 w-4 mr-2" />
							)}
							{isEditing ? "Update Vehicle" : "Save Draft"}
						</Button>
					)}

					{statusInfo.canSubmit && vehicle && (
						<Button
							type="button"
							onClick={handleSubmitForApproval}
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<Send className="h-4 w-4 mr-2" />
							)}
							Submit for Approval
						</Button>
					)}
				</div>
			</div>

			{/* Status Alert */}
			{vehicle && statusInfo.status !== "DRAFT" && (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						{statusInfo.statusMessage}
						{statusInfo.restrictedFields.length > 0 && (
							<div className="mt-2">
								<strong>Restricted fields:</strong>{" "}
								{statusInfo.restrictedFields.join(", ")}
							</div>
						)}
					</AlertDescription>
				</Alert>
			)}

			<VehicleWizard
				currentStep={currentStep}
				totalSteps={WIZARD_STEPS.length}
				formData={formData}
				vehicleMakes={vehicleMakes}
				vehicleTypes={vehicleTypes}
				fuelTypes={fuelTypes}
				onNext={nextStep}
				onPrev={prevStep}
				onStepClick={goToStep}
				updateFormData={updateFormData}
				restrictedFields={statusInfo.restrictedFields}
				canEdit={statusInfo.canEdit}
			/>

			{/* Mobile action buttons */}
			<div className="md:hidden space-y-2 pt-4">
				{statusInfo.canEdit && (
					<Button
						type="submit"
						disabled={isLoading}
						className="w-full"
						variant="outline"
					>
						{isLoading ? (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						) : (
							<Save className="h-4 w-4 mr-2" />
						)}
						{isEditing ? "Update Vehicle" : "Save Draft"}
					</Button>
				)}

				{statusInfo.canSubmit && vehicle && (
					<Button
						type="button"
						onClick={handleSubmitForApproval}
						disabled={isSubmitting}
						className="w-full"
					>
						{isSubmitting ? (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						) : (
							<Send className="h-4 w-4 mr-2" />
						)}
						Submit for Approval
					</Button>
				)}
			</div>
		</form>
	);
}
