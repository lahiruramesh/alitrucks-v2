"use client";

import { Filter, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type Action,
	type Column,
	DataTable,
} from "@/components/ui/data-table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	userType: string;
	companyName?: string;
	phoneNumber?: string;
	city?: string;
	country?: string;
	emailVerified: boolean;
	banned: boolean;
	createdAt: string;
	updatedAt: string;
}

interface Pagination {
	page: number;
	limit: number;
	total: number;
	pages: number;
}

export default function AdminUsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [pagination, setPagination] = useState<Pagination>({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [filters, setFilters] = useState({
		role: "all",
		userType: "all",
	});

	const fetchUsers = async () => {
		setIsLoading(true);
		try {
			const params = new URLSearchParams({
				page: pagination.page.toString(),
				limit: pagination.limit.toString(),
				...(filters.role && filters.role !== "all" && { role: filters.role }),
				...(filters.userType && filters.userType !== "all" && { userType: filters.userType }),
			});

			const response = await fetch(`/api/users?${params}`);
			const data = await response.json();

			setUsers(data.users || []);
			setPagination(data.pagination || pagination);
		} catch (error) {
			console.error("Error fetching users:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handlePageChange = (page: number) => {
		setPagination((prev) => ({ ...prev, page }));
	};

	const handleDisableUser = async (user: User) => {
		if (!confirm(`Are you sure you want to disable ${user.name}?`)) return;

		try {
			const response = await fetch(`/api/users/${user.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					banned: true,
					banReason: "Disabled by administrator"
				}),
			});

			if (response.ok) {
				toast.success(`User ${user.name} has been disabled`);
				fetchUsers();
			} else {
				const error = await response.json();
				toast.error(error.error || "Failed to disable user");
			}
		} catch (error) {
			console.error("Error disabling user:", error);
			toast.error("Failed to disable user");
		}
	};

	const handleEnableUser = async (user: User) => {
		try {
			const response = await fetch(`/api/users/${user.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					banned: false,
					banReason: null
				}),
			});

			if (response.ok) {
				toast.success(`User ${user.name} has been enabled`);
				fetchUsers();
			} else {
				const error = await response.json();
				toast.error(error.error || "Failed to enable user");
			}
		} catch (error) {
			console.error("Error enabling user:", error);
			toast.error("Failed to enable user");
		}
	};

	const handleDeleteUser = async (user: User) => {
		if (
			!confirm(
				`Are you sure you want to delete ${user.name}? This action cannot be undone.`,
			)
		)
			return;

		try {
			const response = await fetch(`/api/users/${user.id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success(`User ${user.name} has been deleted`);
				fetchUsers();
			} else {
				const error = await response.json();
				toast.error(error.error || "Failed to delete user");
			}
		} catch (error) {
			console.error("Error deleting user:", error);
			toast.error("Failed to delete user");
		}
	};

	const columns: Column<User>[] = [
		{
			key: "name",
			header: "Name",
			sortable: true,
			searchable: true,
		},
		{
			key: "email",
			header: "Email",
			sortable: true,
			searchable: true,
		},
		{
			key: "role",
			header: "Role",
			sortable: true,
			render: (value) => (
				<Badge
					variant={
						value === "ADMIN"
							? "destructive"
							: value === "SELLER"
								? "default"
								: "secondary"
					}
				>
					{value}
				</Badge>
			),
		},
		{
			key: "userType",
			header: "Type",
			sortable: true,
			render: (value) => <Badge variant="outline">{value}</Badge>,
		},
		{
			key: "companyName",
			header: "Company",
			render: (value) => value || "-",
		},
		{
			key: "city",
			header: "Location",
			render: (value, row) => {
				if (value && row.country) {
					return `${value}, ${row.country}`;
				}
				return value || row.country || "-";
			},
		},
		{
			key: "emailVerified",
			header: "Verified",
			render: (value) => (
				<Badge variant={value ? "default" : "secondary"}>
					{value ? "Yes" : "No"}
				</Badge>
			),
		},
		{
			key: "banned",
			header: "Status",
			render: (value) => (
				<Badge variant={value ? "destructive" : "default"}>
					{value ? "Banned" : "Active"}
				</Badge>
			),
		},
		{
			key: "createdAt",
			header: "Created",
			sortable: true,
			render: (value) => new Date(value).toLocaleDateString(),
		},
	];

	const actions: Action<User>[] = [
		{
			label: "View Profile",
			onClick: (user) => {
				// Navigate to user profile
				window.open(`/admin/users/${user.id}`, "_blank");
			},
		},
		{
			label: "Disable User",
			onClick: handleDisableUser,
			variant: "destructive",
			show: (user) => !user.banned && user.role !== "ADMIN",
		},
		{
			label: "Enable User",
			onClick: handleEnableUser,
			show: (user) => user.banned,
		},
		{
			label: "Delete User",
			onClick: handleDeleteUser,
			variant: "destructive",
			show: (user) => user.role !== "ADMIN",
		},
	];

	return (
		<ProtectedRoute allowedRoles={["ADMIN"]}>
			<DashboardLayout>
				<div className="flex flex-1 flex-col gap-4 p-4">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-2xl font-bold text-foreground">
								User Management
							</h1>
							<p className="text-muted-foreground">
								Manage platform users and their permissions
							</p>
						</div>
					</div>

					{/* Stats Cards */}
					<div className="grid gap-4 md:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Users
								</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{pagination.total}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Active Users
								</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{users.filter((u) => !u.banned).length}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Sellers</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{users.filter((u) => u.role === "SELLER").length}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Buyers</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{users.filter((u) => u.role === "BUYER").length}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Filters */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Filter className="h-4 w-4" />
								Filters
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex gap-4">
								<div className="flex-1">
									<Select
										value={filters.role}
										onValueChange={(value) =>
											setFilters((prev) => ({ ...prev, role: value }))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Filter by role" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Roles</SelectItem>
											<SelectItem value="ADMIN">Admin</SelectItem>
											<SelectItem value="SELLER">Seller</SelectItem>
											<SelectItem value="BUYER">Buyer</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex-1">
									<Select
										value={filters.userType}
										onValueChange={(value) =>
											setFilters((prev) => ({ ...prev, userType: value }))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Filter by type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Types</SelectItem>
											<SelectItem value="INDIVIDUAL">Individual</SelectItem>
											<SelectItem value="FLEET">Fleet</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<Button
									variant="outline"
									onClick={() => setFilters({ role: "all", userType: "all" })}
								>
									Clear Filters
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Users Table */}
					<Card>
						<CardHeader>
							<CardTitle>Users</CardTitle>
							<CardDescription>
								A list of all users registered on the platform
							</CardDescription>
						</CardHeader>
						<CardContent>
							<DataTable
								data={users}
								columns={columns}
								actions={actions}
								searchPlaceholder="Search users by name or email..."
								emptyMessage="No users found"
								isLoading={isLoading}
								pagination={{
									...pagination,
									onPageChange: handlePageChange,
								}}
							/>
						</CardContent>
					</Card>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
