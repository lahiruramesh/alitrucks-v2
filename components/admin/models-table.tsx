"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DataTable } from "../ui/data-table";

interface Model {
	id: string;
	name: string;
	makeId: string;
	make: {
		id: string;
		name: string;
	};
	_count: {
		vehicles: number;
	};
}

interface Make {
	id: string;
	name: string;
}

export function ModelsTable() {
	const _t = useTranslations("admin.vehicleManagement.models");
	const _tCommon = useTranslations("common");

	const [models, setModels] = useState<Model[]>([]);
	const [makes, setMakes] = useState<Make[]>([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	});
	const [search, setSearch] = useState("");
	const [selectedMake, setSelectedMake] = useState("all");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingModel, setEditingModel] = useState<Model | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		makeId: "",
	});

	const fetchMakes = useCallback(async () => {
		try {
			const response = await fetch("/api/admin/makes?limit=1000");
			if (!response.ok) throw new Error("Failed to fetch makes");
			const data = await response.json();
			setMakes(data.makes);
		} catch (_error) {
			toast.error("Failed to fetch makes");
		}
	}, []);

	const fetchModels = useCallback(
		async (page = 1, searchTerm = "", makeId = "") => {
			try {
				setLoading(true);
				const params = new URLSearchParams({
					page: page.toString(),
					limit: pagination.limit.toString(),
					search: searchTerm,
				});

				if (makeId) {
					params.append("makeId", makeId);
				}

				const response = await fetch(`/api/admin/models?${params}`);
				if (!response.ok) throw new Error("Failed to fetch models");

				const data = await response.json();
				setModels(data.models);
				setPagination(data.pagination);
			} catch (_error) {
				toast.error("Failed to fetch models");
			} finally {
				setLoading(false);
			}
		},
		[pagination.limit],
	);

	useEffect(() => {
		fetchMakes();
		fetchModels();
	}, [fetchMakes, fetchModels]);

	const handleSearch = (value: string) => {
		setSearch(value);
		fetchModels(1, value, selectedMake === "all" ? "" : selectedMake);
	};

	const handleMakeFilter = (makeId: string) => {
		setSelectedMake(makeId);
		fetchModels(1, search, makeId === "all" ? "" : makeId);
	};

	const handlePageChange = (page: number) => {
		fetchModels(page, search, selectedMake === "all" ? "" : selectedMake);
	};

	const handleCreate = async () => {
		try {
			const response = await fetch("/api/admin/models", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) throw new Error("Failed to create model");

			toast.success("Model created successfully");
			setIsCreateOpen(false);
			setFormData({ name: "", makeId: "" });
			fetchModels(1, search, selectedMake === "all" ? "" : selectedMake);
		} catch (_error) {
			toast.error("Failed to create model");
		}
	};

	const handleEdit = async () => {
		if (!editingModel) return;

		try {
			const response = await fetch(`/api/admin/models/${editingModel.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) throw new Error("Failed to update model");

			toast.success("Model updated successfully");
			setEditingModel(null);
			setFormData({ name: "", makeId: "" });
			fetchModels(
				pagination.page,
				search,
				selectedMake === "all" ? "" : selectedMake,
			);
		} catch (_error) {
			toast.error("Failed to update model");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this model?")) return;

		try {
			const response = await fetch(`/api/admin/models/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete model");
			}

			toast.success("Model deleted successfully");
			fetchModels(
				pagination.page,
				search,
				selectedMake === "all" ? "" : selectedMake,
			);
		} catch (error: any) {
			toast.error(error.message || "Failed to delete model");
		}
	};

	const columns = [
		{
			key: "name" as keyof Model,
			header: "Name",
			render: (value: any) => <span className="font-medium">{value}</span>,
		},
		{
			key: "make" as keyof Model,
			header: "Make",
			render: (value: any) => (
				<span className="text-muted-foreground">{value.name}</span>
			),
		},
		{
			key: "_count" as keyof Model,
			header: "Vehicles",
			render: (value: any) => (
				<span className="text-sm">{value.vehicles} vehicles</span>
			),
		},
		{
			key: "actions" as keyof Model,
			header: "Actions",
			render: (_: any, item: Model) => (
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setEditingModel(item);
							setFormData({
								name: item.name,
								makeId: item.makeId,
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
			<div className="flex justify-between items-center gap-4">
				<div className="flex gap-4 flex-1">
					<div className="flex-1 max-w-sm">
						<Input
							placeholder="Search models..."
							value={search}
							onChange={(e) => handleSearch(e.target.value)}
						/>
					</div>
					<Select value={selectedMake} onValueChange={handleMakeFilter}>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Filter by make" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All makes</SelectItem>
							{makes.map((make) => (
								<SelectItem key={make.id} value={make.id}>
									{make.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Model
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Model</DialogTitle>
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
								<Label htmlFor="make">Make</Label>
								<Select
									value={formData.makeId}
									onValueChange={(value) =>
										setFormData({ ...formData, makeId: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a make" />
									</SelectTrigger>
									<SelectContent>
										{makes.map((make) => (
											<SelectItem key={make.id} value={make.id}>
												{make.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<Button onClick={handleCreate} className="w-full">
								Create Model
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<DataTable
				data={models}
				columns={columns}
				isLoading={loading}
				pagination={{
					...pagination,
					onPageChange: handlePageChange,
				}}
				disableSearch={true}
				emptyMessage="No models found"
			/>

			<Dialog
				open={!!editingModel}
				onOpenChange={() => {
					setEditingModel(null);
					setFormData({ name: "", makeId: "" });
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Model</DialogTitle>
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
							<Label htmlFor="edit-make">Make</Label>
							<Select
								value={formData.makeId}
								onValueChange={(value) =>
									setFormData({ ...formData, makeId: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a make" />
								</SelectTrigger>
								<SelectContent>
									{makes.map((make) => (
										<SelectItem key={make.id} value={make.id}>
											{make.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<Button onClick={handleEdit} className="w-full">
							Update Model
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
