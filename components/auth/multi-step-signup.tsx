"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SignupFormData } from "@/types/common";
import { BasicInfoStep } from "./steps/basic-info-step";
import { CompanyInfoStep } from "./steps/company-info-step";
import { ContactInfoStep } from "./steps/contact-info-step";
import { ReviewStep } from "./steps/review-step";
import { RoleSelectionStep } from "./steps/role-selection-step";

export function MultiStepSignup() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const t = useTranslations();
	const [currentStep, setCurrentStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);

	// Get query parameters
	const returnUrl = searchParams.get("returnUrl");
	const preferredRole = searchParams.get("role");

	const [formData, setFormData] = useState<SignupFormData>({
		role: (preferredRole as "BUYER" | "SELLER") || "BUYER",
		userType: "INDIVIDUAL",
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		phoneNumber: "",
		address: "",
		city: "",
		country: "",
		postalCode: "",
		companyName: "",
	});

	// Skip role selection if role is already set from query params
	useEffect(() => {
		if (
			preferredRole &&
			(preferredRole === "BUYER" || preferredRole === "SELLER")
		) {
			setCurrentStep(2); // Skip to basic info step
		}
	}, [preferredRole]);

	const getSteps = () => [
		{
			id: 1,
			title: t("signup.steps.roleSelection.title"),
			description: t("signup.steps.roleSelection.description"),
		},
		{
			id: 2,
			title: t("signup.steps.basicInfo.title"),
			description: t("signup.steps.basicInfo.description"),
		},
		{
			id: 3,
			title: t("signup.steps.contactInfo.title"),
			description: t("signup.steps.contactInfo.description"),
		},
		{
			id: 4,
			title: t("signup.steps.companyInfo.title"),
			description: t("signup.steps.companyInfo.description"),
		},
		{
			id: 5,
			title: t("signup.steps.review.title"),
			description: t("signup.steps.review.description"),
		},
	];

	const updateFormData = (data: Partial<SignupFormData>) => {
		setFormData((prev) => ({ ...prev, ...data }));
	};

	const nextStep = () => {
		if (currentStep < getMaxSteps()) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	const getMaxSteps = () => {
		return formData.userType === "FLEET" ? 5 : 4;
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		try {
			// Use our custom signup endpoint that properly handles role assignment
			const response = await fetch("/api/auth/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const result = await response.json();

			if (!response.ok) {
				console.error("Signup error:", result.error);
				toast.error(result.error || "Failed to create account");
				return;
			}

			// Show success message
			toast.success("Account created successfully! Please login to continue.");

			// Redirect to login page with return URL parameter
			const loginUrl = returnUrl
				? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
				: "/login";
			router.push(loginUrl);
		} catch (error) {
			console.error("Signup failed:", error);
			toast.error("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<RoleSelectionStep
						formData={formData}
						updateFormData={updateFormData}
						onNext={nextStep}
					/>
				);
			case 2:
				return (
					<BasicInfoStep
						formData={formData}
						updateFormData={updateFormData}
						onNext={nextStep}
						onPrev={prevStep}
					/>
				);
			case 3:
				return (
					<ContactInfoStep
						formData={formData}
						updateFormData={updateFormData}
						onNext={nextStep}
						onPrev={prevStep}
					/>
				);
			case 4:
				if (formData.userType === "FLEET") {
					return (
						<CompanyInfoStep
							formData={formData}
							updateFormData={updateFormData}
							onNext={nextStep}
							onPrev={prevStep}
						/>
					);
				} else {
					return (
						<ReviewStep
							formData={formData}
							onSubmit={handleSubmit}
							onPrev={prevStep}
							isLoading={isLoading}
						/>
					);
				}
			case 5:
				return (
					<ReviewStep
						formData={formData}
						onSubmit={handleSubmit}
						onPrev={prevStep}
						isLoading={isLoading}
					/>
				);
			default:
				return null;
		}
	};

	const steps = getSteps();
	const currentStepData = steps[currentStep - 1];
	const maxSteps = getMaxSteps();
	const progress = (currentStep / maxSteps) * 100;

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>{currentStepData.title}</CardTitle>
						<CardDescription>{currentStepData.description}</CardDescription>
					</div>
					<div className="text-sm text-muted-foreground">
						Step {currentStep} of {maxSteps}
					</div>
				</div>
				<Progress value={progress} className="w-full" />
			</CardHeader>
			<CardContent>{renderStep()}</CardContent>
		</Card>
	);
}
