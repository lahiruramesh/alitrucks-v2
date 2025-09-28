"use client";

import { Bell, Globe, Palette, Shield } from "lucide-react";
import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ProtectedRoute } from "@/components/protected-route";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";

export default function SettingsPage() {
	const { user } = useAuth();
	const [currency, setCurrency] = useState("SEK");
	const [notifications, setNotifications] = useState({
		email: true,
		push: false,
		sms: false,
	});

	return (
		<ProtectedRoute>
			<DashboardLayout>
				<div className="flex flex-1 flex-col gap-4 p-4">
					<div className="mb-4">
						<h1 className="text-2xl font-bold text-foreground">Settings</h1>
						<p className="text-muted-foreground">
							Manage your account preferences and settings
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Appearance Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Palette className="h-4 w-4" />
									Appearance
								</CardTitle>
								<CardDescription>
									Customize how Ali Trucks looks and feels
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label className="text-sm font-medium">Theme</Label>
									<div className="mt-2">
										<ThemeSwitcher />
									</div>
								</div>
								<Separator />
								<div>
									<Label className="text-sm font-medium">Language</Label>
									<div className="mt-2">
										<LanguageSwitcher />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Regional Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Globe className="h-4 w-4" />
									Regional Settings
								</CardTitle>
								<CardDescription>
									Set your location and currency preferences
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="currency">Default Currency</Label>
									<Select value={currency} onValueChange={setCurrency}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="SEK">Swedish Krona (SEK)</SelectItem>
											<SelectItem value="EUR">Euro (EUR)</SelectItem>
											<SelectItem value="USD">US Dollar (USD)</SelectItem>
											<SelectItem value="NOK">Norwegian Krone (NOK)</SelectItem>
											<SelectItem value="DKK">Danish Krone (DKK)</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>

						{/* Account Security */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Shield className="h-4 w-4" />
									Account Security
								</CardTitle>
								<CardDescription>
									Manage your account security settings
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Email Verified</p>
										<p className="text-xs text-muted-foreground">
											Your email address is verified
										</p>
									</div>
									<Badge
										variant={user?.emailVerified ? "default" : "secondary"}
									>
										{user?.emailVerified ? "Verified" : "Unverified"}
									</Badge>
								</div>
								<Separator />
								<Button variant="outline" className="w-full">
									Change Password
								</Button>
							</CardContent>
						</Card>

						{/* Notification Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Bell className="h-4 w-4" />
									Notifications
								</CardTitle>
								<CardDescription>
									Choose how you want to be notified
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium">Email Notifications</p>
											<p className="text-xs text-muted-foreground">
												Receive updates via email
											</p>
										</div>
										<input
											type="checkbox"
											checked={notifications.email}
											onChange={(e) =>
												setNotifications((prev) => ({
													...prev,
													email: e.target.checked,
												}))
											}
											className="rounded"
										/>
									</div>
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium">Push Notifications</p>
											<p className="text-xs text-muted-foreground">
												Receive browser notifications
											</p>
										</div>
										<input
											type="checkbox"
											checked={notifications.push}
											onChange={(e) =>
												setNotifications((prev) => ({
													...prev,
													push: e.target.checked,
												}))
											}
											className="rounded"
										/>
									</div>
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium">SMS Notifications</p>
											<p className="text-xs text-muted-foreground">
												Receive text messages
											</p>
										</div>
										<input
											type="checkbox"
											checked={notifications.sms}
											onChange={(e) =>
												setNotifications((prev) => ({
													...prev,
													sms: e.target.checked,
												}))
											}
											className="rounded"
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="flex justify-end">
						<Button>Save Settings</Button>
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
