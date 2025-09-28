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

interface Make {
	id: string;
	name: string;
	_count: {
		models: number;
		vehicles: number;
	};
}

export function MakesTable() {
	const [makes, setMakes] = useState<Make[]>([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	});
	const [search, setSearch] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingMake, setEditingMake] = useState<Make | null>(null);
	const [formData, setFormData] = useState({
		name: "",
	});

	const fetchMakes = async (page = 1, searchTerm = "") => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				page: page.toString(),
				limit: pagination.limit.toString(),
				search: searchTerm,
			});

			const response = await fetch(`/api/admin/makes?${params}`);
			if (!response.ok) throw new Error("Failed to fetch makes");

			const data = await response.json();
			setMakes(data.makes);
			setPagination(data.pagination);
		} catch (_error) {
			toast.error("Failed to fetch makes");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchMakes();
	}, [fetchMakes]);

	const handleSearch = (value: string) => {
		setSearch(value);
		fetchMakes(1, value);
	};

	const handlePageChange = (page: number) => {
		fetchMakes(page, search);
	};

	const handleCreate = async () => {
		try {
			const response = await fetch("/api/admin/makes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) throw new Error("Failed to create make");

			toast.success("Make created successfully");
			setIsCreateOpen(false);
			setFormData({ name: "" });
			fetchMakes(pagination.page, search);
		} catch (_error) {
			toast.error("Failed to create make");
		}
	};

	const handleEdit = async () => {
		if (!editingMake) return;

		try {
			const response = await fetch(`/api/admin/makes/${editingMake.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) throw new Error("Failed to update make");

			toast.success("Make updated successfully");
			setEditingMake(null);
			setFormData({ name: "" });
			fetchMakes(pagination.page, search);
		} catch (_error) {
			toast.error("Failed to update make");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this make?")) return;

		try {
			const response = await fetch(`/api/admin/makes/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete make");
			}

			toast.success("Make deleted successfully");
			fetchMakes(pagination.page, search);
		} catch (error: any) {
			toast.error(error.message || "Failed to delete make");
		}
	};

	const columns = [
		{
			key: "name" as keyof Make,
			header: "Name",
			render: (value: any) => <span className="font-medium">{value}</span>,
		},
		{
			key: "_count" as keyof Make,
			header: "Models",
			render: (value: any) => (
				<span className="text-sm">{value.models} models</span>
			),
		},
		{
			key: "_count" as keyof Make,
			header: "Vehicles",
			render: (value: any) => (
				<span className="text-sm">{value.vehicles} vehicles</span>
			),
		},
		{
			key: "actions" as keyof Make,
			header: "Actions",
			render: (_: any, item: Make) => (
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setEditingMake(item);
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
						placeholder="Search makes..."
						value={search}
						onChange={(e) => handleSearch(e.target.value)}
					/>
				</div>
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Make
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Make</DialogTitle>
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
								Create Make
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<DataTable
				data={makes}
				columns={columns}
				isLoading={loading}
				pagination={{
					...pagination,
					onPageChange: handlePageChange,
				}}
				disableSearch={true}
				emptyMessage="No makes found"
			/>

			<Dialog
				open={!!editingMake}
				onOpenChange={() => {
					setEditingMake(null);
					setFormData({ name: "" });
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Make</DialogTitle>
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
							Update Make
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
