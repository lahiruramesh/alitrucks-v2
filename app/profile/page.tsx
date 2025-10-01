"use client";

import { Calendar, Edit, Phone, Save, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { StripeConnectSetup } from "@/components/stripe/stripe-connect-setup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { profileClient } from "@/lib/auth-client";

interface UserProfile {
	id: string;
	name: string;
	email: string;
	role: string;
	userType: string;
	companyName?: string;
	phoneNumber?: string;
	address?: string;
	city?: string;
	country?: string;
	postalCode?: string;
	emailVerified: boolean;
	createdAt: string;
	updatedAt: string;
}

export default function ProfilePage() {
	const { user, refreshUser } = useAuth();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState<Partial<UserProfile>>({});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const fetchProfile = useCallback(async () => {
		try {
			setIsLoading(true);
			const profileData = await profileClient.getProfile();
			setProfile(profileData);
			setFormData(profileData);
		} catch (error) {
			console.error("Error fetching profile:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (user?.id) {
			fetchProfile();
		}
	}, [user?.id, fetchProfile]);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name?.trim()) {
			newErrors.name = "Name is required";
		}

		if (
			formData.phoneNumber &&
			!/^\+?[\d\s\-()]+$/.test(formData.phoneNumber)
		) {
			newErrors.phoneNumber = "Please enter a valid phone number";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = async () => {
		if (!validateForm()) {
			return;
		}

		setIsSaving(true);
		try {
			const updatedProfile = await profileClient.updateProfile({
				name: formData.name,
				phoneNumber: formData.phoneNumber,
				address: formData.address,
				city: formData.city,
				country: formData.country,
				postalCode: formData.postalCode,
				companyName: formData.companyName,
			});

			setProfile(updatedProfile);
			setIsEditing(false);
			await refreshUser(); // Refresh the auth context
		} catch (error) {
			console.error("Error updating profile:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleInputChange = (field: keyof UserProfile, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handleCancel = () => {
		setFormData(profile || {});
		setErrors({});
		setIsEditing(false);
	};

	if (isLoading) {
		return (
			<ProtectedRoute>
				<DashboardLayout>
					<div className="flex justify-center items-center h-64">
						<div className="text-muted-foreground">Loading profile...</div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	if (!profile) {
		return (
			<ProtectedRoute>
				<DashboardLayout>
					<div className="flex flex-col items-center justify-center h-64">
						<h2 className="text-xl font-semibold mb-2">Profile not found</h2>
						<p className="text-muted-foreground">
							Unable to load your profile information.
						</p>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<DashboardLayout>
				<div className="flex flex-1 flex-col gap-4 p-4">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold">My Profile</h1>
							<p className="text-muted-foreground">
								Manage your account information and preferences
							</p>
						</div>
						<div className="flex gap-2">
							{isEditing ? (
								<>
									<Button variant="outline" onClick={handleCancel}>
										Cancel
									</Button>
									<Button onClick={handleSave} disabled={isSaving}>
										<Save className="h-4 w-4 mr-2" />
										{isSaving ? "Saving..." : "Save Changes"}
									</Button>
								</>
							) : (
								<Button onClick={() => setIsEditing(true)}>
									<Edit className="h-4 w-4 mr-2" />
									Edit Profile
								</Button>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Main Profile Info */}
						<div className="lg:col-span-2 space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<User className="h-4 w-4" />
										Basic Information
									</CardTitle>
									<CardDescription>
										Your personal information and account details
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label htmlFor="name">Full Name *</Label>
											{isEditing ? (
												<div>
													<Input
														id="name"
														value={formData.name || ""}
														onChange={(e) =>
															handleInputChange("name", e.target.value)
														}
														className={errors.name ? "border-destructive" : ""}
													/>
													{errors.name && (
														<p className="text-sm text-destructive mt-1">
															{errors.name}
														</p>
													)}
												</div>
											) : (
												<p className="text-sm mt-1">{profile.name}</p>
											)}
										</div>
										<div>
											<Label>Email Address</Label>
											<div className="flex items-center gap-2 mt-1">
												<p className="text-sm">{profile.email}</p>
												<Badge
													variant={
														profile.emailVerified ? "default" : "secondary"
													}
												>
													{profile.emailVerified ? "Verified" : "Unverified"}
												</Badge>
											</div>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label>Role</Label>
											<div className="mt-1">
												<Badge
													variant={
														profile.role === "ADMIN"
															? "destructive"
															: profile.role === "SELLER"
																? "default"
																: "secondary"
													}
												>
													{profile.role}
												</Badge>
											</div>
										</div>
										<div>
											<Label>Account Type</Label>
											<div className="mt-1">
												<Badge variant="outline">{profile.userType}</Badge>
											</div>
										</div>
									</div>

									{(profile.userType === "FLEET" || profile.companyName) && (
										<div>
											<Label htmlFor="companyName">Company Name</Label>
											{isEditing ? (
												<Input
													id="companyName"
													value={formData.companyName || ""}
													onChange={(e) =>
														handleInputChange("companyName", e.target.value)
													}
													placeholder="Enter your company name"
												/>
											) : (
												<p className="text-sm mt-1">
													{profile.companyName || "Not provided"}
												</p>
											)}
										</div>
									)}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Phone className="h-4 w-4" />
										Contact Information
									</CardTitle>
									<CardDescription>
										Your contact details and address information
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor="phoneNumber">Phone Number</Label>
										{isEditing ? (
											<div>
												<Input
													id="phoneNumber"
													value={formData.phoneNumber || ""}
													onChange={(e) =>
														handleInputChange("phoneNumber", e.target.value)
													}
													placeholder="+46 70 123 45 67"
													className={
														errors.phoneNumber ? "border-destructive" : ""
													}
												/>
												{errors.phoneNumber && (
													<p className="text-sm text-destructive mt-1">
														{errors.phoneNumber}
													</p>
												)}
											</div>
										) : (
											<p className="text-sm mt-1">
												{profile.phoneNumber || "Not provided"}
											</p>
										)}
									</div>

									<div>
										<Label htmlFor="address">Street Address</Label>
										{isEditing ? (
											<Textarea
												id="address"
												value={formData.address || ""}
												onChange={(e) =>
													handleInputChange("address", e.target.value)
												}
												placeholder="Enter your street address"
												rows={2}
											/>
										) : (
											<p className="text-sm mt-1">
												{profile.address || "Not provided"}
											</p>
										)}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<Label htmlFor="city">City</Label>
											{isEditing ? (
												<Input
													id="city"
													value={formData.city || ""}
													onChange={(e) =>
														handleInputChange("city", e.target.value)
													}
													placeholder="Enter your city"
												/>
											) : (
												<p className="text-sm mt-1">
													{profile.city || "Not provided"}
												</p>
											)}
										</div>
										<div>
											<Label htmlFor="country">Country</Label>
											{isEditing ? (
												<Input
													id="country"
													value={formData.country || ""}
													onChange={(e) =>
														handleInputChange("country", e.target.value)
													}
													placeholder="Enter your country"
												/>
											) : (
												<p className="text-sm mt-1">
													{profile.country || "Not provided"}
												</p>
											)}
										</div>
										<div>
											<Label htmlFor="postalCode">Postal Code</Label>
											{isEditing ? (
												<Input
													id="postalCode"
													value={formData.postalCode || ""}
													onChange={(e) =>
														handleInputChange("postalCode", e.target.value)
													}
													placeholder="12345"
												/>
											) : (
												<p className="text-sm mt-1">
													{profile.postalCode || "Not provided"}
												</p>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							{/* Stripe Connect Setup for Sellers */}
							{profile.role === "SELLER" && <StripeConnectSetup />}

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										Account Details
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label>Member Since</Label>
										<p className="text-sm mt-1">
											{new Date(profile.createdAt).toLocaleDateString()}
										</p>
									</div>
									<div>
										<Label>Last Updated</Label>
										<p className="text-sm mt-1">
											{new Date(profile.updatedAt).toLocaleDateString()}
										</p>
									</div>
									<Separator />
									<div>
										<Label>Account ID</Label>
										<p className="text-xs mt-1 font-mono text-muted-foreground break-all">
											{profile.id}
										</p>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Profile Completion</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{[
											{
												label: "Basic Info",
												completed: !!(profile.name && profile.email),
											},
											{
												label: "Phone Number",
												completed: !!profile.phoneNumber,
											},
											{
												label: "Address",
												completed: !!(profile.address && profile.city),
											},
											{
												label: "Company Info",
												completed:
													profile.userType === "INDIVIDUAL" ||
													!!profile.companyName,
											},
										].map((item, index) => (
											<div
												key={item.label || `profile-item-${index}`}
												className="flex items-center justify-between"
											>
												<span className="text-sm">{item.label}</span>
												<Badge
													variant={item.completed ? "default" : "secondary"}
												>
													{item.completed ? "✓" : "○"}
												</Badge>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
