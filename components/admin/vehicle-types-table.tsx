"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VehicleType {
	id: string;
	name: string;
	description?: string;
	_count: {
		vehicles: number;
	};
}

export function VehicleTypesTable() {
	const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	});
	const [search, setSearch] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingType, setEditingType] = useState<VehicleType | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
	});

	const fetchVehicleTypes = async (page = 1, searchTerm = "") => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				page: page.toString(),
				limit: pagination.limit.toString(),
				search: searchTerm,
			});

			const response = await fetch(`/api/admin/vehicle-types?${params}`);
			if (!response.ok) throw new Error("Failed to fetch vehicle types");

			const data = await response.json();
			setVehicleTypes(data.vehicleTypes);
			setPagination(data.pagination);
		} catch (_error) {
			toast.error("Failed to fetch vehicle types");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchVehicleTypes();
	}, []);

	const handleSearch = (value: string) => {
		setSearch(value);
		fetchVehicleTypes(1, value);
	};

	const handlePageChange = (page: number) => {
		fetchVehicleTypes(page, search);
	};

	const handleCreate = async () => {
		try {
			const response = await fetch("/api/admin/vehicle-types", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) throw new Error("Failed to create vehicle type");

			toast.success(`Vehicle type "${formData.name}" created successfully`);
			setIsCreateOpen(false);
			setFormData({ name: "", description: "" });
			fetchVehicleTypes(1, search); // Go to first page to see the new item
		} catch (_error) {
			toast.error("Failed to create vehicle type");
		}
	};

	const handleEdit = async () => {
		if (!editingType) return;

		try {
			const response = await fetch(
				`/api/admin/vehicle-types/${editingType.id}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formData),
				},
			);

			if (!response.ok) throw new Error("Failed to update vehicle type");

			toast.success(`Vehicle type "${formData.name}" updated successfully`);
			setEditingType(null);
			setFormData({ name: "", description: "" });
			fetchVehicleTypes(pagination.page, search);
		} catch (_error) {
			toast.error("Failed to update vehicle type");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this vehicle type?")) return;

		try {
			const response = await fetch(`/api/admin/vehicle-types/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete vehicle type");
			}

			toast.success("Vehicle type deleted successfully");
			fetchVehicleTypes(pagination.page, search);
		} catch (error: any) {
			toast.error(error.message || "Failed to delete vehicle type");
		}
	};

	const columns = [
		{
			key: "name" as keyof VehicleType,
			header: "Name",
			render: (value: any) => <span className="font-medium">{value}</span>,
		},
		{
			key: "description" as keyof VehicleType,
			header: "Description",
			render: (value: any) => (
				<span className="text-muted-foreground">
					{value || "No description"}
				</span>
			),
		},
		{
			key: "_count" as keyof VehicleType,
			header: "Vehicles",
			render: (value: any) => (
				<span className="text-sm">{value.vehicles} vehicles</span>
			),
		},
		{
			key: "actions" as keyof VehicleType,
			header: "Actions",
			render: (_: any, item: VehicleType) => (
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setEditingType(item);
							setFormData({
								name: item.name,
								description: item.description || "",
							});
						}}
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => handleDelete(item.id)}
						disabled={item._count.vehicles > 0}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<div className="flex-1 max-w-sm">
					<Input
						placeholder="Search vehicle types..."
						value={search}
						onChange={(e) => handleSearch(e.target.value)}
					/>
				</div>
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Vehicle Type
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Vehicle Type</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
								/>
							</div>
							<div>
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
								/>
							</div>
							<Button onClick={handleCreate} className="w-full">
								Create Vehicle Type
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<DataTable
				data={vehicleTypes}
				columns={columns}
				isLoading={loading}
				pagination={{
					...pagination,
					onPageChange: handlePageChange,
				}}
				disableSearch={true}
				emptyMessage="No vehicle types found"
			/>

			<Dialog
				open={!!editingType}
				onOpenChange={() => {
					setEditingType(null);
					setFormData({ name: "", description: "" });
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Vehicle Type</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="edit-name">Name</Label>
							<Input
								id="edit-name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
							/>
						</div>
						<div>
							<Label htmlFor="edit-description">Description</Label>
							<Textarea
								id="edit-description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
							/>
						</div>
						<Button onClick={handleEdit} className="w-full">
							Update Vehicle Type
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
