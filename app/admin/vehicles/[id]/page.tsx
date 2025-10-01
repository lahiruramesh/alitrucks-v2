"use client";

import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	CheckCircle,
	Clock,
	Eye,
	User,
	XCircle,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { ApprovalStatus, Vehicle, VehicleApproval } from "@/types/vehicle";

interface VehicleDetails {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	modelName?: string;
	year?: number;
	status: Vehicle["status"];
	submittedAt?: Date;
	approvedAt?: Date;
	rejectedAt?: Date;
	pricePerDay: number;
	description?: string;
	vinNumber?: string;
	city?: string;
	region?: string;
	images: string[];
	listingType?: string;

	// Registration & Status
	isRegistered?: boolean;
	odometer?: number;
	enginePower?: string;
	emissionClass?: string;
	transmission?: string;
	towbarType?: string;
	numberOfSeats?: number;
	numberOfKeys?: number;
	vehicleStatus?: string;
	isImported?: boolean;
	category?: string;

	// Dimensions & Weights
	kerbWeight?: number;
	grossVehicleWeight?: number;
	maxLoadWeight?: number;
	allowedLoadWeight?: number;
	maxTrailerWeight?: number;
	maxCombinedWeight?: number;
	length?: number;
	width?: number;
	height?: number;
	cargoCompartmentLength?: number;
	axleDistance?: string;

	// Features & Equipment
	hasAC?: boolean;
	hasACC?: boolean;
	hasCentralLock?: boolean;
	hasElectricWindows?: boolean;
	hasABS?: boolean;
	hasDigitalTachograph?: boolean;
	hasTailLift?: boolean;
	hasDieselHeater?: boolean;
	hasSunroof?: boolean;
	hasRefrigerator?: boolean;
	hasCoffeeMachine?: boolean;
	hasExtraLights?: boolean;
	hasTruxWildbar?: boolean;
	hasCompartmentHeater?: boolean;

	// Condition & Location
	usageInfo?: string;
	knownRemarks?: string;
	serviceHistory?: string;
	startDriveStatus?: string;

	// Environmental & Other
	carbonFootprint?: number;
	videoTourUrl?: string;
	auctionId?: string;
	reservationPrice?: number;
	vatStatus?: string;

	// Relations
	seller: {
		id: string;
		name: string;
		email: string;
		phoneNumber?: string;
		companyName?: string;
	};
	make?: { name: string };
	type?: { name: string };
	fuelType?: { name: string };
	approvals: VehicleApproval[];
}

