"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth-context";
import { authClient } from "@/lib/auth-client";
import type { SignupFormData } from "@/types/common";
import { BasicInfoStep } from "./steps/basic-info-step";
import { CompanyInfoStep } from "./steps/company-info-step";
import { ContactInfoStep } from "./steps/contact-info-step";
import { ReviewStep } from "./steps/review-step";
import { RoleSelectionStep } from "./steps/role-selection-step";

export function MultiStepSignup() {
	const router = useRouter();
	const t = useTranslations();
	const { refreshUser } = useAuth();
	const [currentStep, setCurrentStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<SignupFormData>({
		role: "BUYER",
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
		// Create the user account with Better-auth including additional fields
		const { data, error } = await authClient.signUp.email({
			...formData, // Spread all form data as type `any`
		} as any);			if (error) {
				console.error("Signup error:", error);
				// Handle error (show toast, etc.)
				return;
			}

			// Refresh user context
			await refreshUser();

			// Redirect based on user role
			const redirectPath =
				formData.role === "SELLER" ? "/seller" : "/dashboard";
			router.push(redirectPath);
		} catch (error) {
			console.error("Signup failed:", error);
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
