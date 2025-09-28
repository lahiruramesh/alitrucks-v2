"use client";

import { Building2, ShoppingCart, Truck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { SignupFormData, UserRole, UserType } from "@/types/common";

interface RoleSelectionStepProps {
	formData: SignupFormData;
	updateFormData: (data: Partial<SignupFormData>) => void;
	onNext: () => void;
}

export function RoleSelectionStep({
	formData,
	updateFormData,
	onNext,
}: RoleSelectionStepProps) {
	const handleRoleChange = (role: UserRole) => {
		updateFormData({ role });
	};

	const handleUserTypeChange = (userType: UserType) => {
		updateFormData({ userType });
	};

	const canProceed = formData.role && formData.userType;

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium mb-4">What describes you best?</h3>
				<RadioGroup
					value={formData.role}
					onValueChange={handleRoleChange}
					className="grid grid-cols-1 gap-4"
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="BUYER" id="buyer" />
						<Label
							htmlFor="buyer"
							className="flex items-center space-x-2 cursor-pointer"
						>
							<ShoppingCart className="h-4 w-4" />
							<div>
								<div className="font-medium">I want to rent trucks</div>
								<div className="text-sm text-muted-foreground">
									Browse and rent vehicles
								</div>
							</div>
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="SELLER" id="seller" />
						<Label
							htmlFor="seller"
							className="flex items-center space-x-2 cursor-pointer"
						>
							<Truck className="h-4 w-4" />
							<div>
								<div className="font-medium">I want to rent out trucks</div>
								<div className="text-sm text-muted-foreground">
									List and manage vehicle rentals
								</div>
							</div>
						</Label>
					</div>
				</RadioGroup>
			</div>

			{formData.role && (
				<div>
					<h3 className="text-lg font-medium mb-4">Account type</h3>
					<RadioGroup
						value={formData.userType}
						onValueChange={handleUserTypeChange}
						className="grid grid-cols-1 gap-4"
					>
						<Card
							className={`cursor-pointer transition-colors ${formData.userType === "INDIVIDUAL" ? "ring-2 ring-primary" : ""}`}
						>
							<CardHeader className="pb-2">
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="INDIVIDUAL" id="individual" />
									<Label
										htmlFor="individual"
										className="cursor-pointer flex items-center space-x-2"
									>
										<User className="h-4 w-4" />
										<CardTitle className="text-base">Individual</CardTitle>
									</Label>
								</div>
							</CardHeader>
							<CardContent>
								<CardDescription>
									Perfect for personal use or small-scale operations
								</CardDescription>
							</CardContent>
						</Card>

						<Card
							className={`cursor-pointer transition-colors ${formData.userType === "FLEET" ? "ring-2 ring-primary" : ""}`}
						>
							<CardHeader className="pb-2">
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="FLEET" id="fleet" />
									<Label
										htmlFor="fleet"
										className="cursor-pointer flex items-center space-x-2"
									>
										<Building2 className="h-4 w-4" />
										<CardTitle className="text-base">
											Fleet Management
										</CardTitle>
									</Label>
								</div>
							</CardHeader>
							<CardContent>
								<CardDescription>
									For businesses managing multiple vehicles or large-scale
									operations
								</CardDescription>
							</CardContent>
						</Card>
					</RadioGroup>
				</div>
			)}

			<div className="flex justify-end">
				<Button onClick={onNext} disabled={!canProceed}>
					Continue
				</Button>
			</div>
		</div>
	);
}
