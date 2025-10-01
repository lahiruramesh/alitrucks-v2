import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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

		const { searchParams } = new URL(request.url);
		const date = searchParams.get("date");

		if (!date) {
			return NextResponse.json(
				{ error: "Date parameter required" },
				{ status: 400 },
			);
		}

		// Check if vehicle belongs to user or if user is admin
		const vehicle = await prisma.vehicle.findUnique({
			where: { id },
			select: { sellerId: true },
		});

		if (!vehicle) {
			return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { role: true },
		});

		if (vehicle.sellerId !== session.user.id && user?.role !== "admin") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const availabilities = await prisma.vehicleAvailability.findMany({
			where: {
				vehicleId: id,
				date: new Date(date),
			},
			orderBy: { startTime: "asc" },
		});

		return NextResponse.json(availabilities);
	} catch (error) {
		console.error("Error fetching availability:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

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
		const { date, timeSlots } = body;

		if (!date || !Array.isArray(timeSlots)) {
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

		// Delete existing availability for the date
		await prisma.vehicleAvailability.deleteMany({
			where: {
				vehicleId: id,
				date: new Date(date),
			},
		});

		// Create new availability slots
		const availabilityData = timeSlots
			.filter((slot: any) => slot.isAvailable)
			.map((slot: any) => ({
				vehicleId: id,
				date: new Date(date),
				startTime: new Date(`${date}T${slot.startTime}:00`),
				endTime: new Date(`${date}T${slot.endTime}:00`),
				isAvailable: true,
				price: slot.price || null,
			}));

		if (availabilityData.length > 0) {
			await prisma.vehicleAvailability.createMany({
				data: availabilityData,
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error saving availability:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
