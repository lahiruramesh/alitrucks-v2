import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { startDate, endDate, timeSlots } = body;

		if (!startDate || !endDate || !Array.isArray(timeSlots)) {
			return NextResponse.json(
				{ error: "Invalid request data" },
				{ status: 400 },
			);
		}

		// Check if vehicle belongs to user
		const vehicle = await prisma.vehicle.findUnique({
			where: {
				id,
				sellerId: session.user.id,
			},
			select: { status: true },
		});

		if (!vehicle) {
			return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
		}

		if (!["APPROVED", "PUBLISHED"].includes(vehicle.status)) {
			return NextResponse.json(
				{
					error: "Vehicle must be approved before setting availability",
				},
				{ status: 400 },
			);
		}

		const start = new Date(startDate);
		const end = new Date(endDate);
		const dates = [];

		// Generate all dates in the range
		for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
			dates.push(new Date(d));
		}

		// Process each date
		const availabilityData = [];

		for (const date of dates) {
			// Delete existing availability for this date
			await prisma.vehicleAvailability.deleteMany({
				where: {
					vehicleId: id,
					date: date,
				},
			});

			// Add new slots for this date
			for (const slot of timeSlots) {
				if (slot.isAvailable) {
					availabilityData.push({
						vehicleId: id,
						date: date,
						startTime: new Date(
							`${date.toISOString().split("T")[0]}T${slot.startTime}:00`,
						),
						endTime: new Date(
							`${date.toISOString().split("T")[0]}T${slot.endTime}:00`,
						),
						isAvailable: true,
						price: slot.price || null,
					});
				}
			}
		}

		if (availabilityData.length > 0) {
			await prisma.vehicleAvailability.createMany({
				data: availabilityData,
			});
		}

		return NextResponse.json({
			success: true,
			created: availabilityData.length,
			dates: dates.length,
		});
	} catch (error) {
		console.error("Error saving bulk availability:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
