"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { SignupFormData } from "@/types/common";

interface ContactInfoStepProps {
	formData: SignupFormData;
	updateFormData: (data: Partial<SignupFormData>) => void;
	onNext: () => void;
	onPrev: () => void;
}

const COUNTRIES = [
	{ value: "SE", label: "Sweden" },
	{ value: "NO", label: "Norway" },
	{ value: "DK", label: "Denmark" },
	{ value: "FI", label: "Finland" },
	{ value: "DE", label: "Germany" },
	{ value: "US", label: "United States" },
	{ value: "GB", label: "United Kingdom" },
];

export function ContactInfoStep({
	formData,
	updateFormData,
	onNext,
	onPrev,
}: ContactInfoStepProps) {
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.phoneNumber.trim()) {
			newErrors.phoneNumber = "Phone number is required";
		}

		if (!formData.address.trim()) {
			newErrors.address = "Address is required";
		}

		if (!formData.city.trim()) {
			newErrors.city = "City is required";
		}

		if (!formData.country) {
			newErrors.country = "Country is required";
		}

		if (!formData.postalCode.trim()) {
			newErrors.postalCode = "Postal code is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (validateForm()) {
			onNext();
		}
	};

	const handleInputChange = (field: keyof SignupFormData, value: string) => {
		updateFormData({ [field]: value });
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-4">
				<div>
					<Label htmlFor="phoneNumber">Phone Number *</Label>
					<Input
						id="phoneNumber"
						type="tel"
						value={formData.phoneNumber}
						onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
						placeholder="+46 70 123 45 67"
						className={errors.phoneNumber ? "border-red-500" : ""}
					/>
					{errors.phoneNumber && (
						<p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>
					)}
				</div>

				<div>
					<Label htmlFor="address">Street Address *</Label>
					<Input
						id="address"
						type="text"
						value={formData.address}
						onChange={(e) => handleInputChange("address", e.target.value)}
						placeholder="Enter your street address"
						className={errors.address ? "border-red-500" : ""}
					/>
					{errors.address && (
						<p className="text-sm text-red-500 mt-1">{errors.address}</p>
					)}
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label htmlFor="city">City *</Label>
						<Input
							id="city"
							type="text"
							value={formData.city}
							onChange={(e) => handleInputChange("city", e.target.value)}
							placeholder="Enter your city"
							className={errors.city ? "border-red-500" : ""}
						/>
						{errors.city && (
							<p className="text-sm text-red-500 mt-1">{errors.city}</p>
						)}
					</div>

					<div>
						<Label htmlFor="postalCode">Postal Code *</Label>
						<Input
							id="postalCode"
							type="text"
							value={formData.postalCode}
							onChange={(e) => handleInputChange("postalCode", e.target.value)}
							placeholder="12345"
							className={errors.postalCode ? "border-red-500" : ""}
						/>
						{errors.postalCode && (
							<p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>
						)}
					</div>
				</div>

				<div>
					<Label htmlFor="country">Country *</Label>
					<Select
						value={formData.country}
						onValueChange={(value) => handleInputChange("country", value)}
					>
						<SelectTrigger className={errors.country ? "border-red-500" : ""}>
							<SelectValue placeholder="Select your country" />
						</SelectTrigger>
						<SelectContent>
							{COUNTRIES.map((country) => (
								<SelectItem key={country.value} value={country.value}>
									{country.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.country && (
						<p className="text-sm text-red-500 mt-1">{errors.country}</p>
					)}
				</div>
			</div>

			<div className="flex justify-between">
				<Button variant="outline" onClick={onPrev}>
					<ChevronLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
				<Button onClick={handleNext}>
					Continue
					<ChevronRight className="h-4 w-4 ml-2" />
				</Button>
			</div>
		</div>
	);
}