export default function AdminVehicleDetailPage() {
	const router = useRouter();
	const params = useParams();
	const vehicleId = params.id as string;

	const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [showApprovalDialog, setShowApprovalDialog] = useState(false);
	const [approvalAction, setApprovalAction] =
		useState<ApprovalStatus>("APPROVED");
	const [comments, setComments] = useState("");

	const fetchVehicle = useCallback(async () => {
		try {
			console.log("Fetching vehicle details for ID:", vehicleId);
			const response = await fetch(`/api/admin/vehicles/${vehicleId}`);
			console.log("Response status:", response.status);

			if (response.ok) {
				const data = await response.json();
				console.log("Vehicle data:", data);
				setVehicle(data);
			} else {
				console.error(
					"Failed to fetch vehicle:",
					response.status,
					response.statusText,
				);
				const errorData = await response.text();
				console.error("Error details:", errorData);
			}
		} catch (error) {
			console.error("Error fetching vehicle:", error);
		} finally {
			setLoading(false);
		}
	}, [vehicleId]); // Add vehicleId as dependency since it's used inside the function

	useEffect(() => {
		if (vehicleId) {
			fetchVehicle();
		}
	}, [vehicleId, fetchVehicle]);

	const handleApproval = async () => {
		if (!vehicle) return;

		setSubmitting(true);
		try {
			console.log("Submitting approval:", { status: approvalAction, comments });
			const response = await fetch(
				`/api/admin/vehicles/${vehicle.id}/approval`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						status: approvalAction,
						comments: comments.trim() || undefined,
					}),
				},
			);

			console.log("Approval response status:", response.status);

			if (response.ok) {
				const result = await response.json();
				console.log("Approval result:", result);
				await fetchVehicle(); // Refresh data
				setShowApprovalDialog(false);
				setComments("");
			} else {
				console.error(
					"Failed to submit approval:",
					response.status,
					response.statusText,
				);
				const errorData = await response.text();
				console.error("Approval error details:", errorData);
			}
		} catch (error) {
			console.error("Error updating approval:", error);
		} finally {
			setSubmitting(false);
		}
	};

	const openApprovalDialog = (action: ApprovalStatus) => {
		setApprovalAction(action);
		setShowApprovalDialog(true);
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!vehicle) {
		return <div>Vehicle not found</div>;
	}

	const _currentApproval = vehicle.approvals?.[0];
	const canApprove = vehicle.status === "PENDING";

	return (
		<div className="container mx-auto p-4 space-y-4 md:space-y-6">
			{/* Header */}
			<div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:gap-4">
				<Button variant="outline" onClick={() => router.back()}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
				<div className="flex-1">
					<h1 className="text-xl md:text-2xl font-bold">
						{vehicle.make?.name} {vehicle.modelName}
					</h1>
					<p className="text-sm md:text-base text-muted-foreground">
						{vehicle.year} • Vehicle Review
					</p>
				</div>
				<Badge
					className={`
          ${vehicle.status === "PENDING" ? "bg-yellow-500" : ""}
          ${vehicle.status === "APPROVED" ? "bg-green-500" : ""}
          ${vehicle.status === "REJECTED" ? "bg-red-500" : ""}
          text-white
        `}
				>
					{vehicle.status}
				</Badge>
			</div>

			{/* Action Buttons */}
			{canApprove && (
				<div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
					<Button
						onClick={() => openApprovalDialog("APPROVED")}
						className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
					>
						<CheckCircle className="h-4 w-4 mr-2" />
						Approve
					</Button>
					<Button
						onClick={() => openApprovalDialog("REJECTED")}
						variant="destructive"
						className="w-full md:w-auto"
					>
						<XCircle className="h-4 w-4 mr-2" />
						Reject
					</Button>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-4 md:space-y-6">
					{/* Vehicle Photos */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg md:text-xl">
								Vehicle Photos
							</CardTitle>
							<CardDescription>
								{vehicle.images.length} photos uploaded
							</CardDescription>
						</CardHeader>
						<CardContent>
							{vehicle.images.length > 0 ? (
								<div className="space-y-4">
									{/* Main image grid - larger display */}
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
										{vehicle.images.slice(0, 6).map((image, index) => (
											<div
												key={`image-${image.split("/").pop()}-${index}`}
												className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group"
											>
												<Image
													src={image}
													alt={`Vehicle photo ${index + 1}`}
													fill
													className="object-cover transition-transform group-hover:scale-105"
												/>
												<div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
													{index + 1}
												</div>
												{/* Click to view full size */}
												<button
													type="button"
													onClick={() => window.open(image, "_blank")}
													className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors"
												>
													<Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
												</button>
											</div>
										))}
									</div>

									{/* Additional images - thumbnail view */}
									{vehicle.images.length > 6 && (
										<div>
											<h4 className="text-sm font-medium mb-2">
												Additional Photos ({vehicle.images.length - 6})
											</h4>
											<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
												{vehicle.images.slice(6).map((image, index) => (
													<div
														key={`additional-image-${image.split("/").pop()}-${index + 6}`}
														className="relative aspect-square bg-gray-100 rounded overflow-hidden group cursor-pointer"
													>
														<Image
															src={image}
															alt={`Vehicle photo ${index + 7}`}
															fill
															className="object-cover"
															onClick={() => window.open(image, "_blank")}
														/>
														<div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
															<Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
														</div>
													</div>
												))}
											</div>
										</div>
									)}

									{/* Photo instructions for admin */}
									<div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
										💡 <strong>Admin Review:</strong> Check that all photos are
										clear, show the vehicle from multiple angles, and accurately
										represent the vehicle's condition. Look for interior,
										exterior, and any damage documentation.
									</div>
								</div>
							) : (
								<div className="text-center py-8">
									<AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
									<p className="text-muted-foreground">No photos uploaded</p>
									<p className="text-xs text-red-600 mt-1">
										⚠️ Vehicle should have photos before approval
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Vehicle Details */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg md:text-xl">
								Vehicle Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Basic Information */}
							<div>
								<h3 className="text-base font-semibold mb-3">
									Basic Information
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<div className="text-sm font-medium">Make</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.make?.name || "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Model</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.modelName || "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Year</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.year || "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Type</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.type?.name || "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Fuel Type</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.fuelType?.name || "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">VIN Number</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.vinNumber || "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Price per Day</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.pricePerDay} SEK
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Listing Type</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.listingType || "RENT"}
										</p>
									</div>
								</div>
							</div>

							{/* Description */}
							<div>
								<div className="text-sm font-medium">Description</div>
								<p className="text-sm text-muted-foreground mt-1">
									{vehicle.description || "No description provided"}
								</p>
							</div>

							{/* Registration & Status */}
							<div>
								<h3 className="text-base font-semibold mb-3">
									Registration & Status
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<div className="text-sm font-medium">Registered</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.isRegistered ? "Yes" : "No"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Odometer</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.odometer
												? `${vehicle.odometer.toLocaleString()} km`
												: "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Engine Power</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.enginePower || "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Emission Class</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.emissionClass || "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Transmission</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.transmission || "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Towbar Type</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.towbarType || "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Number of Seats</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.numberOfSeats || "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Number of Keys</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.numberOfKeys || "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Vehicle Status</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.vehicleStatus || "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Imported</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.isImported ? "Yes" : "No"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Category</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.category || "—"}
										</p>
									</div>
								</div>
							</div>

							{/* Dimensions & Weights */}
							<div>
								<h3 className="text-base font-semibold mb-3">
									Dimensions & Weights
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<div className="text-sm font-medium">Kerb Weight</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.kerbWeight
												? `${vehicle.kerbWeight.toLocaleString()} kg`
												: "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">
											Gross Vehicle Weight
										</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.grossVehicleWeight
												? `${vehicle.grossVehicleWeight.toLocaleString()} kg`
												: "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Max Load Weight</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.maxLoadWeight
												? `${vehicle.maxLoadWeight.toLocaleString()} kg`
												: "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">
											Allowed Load Weight
										</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.allowedLoadWeight
												? `${vehicle.allowedLoadWeight.toLocaleString()} kg`
												: "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">
											Max Trailer Weight
										</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.maxTrailerWeight
												? `${vehicle.maxTrailerWeight.toLocaleString()} kg`
												: "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">
											Max Combined Weight
										</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.maxCombinedWeight
												? `${vehicle.maxCombinedWeight.toLocaleString()} kg`
												: "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Length</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.length
												? `${vehicle.length.toLocaleString()} mm`
												: "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Width</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.width
												? `${vehicle.width.toLocaleString()} mm`
												: "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Height</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.height
												? `${vehicle.height.toLocaleString()} mm`
												: "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">
											Cargo Compartment Length
										</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.cargoCompartmentLength
												? `${vehicle.cargoCompartmentLength.toLocaleString()} mm`
												: "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Axle Distance</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.axleDistance || "—"}
										</p>
									</div>
								</div>
							</div>

							{/* Features & Equipment */}
							<div>
								<h3 className="text-base font-semibold mb-3">
									Features & Equipment
								</h3>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
										{ key: "hasTruxWildbar", label: "Trux Wildbar" },
										{
											key: "hasCompartmentHeater",
											label: "Compartment Heater",
										},
									].map(({ key, label }) => (
										<div key={key} className="flex items-center space-x-2">
											<div
												className={`w-3 h-3 rounded-full ${vehicle[key as keyof typeof vehicle] ? "bg-green-500" : "bg-gray-300"}`}
											></div>
											<span className="text-sm text-muted-foreground">
												{label}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Condition & Location */}
							<div>
								<h3 className="text-base font-semibold mb-3">
									Condition & Location
								</h3>
								<div className="space-y-4">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div>
											<div className="text-sm font-medium">City</div>
											<p className="text-sm text-muted-foreground">
												{vehicle.city || "—"}
											</p>
										</div>
										<div>
											<div className="text-sm font-medium">Region</div>
											<p className="text-sm text-muted-foreground">
												{vehicle.region || "—"}
											</p>
										</div>
										<div>
											<div className="text-sm font-medium">
												Start/Drive Status
											</div>
											<p className="text-sm text-muted-foreground">
												{vehicle.startDriveStatus || "—"}
											</p>
										</div>
									</div>

									{vehicle.usageInfo && (
										<div>
											<div className="text-sm font-medium">
												Usage Information
											</div>
											<p className="text-sm text-muted-foreground mt-1">
												{vehicle.usageInfo}
											</p>
										</div>
									)}

									{vehicle.knownRemarks && (
										<div>
											<div className="text-sm font-medium">Known Remarks</div>
											<p className="text-sm text-muted-foreground mt-1">
												{vehicle.knownRemarks}
											</p>
										</div>
									)}

									{vehicle.serviceHistory && (
										<div>
											<div className="text-sm font-medium">Service History</div>
											<p className="text-sm text-muted-foreground mt-1">
												{vehicle.serviceHistory}
											</p>
										</div>
									)}
								</div>
							</div>

							{/* Environmental & Other */}
							<div>
								<h3 className="text-base font-semibold mb-3">
									Environmental & Other
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<div className="text-sm font-medium">Carbon Footprint</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.carbonFootprint
												? `${vehicle.carbonFootprint} kg CO₂e`
												: "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Video Tour URL</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.videoTourUrl ? (
												<a
													href={vehicle.videoTourUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:underline"
												>
													View Video Tour
												</a>
											) : (
												"—"
											)}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Auction ID</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.auctionId || "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">Reservation Price</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.reservationPrice
												? `${vehicle.reservationPrice} SEK`
												: "—"}
										</p>
									</div>
									<div>
										<div className="text-sm font-medium">VAT Status</div>
										<p className="text-sm text-muted-foreground">
											{vehicle.vatStatus || "—"}
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-4 md:space-y-6">
					{/* Seller Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base md:text-lg">
								<User className="h-4 w-4" />
								Seller Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<div className="text-sm font-medium">Name</div>
								<p className="text-sm text-muted-foreground">
									{vehicle.seller.name}
								</p>
							</div>
							<div>
								<div className="text-sm font-medium">Email</div>
								<p className="text-sm text-muted-foreground break-all">
									{vehicle.seller.email}
								</p>
							</div>
							{vehicle.seller.phoneNumber && (
								<div>
									<div className="text-sm font-medium">Phone</div>
									<p className="text-sm text-muted-foreground">
										{vehicle.seller.phoneNumber}
									</p>
								</div>
							)}
							{vehicle.seller.companyName && (
								<div>
									<div className="text-sm font-medium">Company</div>
									<p className="text-sm text-muted-foreground">
										{vehicle.seller.companyName}
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Approval History */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base md:text-lg">
								<Clock className="h-4 w-4" />
								Approval History
							</CardTitle>
						</CardHeader>
						<CardContent>
							{vehicle.approvals.length > 0 ? (
								<div className="space-y-3">
									{vehicle.approvals.map((approval) => (
										<div
											key={approval.id}
											className="border-l-2 pl-3 border-muted"
										>
											<div className="flex flex-col space-y-1 md:flex-row md:items-center md:space-y-0 md:gap-2 mb-1">
												<Badge
													variant={
														approval.status === "APPROVED"
															? "default"
															: approval.status === "REJECTED"
																? "destructive"
																: "secondary"
													}
													className="w-fit text-xs"
												>
													{approval.status}
												</Badge>
												<span className="text-xs text-muted-foreground">
													{approval.reviewedAt &&
														new Date(approval.reviewedAt).toLocaleDateString()}
												</span>
											</div>
											{approval.comments && (
												<p className="text-sm text-muted-foreground">
													{approval.comments}
												</p>
											)}
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">
									No approval history
								</p>
							)}
						</CardContent>
					</Card>

					{/* Timeline */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base md:text-lg">
								<Calendar className="h-4 w-4" />
								Timeline
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="border-l-2 pl-3 border-muted">
								<p className="text-sm font-medium">Created</p>
								<p className="text-xs text-muted-foreground">
									{new Date(vehicle.createdAt).toLocaleString()}
								</p>
							</div>
							{vehicle.submittedAt && (
								<div className="border-l-2 pl-3 border-muted">
									<p className="text-sm font-medium">Submitted for Review</p>
									<p className="text-xs text-muted-foreground">
										{new Date(vehicle.submittedAt).toLocaleString()}
									</p>
								</div>
							)}
							{vehicle.approvedAt && (
								<div className="border-l-2 pl-3 border-green-500">
									<p className="text-sm font-medium">Approved</p>
									<p className="text-xs text-muted-foreground">
										{new Date(vehicle.approvedAt).toLocaleString()}
									</p>
								</div>
							)}
							{vehicle.rejectedAt && (
								<div className="border-l-2 pl-3 border-red-500">
									<p className="text-sm font-medium">Rejected</p>
									<p className="text-xs text-muted-foreground">
										{new Date(vehicle.rejectedAt).toLocaleString()}
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Approval Dialog */}
			<Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
				<DialogContent className="mx-4 max-w-lg">
					<DialogHeader>
						<DialogTitle className="text-lg">
							{approvalAction === "APPROVED"
								? "Approve Vehicle"
								: "Reject Vehicle"}
						</DialogTitle>
						<DialogDescription className="text-sm">
							{approvalAction === "APPROVED"
								? "This vehicle will be approved and the seller can proceed to set availability."
								: "This vehicle will be rejected and the seller can make changes and resubmit."}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<div className="text-sm font-medium">
								Comments{" "}
								{approvalAction === "REJECTED" && "(Required for rejection)"}
							</div>
							<Textarea
								value={comments}
								onChange={(e) => setComments(e.target.value)}
								placeholder={
									approvalAction === "APPROVED"
										? "Optional comments for the seller..."
										: "Please explain why this vehicle was rejected..."
								}
								className="mt-2"
								rows={4}
							/>
						</div>
					</div>

					<DialogFooter className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
						<Button
							variant="outline"
							onClick={() => setShowApprovalDialog(false)}
							className="w-full md:w-auto"
						>
							Cancel
						</Button>
						<Button
							onClick={handleApproval}
							disabled={
								submitting ||
								(approvalAction === "REJECTED" && !comments.trim())
							}
							className={`w-full md:w-auto ${approvalAction === "APPROVED" ? "bg-green-600 hover:bg-green-700" : ""}`}
							variant={
								approvalAction === "REJECTED" ? "destructive" : "default"
							}
						>
							{submitting
								? "Processing..."
								: approvalAction === "APPROVED"
									? "Approve Vehicle"
									: "Reject Vehicle"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
