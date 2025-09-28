"use client";

import {
	Building2,
	ChevronLeft,
	Loader2,
	Mail,
	Phone,
	User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SignupFormData } from "@/types/common";

interface ReviewStepProps {
	formData: SignupFormData;
	onSubmit: () => void;
	onPrev: () => void;
	isLoading: boolean;
}

export function ReviewStep({
	formData,
	onSubmit,
	onPrev,
	isLoading,
}: ReviewStepProps) {
	const getRoleLabel = (role: string) => {
		switch (role) {
			case "BUYER":
				return "Truck Renter";
			case "SELLER":
				return "Truck Owner";
			default:
				return role;
		}
	};

	const getUserTypeLabel = (userType: string) => {
		switch (userType) {
			case "INDIVIDUAL":
				return "Individual Account";
			case "FLEET":
				return "Fleet Management Account";
			default:
				return userType;
		}
	};

	return (
		<div className="space-y-6">
			<div className="mb-4">
				<h3 className="text-lg font-medium">Review Your Information</h3>
				<p className="text-sm text-muted-foreground">
					Please review your details before creating your account
				</p>
			</div>

			<div className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-base flex items-center">
							<User className="h-4 w-4 mr-2" />
							Account Type
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Role:</span>
								<span className="text-sm font-medium">
									{getRoleLabel(formData.role)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">
									Account Type:
								</span>
								<span className="text-sm font-medium">
									{getUserTypeLabel(formData.userType)}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base flex items-center">
							<Mail className="h-4 w-4 mr-2" />
							Personal Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Name:</span>
								<span className="text-sm font-medium">{formData.name}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Email:</span>
								<span className="text-sm font-medium">{formData.email}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base flex items-center">
							<Phone className="h-4 w-4 mr-2" />
							Contact Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Phone:</span>
								<span className="text-sm font-medium">
									{formData.phoneNumber}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Address:</span>
								<span className="text-sm font-medium">{formData.address}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">City:</span>
								<span className="text-sm font-medium">{formData.city}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">
									Postal Code:
								</span>
								<span className="text-sm font-medium">
									{formData.postalCode}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Country:</span>
								<span className="text-sm font-medium">{formData.country}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{formData.userType === "FLEET" && formData.companyName && (
					<Card>
						<CardHeader>
							<CardTitle className="text-base flex items-center">
								<Building2 className="h-4 w-4 mr-2" />
								Company Information
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">
									Company Name:
								</span>
								<span className="text-sm font-medium">
									{formData.companyName}
								</span>
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
				<p className="text-sm text-yellow-800">
					By creating an account, you agree to our Terms of Service and Privacy
					Policy.
				</p>
			</div>

			<div className="flex justify-between">
				<Button variant="outline" onClick={onPrev} disabled={isLoading}>
					<ChevronLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
				<Button onClick={onSubmit} disabled={isLoading}>
					{isLoading ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Creating Account...
						</>
					) : (
						"Create Account"
					)}
				</Button>
			</div>
		</div>
	);
}
