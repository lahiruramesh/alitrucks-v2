import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const vehicle = await prisma.vehicle.findUnique({
			where: { id },
			include: {
				make: true,
				type: true,
				fuelType: true,
				seller: {
					select: {
						id: true,
						name: true,
						email: true,
						phoneNumber: true,
						city: true,
						country: true,
					},
				},
				bookings: {
					where: { isActive: true },
					include: {
						buyer: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
			},
		});

		if (!vehicle) {
			return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
		}

		return NextResponse.json(vehicle);
	} catch (error) {
		console.error("Error fetching vehicle:", error);
		return NextResponse.json(
			{ error: "Failed to fetch vehicle" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const vehicle = await prisma.vehicle.findUnique({
			where: { id },
		});

		if (!vehicle) {
			return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
		}

		// Check if user owns the vehicle or is admin
		if (vehicle.sellerId !== session.user.id && session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const body = await request.json();

		const updatedVehicle = await prisma.vehicle.update({
			where: { id },
			data: {
				...body,
				pricePerDay: body.pricePerDay
					? parseFloat(body.pricePerDay)
					: undefined,
			},
			include: {
				make: true,
				type: true,
				fuelType: true,
			},
		});

		return NextResponse.json(updatedVehicle);
	} catch (error) {
		console.error("Error updating vehicle:", error);
		return NextResponse.json(
			{ error: "Failed to update vehicle" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const vehicle = await prisma.vehicle.findUnique({
			where: { id },
		});

		if (!vehicle) {
			return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
		}

		// Check if user owns the vehicle or is admin
		if (vehicle.sellerId !== session.user.id && session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Soft delete
		const deletedVehicle = await prisma.vehicle.update({
			where: { id },
			data: { isActive: false },
		});

		return NextResponse.json(deletedVehicle);
	} catch (error) {
		console.error("Error deleting vehicle:", error);
		return NextResponse.json(
			{ error: "Failed to delete vehicle" },
			{ status: 500 },
		);
	}
}
