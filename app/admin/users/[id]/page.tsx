"use client";

import { ArrowLeft, Calendar, Phone, Save, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
	banned: boolean;
	banReason?: string;
	banExpires?: string;
	createdAt: string;
	updatedAt: string;
}

export default function UserProfilePage() {
	const params = useParams();
	const router = useRouter();
	const [user, setUser] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState<Partial<UserProfile>>({});

	const fetchUser = async () => {
		try {
			const response = await fetch(`/api/users/${params.id}`);
			if (response.ok) {
				const userData = await response.json();
				setUser(userData);
				setFormData(userData);
			}
		} catch (error) {
			console.error("Error fetching user:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (params.id) {
			fetchUser();
		}
	}, [params.id]);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const response = await fetch(`/api/users/${params.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				const updatedUser = await response.json();
				setUser(updatedUser);
				setIsEditing(false);
			}
		} catch (error) {
			console.error("Error updating user:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleInputChange = (field: keyof UserProfile, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	if (isLoading) {
		return (
			<ProtectedRoute allowedRoles={["ADMIN"]}>
				<DashboardLayout>
					<div className="flex justify-center items-center h-64">
						<div className="text-muted-foreground">Loading user profile...</div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	if (!user) {
		return (
			<ProtectedRoute allowedRoles={["ADMIN"]}>
				<DashboardLayout>
					<div className="flex flex-col items-center justify-center h-64">
						<h2 className="text-xl font-semibold mb-2">User not found</h2>
						<p className="text-muted-foreground mb-4">
							The user you're looking for doesn't exist.
						</p>
						<Button onClick={() => router.back()}>Go Back</Button>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute allowedRoles={["ADMIN"]}>
			<DashboardLayout>
				<div className="flex flex-1 flex-col gap-4 p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Button variant="outline" onClick={() => router.back()}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Button>
							<div>
								<h1 className="text-2xl font-bold">User Profile</h1>
								<p className="text-muted-foreground">{user.name}</p>
							</div>
						</div>
						<div className="flex gap-2">
							{isEditing ? (
								<>
									<Button variant="outline" onClick={() => setIsEditing(false)}>
										Cancel
									</Button>
									<Button onClick={handleSave} disabled={isSaving}>
										<Save className="h-4 w-4 mr-2" />
										{isSaving ? "Saving..." : "Save Changes"}
									</Button>
								</>
							) : (
								<Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
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
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label htmlFor="name">Full Name</Label>
											{isEditing ? (
												<Input
													id="name"
													value={formData.name || ""}
													onChange={(e) =>
														handleInputChange("name", e.target.value)
													}
												/>
											) : (
												<p className="text-sm mt-1">{user.name}</p>
											)}
										</div>
										<div>
											<Label htmlFor="email">Email Address</Label>
											<div className="flex items-center gap-2 mt-1">
												<p className="text-sm">{user.email}</p>
												<Badge
													variant={user.emailVerified ? "default" : "secondary"}
												>
													{user.emailVerified ? "Verified" : "Unverified"}
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
														user.role === "ADMIN"
															? "destructive"
															: user.role === "SELLER"
																? "default"
																: "secondary"
													}
												>
													{user.role}
												</Badge>
											</div>
										</div>
										<div>
											<Label>Account Type</Label>
											<div className="mt-1">
												<Badge variant="outline">{user.userType}</Badge>
											</div>
										</div>
									</div>

									{user.companyName && (
										<div>
											<Label htmlFor="companyName">Company Name</Label>
											{isEditing ? (
												<Input
													id="companyName"
													value={formData.companyName || ""}
													onChange={(e) =>
														handleInputChange("companyName", e.target.value)
													}
												/>
											) : (
												<p className="text-sm mt-1">{user.companyName}</p>
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
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor="phoneNumber">Phone Number</Label>
										{isEditing ? (
											<Input
												id="phoneNumber"
												value={formData.phoneNumber || ""}
												onChange={(e) =>
													handleInputChange("phoneNumber", e.target.value)
												}
											/>
										) : (
											<p className="text-sm mt-1">
												{user.phoneNumber || "Not provided"}
											</p>
										)}
									</div>

									<div>
										<Label htmlFor="address">Address</Label>
										{isEditing ? (
											<Textarea
												id="address"
												value={formData.address || ""}
												onChange={(e) =>
													handleInputChange("address", e.target.value)
												}
												rows={2}
											/>
										) : (
											<p className="text-sm mt-1">
												{user.address || "Not provided"}
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
												/>
											) : (
												<p className="text-sm mt-1">
													{user.city || "Not provided"}
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
												/>
											) : (
												<p className="text-sm mt-1">
													{user.country || "Not provided"}
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
												/>
											) : (
												<p className="text-sm mt-1">
													{user.postalCode || "Not provided"}
												</p>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Account Status</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label>Status</Label>
										<div className="mt-1">
											<Badge variant={user.banned ? "destructive" : "default"}>
												{user.banned ? "Banned" : "Active"}
											</Badge>
										</div>
									</div>

									{isEditing && (
										<div className="space-y-4">
											<div className="flex items-center space-x-2">
												<Checkbox
													id="banned"
													checked={formData.banned || false}
													onCheckedChange={(checked) =>
														handleInputChange("banned", checked)
													}
												/>
												<Label htmlFor="banned">Ban this user</Label>
											</div>

											{formData.banned && (
												<div>
													<Label htmlFor="banReason">Ban Reason</Label>
													<Textarea
														id="banReason"
														value={formData.banReason || ""}
														onChange={(e) =>
															handleInputChange("banReason", e.target.value)
														}
														placeholder="Reason for banning this user..."
														rows={3}
													/>
												</div>
											)}
										</div>
									)}

									{user.banned && user.banReason && !isEditing && (
										<div>
											<Label>Ban Reason</Label>
											<p className="text-sm mt-1 text-destructive">
												{user.banReason}
											</p>
										</div>
									)}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										Account Details
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<div>
										<Label>Created</Label>
										<p className="text-sm mt-1">
											{new Date(user.createdAt).toLocaleDateString()}
										</p>
									</div>
									<div>
										<Label>Last Updated</Label>
										<p className="text-sm mt-1">
											{new Date(user.updatedAt).toLocaleDateString()}
										</p>
									</div>
									<div>
										<Label>User ID</Label>
										<p className="text-xs mt-1 font-mono text-muted-foreground">
											{user.id}
										</p>
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
