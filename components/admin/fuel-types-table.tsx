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

interface FuelType {
	id: string;
	name: string;
	_count: {
		vehicles: number;
	};
}

export function FuelTypesTable() {
	const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	});
	const [search, setSearch] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingFuelType, setEditingFuelType] = useState<FuelType | null>(null);
	const [formData, setFormData] = useState({
		name: "",
	});

	const fetchFuelTypes = async (page = 1, searchTerm = "") => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				page: page.toString(),
				limit: pagination.limit.toString(),
				search: searchTerm,
			});

			const response = await fetch(`/api/admin/fuel-types?${params}`);
			if (!response.ok) throw new Error("Failed to fetch fuel types");

			const data = await response.json();
			setFuelTypes(data.fuelTypes);
			setPagination(data.pagination);
		} catch (_error) {
			toast.error("Failed to fetch fuel types");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchFuelTypes();
	}, []);

	const handleSearch = (value: string) => {
		setSearch(value);
		fetchFuelTypes(1, value);
	};

	const handlePageChange = (page: number) => {
		fetchFuelTypes(page, search);
	};

	const handleCreate = async () => {
		try {
			const response = await fetch("/api/admin/fuel-types", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) throw new Error("Failed to create fuel type");

			toast.success("Fuel type created successfully");
			setIsCreateOpen(false);
			setFormData({ name: "" });
			fetchFuelTypes(pagination.page, search);
		} catch (_error) {
			toast.error("Failed to create fuel type");
		}
	};

	const handleEdit = async () => {
		if (!editingFuelType) return;

		try {
			const response = await fetch(
				`/api/admin/fuel-types/${editingFuelType.id}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formData),
				},
			);

			if (!response.ok) throw new Error("Failed to update fuel type");

			toast.success("Fuel type updated successfully");
			setEditingFuelType(null);
			setFormData({ name: "" });
			fetchFuelTypes(pagination.page, search);
		} catch (_error) {
			toast.error("Failed to update fuel type");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this fuel type?")) return;

		try {
			const response = await fetch(`/api/admin/fuel-types/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete fuel type");
			}

			toast.success("Fuel type deleted successfully");
			fetchFuelTypes(pagination.page, search);
		} catch (error: any) {
			toast.error(error.message || "Failed to delete fuel type");
		}
	};

	const columns = [
		{
			key: "name" as keyof FuelType,
			header: "Name",
			render: (value: any) => <span className="font-medium">{value}</span>,
		},
		{
			key: "_count" as keyof FuelType,
			header: "Vehicles",
			render: (value: any) => (
				<span className="text-sm">{value.vehicles} vehicles</span>
			),
		},
		{
			key: "actions" as keyof FuelType,
			header: "Actions",
			render: (_: any, item: FuelType) => (
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setEditingFuelType(item);
							setFormData({ name: item.name });
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
						placeholder="Search fuel types..."
						value={search}
						onChange={(e) => handleSearch(e.target.value)}
					/>
				</div>
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Fuel Type
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Fuel Type</DialogTitle>
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
							<Button onClick={handleCreate} className="w-full">
								Create Fuel Type
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<DataTable
				data={fuelTypes}
				columns={columns}
				isLoading={loading}
				pagination={{
					...pagination,
					onPageChange: handlePageChange,
				}}
				disableSearch={true}
				emptyMessage="No fuel types found"
			/>

			<Dialog
				open={!!editingFuelType}
				onOpenChange={() => {
					setEditingFuelType(null);
					setFormData({ name: "" });
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Fuel Type</DialogTitle>
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
						<Button onClick={handleEdit} className="w-full">
							Update Fuel Type
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
