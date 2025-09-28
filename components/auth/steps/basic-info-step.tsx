"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SignupFormData } from "@/types/common";

interface BasicInfoStepProps {
	formData: SignupFormData;
	updateFormData: (data: Partial<SignupFormData>) => void;
	onNext: () => void;
	onPrev: () => void;
}

export function BasicInfoStep({
	formData,
	updateFormData,
	onNext,
	onPrev,
}: BasicInfoStepProps) {
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters long";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
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
					<Label htmlFor="name">Full Name *</Label>
					<Input
						id="name"
						type="text"
						value={formData.name}
						onChange={(e) => handleInputChange("name", e.target.value)}
						placeholder="Enter your full name"
						className={errors.name ? "border-red-500" : ""}
					/>
					{errors.name && (
						<p className="text-sm text-red-500 mt-1">{errors.name}</p>
					)}
				</div>

				<div>
					<Label htmlFor="email">Email Address *</Label>
					<Input
						id="email"
						type="email"
						value={formData.email}
						onChange={(e) => handleInputChange("email", e.target.value)}
						placeholder="Enter your email address"
						className={errors.email ? "border-red-500" : ""}
					/>
					{errors.email && (
						<p className="text-sm text-red-500 mt-1">{errors.email}</p>
					)}
				</div>

				<div>
					<Label htmlFor="password">Password *</Label>
					<Input
						id="password"
						type="password"
						value={formData.password}
						onChange={(e) => handleInputChange("password", e.target.value)}
						placeholder="Create a strong password"
						className={errors.password ? "border-red-500" : ""}
					/>
					{errors.password && (
						<p className="text-sm text-red-500 mt-1">{errors.password}</p>
					)}
					<p className="text-sm text-muted-foreground mt-1">
						Password must be at least 8 characters long
					</p>
				</div>

				<div>
					<Label htmlFor="confirmPassword">Confirm Password *</Label>
					<Input
						id="confirmPassword"
						type="password"
						value={formData.confirmPassword}
						onChange={(e) =>
							handleInputChange("confirmPassword", e.target.value)
						}
						placeholder="Confirm your password"
						className={errors.confirmPassword ? "border-red-500" : ""}
					/>
					{errors.confirmPassword && (
						<p className="text-sm text-red-500 mt-1">
							{errors.confirmPassword}
						</p>
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
