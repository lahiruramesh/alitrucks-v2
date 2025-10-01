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
	type ResponsiveAction,
	type ResponsiveColumn,
	ResponsiveDataTable,
} from "@/components/ui/responsive-data-table";
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
	const t = useTranslations("admin.vehicleManagement.vehicleTypes");
	const tCommon = useTranslations("common");

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

	const fetchVehicleTypes = useCallback(
		async (page = 1, searchTerm = "") => {
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
		},
		[pagination.limit],
	);

	useEffect(() => {
		fetchVehicleTypes();
	}, [fetchVehicleTypes]);

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

			toast.success(t("created", { name: formData.name }));
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

			toast.success(t("updated", { name: formData.name }));
			setEditingType(null);
			setFormData({ name: "", description: "" });
			fetchVehicleTypes(pagination.page, search);
		} catch (_error) {
			toast.error("Failed to update vehicle type");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm(t("confirmDelete"))) return;

		try {
			const response = await fetch(`/api/admin/vehicle-types/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete vehicle type");
			}

			toast.success(t("deleted"));
			fetchVehicleTypes(pagination.page, search);
		} catch (error: any) {
			toast.error(error.message || "Failed to delete vehicle type");
		}
	};

	const columns: ResponsiveColumn<VehicleType>[] = [
		{
			key: "name",
			header: t("name"),
			mobileLabel: t("name"),
			priority: "high",
			sortable: true,
			searchable: true,
			render: (value: any) => <span className="font-medium">{value}</span>,
		},
		{
			key: "description",
			header: t("description"),
			mobileLabel: t("description"),
			priority: "medium",
			hideOnMobile: false,
			render: (value: any) => (
				<span className="text-muted-foreground">
					{value || t("noDescription")}
				</span>
			),
		},
		{
			key: "_count",
			header: t("vehicles"),
			mobileLabel: t("vehicles"),
			priority: "medium",
			sortable: true,
			render: (value: any) => (
				<span className="text-sm">
					{value.vehicles} {t("vehicles").toLowerCase()}
				</span>
			),
		},
	];

	const actions: ResponsiveAction<VehicleType>[] = [
		{
			label: tCommon("edit"),
			icon: <Edit className="h-4 w-4" />,
			onClick: (item: VehicleType) => {
				setEditingType(item);
				setFormData({
					name: item.name,
					description: item.description || "",
				});
			},
		},
		{
			label: tCommon("delete"),
			icon: <Trash2 className="h-4 w-4" />,
			variant: "destructive",
			onClick: (item: VehicleType) => handleDelete(item.id),
			show: (item: VehicleType) => item._count.vehicles === 0,
		},
	];

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<div className="flex-1 max-w-sm">
					<Input
						placeholder={t("searchPlaceholder")}
						value={search}
						onChange={(e) => handleSearch(e.target.value)}
					/>
				</div>
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							{t("add")}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("create")}</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label htmlFor="name">{t("name")}</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
								/>
							</div>
							<div>
								<Label htmlFor="description">{t("description")}</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
								/>
							</div>
							<Button onClick={handleCreate} className="w-full">
								{t("create")}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<ResponsiveDataTable
				data={vehicleTypes}
				columns={columns}
				actions={actions}
				isLoading={loading}
				pagination={{
					...pagination,
					onPageChange: handlePageChange,
				}}
				disableSearch={true}
				emptyMessage={t("noTypesFound")}
				mobileCardView={true}
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
						<DialogTitle>{t("edit")}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="edit-name">{t("name")}</Label>
							<Input
								id="edit-name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
							/>
						</div>
						<div>
							<Label htmlFor="edit-description">{t("description")}</Label>
							<Textarea
								id="edit-description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
							/>
						</div>
						<Button onClick={handleEdit} className="w-full">
							{t("update")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
