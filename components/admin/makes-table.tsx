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

interface Make {
	id: string;
	name: string;
	_count: {
		models: number;
		vehicles: number;
	};
}

export function MakesTable() {
	const t = useTranslations("admin.vehicleManagement.makes");
	const tCommon = useTranslations("common");

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

	const fetchMakes = useCallback(
		async (page = 1, searchTerm = "") => {
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
		},
		[pagination.limit],
	);

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

			toast.success(t("created", { name: formData.name }));
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

			toast.success(t("updated", { name: formData.name }));
			setEditingMake(null);
			setFormData({ name: "" });
			fetchMakes(pagination.page, search);
		} catch (_error) {
			toast.error("Failed to update make");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm(t("confirmDelete"))) return;

		try {
			const response = await fetch(`/api/admin/makes/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete make");
			}

			toast.success(t("deleted"));
			fetchMakes(pagination.page, search);
		} catch (error: any) {
			toast.error(error.message || "Failed to delete make");
		}
	};

	const columns: ResponsiveColumn<Make>[] = [
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
			key: "_count",
			header: t("models"),
			mobileLabel: t("models"),
			priority: "medium",
			sortable: true,
			render: (value: any) => (
				<span className="text-sm">
					{value.models} {t("models").toLowerCase()}
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

	const _actions: ResponsiveAction<Make>[] = [
		{
			label: tCommon("edit"),
			icon: <Edit className="h-4 w-4" />,
			onClick: (item: Make) => {
				setEditingMake(item);
				setFormData({ name: item.name });
			},
		},
		{
			label: tCommon("delete"),
			icon: <Trash2 className="h-4 w-4" />,
			variant: "destructive",
			onClick: (item: Make) => handleDelete(item.id),
			show: (item: Make) => item._count.vehicles === 0,
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
							<Button onClick={handleCreate} className="w-full">
								{t("create")}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<ResponsiveDataTable
				data={makes}
				columns={columns}
				isLoading={loading}
				pagination={{
					...pagination,
					onPageChange: handlePageChange,
				}}
				disableSearch={true}
				emptyMessage={t("noMakesFound")}
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
						<Button onClick={handleEdit} className="w-full">
							{t("update")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
