"use client";

import { Calendar, Plus, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VehicleAvailability } from "@/types/vehicle";

interface AvailabilitySlot {
	startTime: string;
	endTime: string;
	isAvailable: boolean;
	price?: number;
}

interface VehicleAvailabilityManagerProps {
	vehicleId: string;
	pricePerDay: number;
	onSave?: () => void;
}

// Generate 30-minute time slots for 24 hours
const generateTimeSlots = () => {
	const slots = [];
	for (let hour = 0; hour < 24; hour++) {
		for (let minute = 0; minute < 60; minute += 30) {
			const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
			slots.push(timeString);
		}
	}
	return slots;
};

const TIME_SLOTS = generateTimeSlots();

export function VehicleAvailabilityManager({
	vehicleId,
	pricePerDay,
	onSave,
}: VehicleAvailabilityManagerProps) {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		new Date(),
	);
	const [_availabilities, setAvailabilities] = useState<VehicleAvailability[]>(
		[],
	);
	const [daySlots, setDaySlots] = useState<AvailabilitySlot[]>([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [showBulkDialog, setShowBulkDialog] = useState(false);
	const [bulkStartDate, setBulkStartDate] = useState<Date | undefined>();
	const [bulkEndDate, setBulkEndDate] = useState<Date | undefined>();
	const [bulkTimeSlots, setBulkTimeSlots] = useState<AvailabilitySlot[]>([]);

	const fetchAvailability = useCallback(async () => {
		if (!selectedDate) return;

		setLoading(true);
		try {
			const dateStr = selectedDate.toISOString().split("T")[0];
			const response = await fetch(
				`/api/vehicles/${vehicleId}/availability?date=${dateStr}`,
			);

			if (response.ok) {
				const data = await response.json();
				setAvailabilities(data);

				// Convert to day slots format
				const slots = TIME_SLOTS.map((time, index) => {
					const nextTime = TIME_SLOTS[index + 1] || "23:59";
					const existing = data.find((a: VehicleAvailability) => {
						const startTime = new Date(a.startTime).toTimeString().slice(0, 5);
						return startTime === time;
					});

					return {
						startTime: time,
						endTime: nextTime,
						isAvailable: existing?.isAvailable ?? false,
						price: existing?.price ?? pricePerDay,
					};
				});

				setDaySlots(slots);
			}
		} catch (error) {
			console.error("Error fetching availability:", error);
		} finally {
			setLoading(false);
		}
	}, [selectedDate, vehicleId, pricePerDay]); // useCallback dependencies

	const updateSlot = (index: number, updates: Partial<AvailabilitySlot>) => {
		setDaySlots((prev) =>
			prev.map((slot, i) => (i === index ? { ...slot, ...updates } : slot)),
		);
	};

	const toggleSlotAvailability = (index: number) => {
		updateSlot(index, { isAvailable: !daySlots[index].isAvailable });
	};

	const setAllSlots = (isAvailable: boolean) => {
		setDaySlots((prev) => prev.map((slot) => ({ ...slot, isAvailable })));
	};

	const saveAvailability = async () => {
		if (!selectedDate) return;

		setSaving(true);
		try {
			const availabilityData = {
				vehicleId,
				date: selectedDate.toISOString().split("T")[0],
				timeSlots: daySlots.map((slot) => ({
					startTime: slot.startTime,
					endTime: slot.endTime,
					isAvailable: slot.isAvailable,
					price: slot.price,
				})),
			};

			const response = await fetch(`/api/vehicles/${vehicleId}/availability`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(availabilityData),
			});

			if (response.ok) {
				await fetchAvailability(); // Refresh data
				onSave?.();
			}
		} catch (error) {
			console.error("Error saving availability:", error);
		} finally {
			setSaving(false);
		}
	};

	const saveBulkAvailability = async () => {
		if (!bulkStartDate || !bulkEndDate) return;

		setSaving(true);
		try {
			const response = await fetch(
				`/api/vehicles/${vehicleId}/availability/bulk`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						vehicleId,
						startDate: bulkStartDate.toISOString().split("T")[0],
						endDate: bulkEndDate.toISOString().split("T")[0],
						timeSlots: bulkTimeSlots,
					}),
				},
			);

			if (response.ok) {
				setShowBulkDialog(false);
				setBulkTimeSlots([]);
				await fetchAvailability(); // Refresh current day
				onSave?.();
			}
		} catch (error) {
			console.error("Error saving bulk availability:", error);
		} finally {
			setSaving(false);
		}
	};

	const addBulkTimeSlot = () => {
		setBulkTimeSlots((prev) => [
			...prev,
			{
				startTime: "09:00",
				endTime: "17:00",
				isAvailable: true,
				price: pricePerDay,
			},
		]);
	};

	const removeBulkTimeSlot = (index: number) => {
		setBulkTimeSlots((prev) => prev.filter((_, i) => i !== index));
	};

	const updateBulkTimeSlot = (
		index: number,
		updates: Partial<AvailabilitySlot>,
	) => {
		setBulkTimeSlots((prev) =>
			prev.map((slot, i) => (i === index ? { ...slot, ...updates } : slot)),
		);
	};

	useEffect(() => {
		if (selectedDate) {
			fetchAvailability();
		}
	}, [selectedDate, fetchAvailability]);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Availability Management
					</CardTitle>
					<CardDescription>
						Set your vehicle availability for specific dates and times
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Calendar */}
						<div className="lg:col-span-1">
							<CalendarComponent
								mode="single"
								selected={selectedDate}
								onSelect={setSelectedDate}
								className="rounded-md border"
								disabled={(date: Date) => date < new Date()}
							/>

							<div className="mt-4 space-y-2">
								<Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
									<DialogTrigger asChild>
										<Button
											variant="outline"
											className="w-full"
											onClick={() => setBulkTimeSlots([])}
										>
											<Plus className="h-4 w-4 mr-2" />
											Set Bulk Availability
										</Button>
									</DialogTrigger>
									<DialogContent className="max-w-2xl">
										<DialogHeader>
											<DialogTitle>Set Bulk Availability</DialogTitle>
											<DialogDescription>
												Set availability for multiple dates at once
											</DialogDescription>
										</DialogHeader>

										<div className="space-y-4">
											<div className="grid grid-cols-2 gap-4">
												<div>
													<Label>Start Date</Label>
													<Input
														type="date"
														value={
															bulkStartDate?.toISOString().split("T")[0] || ""
														}
														onChange={(e) =>
															setBulkStartDate(new Date(e.target.value))
														}
														min={new Date().toISOString().split("T")[0]}
													/>
												</div>
												<div>
													<Label>End Date</Label>
													<Input
														type="date"
														value={
															bulkEndDate?.toISOString().split("T")[0] || ""
														}
														onChange={(e) =>
															setBulkEndDate(new Date(e.target.value))
														}
														min={
															bulkStartDate?.toISOString().split("T")[0] ||
															new Date().toISOString().split("T")[0]
														}
													/>
												</div>
											</div>

											<div>
												<div className="flex items-center justify-between mb-2">
													<Label>Time Slots</Label>
													<Button size="sm" onClick={addBulkTimeSlot}>
														<Plus className="h-4 w-4 mr-1" />
														Add Slot
													</Button>
												</div>

												<div className="space-y-2 max-h-60 overflow-y-auto">
													{bulkTimeSlots.map((slot, index) => (
														<div
															key={`bulk-slot-${slot.startTime}-${slot.endTime}-${index}`}
															className="flex items-center gap-2 p-2 border rounded"
														>
															<select
																value={slot.startTime}
																onChange={(e) =>
																	updateBulkTimeSlot(index, {
																		startTime: e.target.value,
																	})
																}
																className="px-2 py-1 border rounded text-sm"
															>
																{TIME_SLOTS.map((time) => (
																	<option key={time} value={time}>
																		{time}
																	</option>
																))}
															</select>
															<span className="text-sm">to</span>
															<select
																value={slot.endTime}
																onChange={(e) =>
																	updateBulkTimeSlot(index, {
																		endTime: e.target.value,
																	})
																}
																className="px-2 py-1 border rounded text-sm"
															>
																{TIME_SLOTS.map((time) => (
																	<option key={time} value={time}>
																		{time}
																	</option>
																))}
															</select>
															<Input
																type="number"
																value={slot.price}
																onChange={(e) =>
																	updateBulkTimeSlot(index, {
																		price: parseFloat(e.target.value),
																	})
																}
																placeholder="Price"
																className="w-20 text-sm"
															/>
															<Button
																size="sm"
																variant="outline"
																onClick={() => removeBulkTimeSlot(index)}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													))}
												</div>
											</div>
										</div>

										<DialogFooter>
											<Button
												variant="outline"
												onClick={() => setShowBulkDialog(false)}
											>
												Cancel
											</Button>
											<Button
												onClick={saveBulkAvailability}
												disabled={
													saving ||
													!bulkStartDate ||
													!bulkEndDate ||
													bulkTimeSlots.length === 0
												}
											>
												{saving ? "Saving..." : "Save Bulk Availability"}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</div>

						{/* Time Slots */}
						<div className="lg:col-span-2">
							{selectedDate && (
								<div>
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-semibold">
											{selectedDate.toLocaleDateString()}
										</h3>
										<div className="flex gap-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() => setAllSlots(true)}
											>
												Select All
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() => setAllSlots(false)}
											>
												Clear All
											</Button>
											<Button onClick={saveAvailability} disabled={saving}>
												<Save className="h-4 w-4 mr-2" />
												{saving ? "Saving..." : "Save"}
											</Button>
										</div>
									</div>

									{loading ? (
										<div className="text-center py-8">Loading...</div>
									) : (
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
											{daySlots.map((slot, index) => (
												<button
													key={`day-slot-${slot.startTime}-${slot.endTime}-${index}`}
													type="button"
													className={`p-3 border rounded-lg cursor-pointer transition-colors text-left ${
														slot.isAvailable
															? "bg-green-50 border-green-200 hover:bg-green-100"
															: "bg-gray-50 border-gray-200 hover:bg-gray-100"
													}`}
													onClick={() => toggleSlotAvailability(index)}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															toggleSlotAvailability(index);
														}
													}}
												>
													<div className="flex items-center gap-2 mb-1">
														<Checkbox
															checked={slot.isAvailable}
															onChange={() => {}}
														/>
														<span className="text-sm font-medium">
															{slot.startTime} - {slot.endTime}
														</span>
													</div>
													{slot.isAvailable && (
														<Input
															type="number"
															value={slot.price}
															onChange={(e) =>
																updateSlot(index, {
																	price: parseFloat(e.target.value),
																})
															}
															onClick={(e) => e.stopPropagation()}
															className="mt-1 h-8 text-xs"
															placeholder="Price"
														/>
													)}
												</button>
											))}
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
