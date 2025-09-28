"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SignupFormData } from "@/types/common";

interface CompanyInfoStepProps {
	formData: SignupFormData;
	updateFormData: (data: Partial<SignupFormData>) => void;
	onNext: () => void;
	onPrev: () => void;
}

export function CompanyInfoStep({
	formData,
	updateFormData,
	onNext,
	onPrev,
}: CompanyInfoStepProps) {
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.companyName?.trim()) {
			newErrors.companyName = "Company name is required for fleet accounts";
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
			<div className="mb-4">
				<h3 className="text-lg font-medium">Company Information</h3>
				<p className="text-sm text-muted-foreground">
					Please provide your company details for fleet management
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4">
				<div>
					<Label htmlFor="companyName">Company Name *</Label>
					<Input
						id="companyName"
						type="text"
						value={formData.companyName || ""}
						onChange={(e) => handleInputChange("companyName", e.target.value)}
						placeholder="Enter your company name"
						className={errors.companyName ? "border-red-500" : ""}
					/>
					{errors.companyName && (
						<p className="text-sm text-red-500 mt-1">{errors.companyName}</p>
					)}
				</div>

				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<h4 className="font-medium text-blue-900 mb-2">
						Fleet Account Benefits
					</h4>
					<ul className="text-sm text-blue-800 space-y-1">
						<li>• Manage multiple vehicles from one dashboard</li>
						<li>• Bulk operations and reporting</li>
						<li>• Advanced analytics and insights</li>
						<li>• Priority customer support</li>
						<li>• Custom pricing options</li>
					</ul>
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
