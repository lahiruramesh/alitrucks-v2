import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
	_request: NextRequest,
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

		// Check if vehicle exists and belongs to user
		const vehicle = await prisma.vehicle.findUnique({
			where: {
				id,
				sellerId: session.user.id,
			},
			select: {
				status: true,
				modelName: true,
				makeId: true,
				typeId: true,
				fuelTypeId: true,
				images: true,
			},
		});

		if (!vehicle) {
			return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
		}

		if (vehicle.status !== "DRAFT" && vehicle.status !== "REJECTED") {
			return NextResponse.json(
				{
					error: "Vehicle cannot be submitted in current status",
				},
				{ status: 400 },
			);
		}

		// Basic validation - ensure required fields are present
		if (
			!vehicle.modelName ||
			!vehicle.makeId ||
			!vehicle.typeId ||
			!vehicle.fuelTypeId
		) {
			return NextResponse.json(
				{
					error: "Vehicle missing required information",
				},
				{ status: 400 },
			);
		}

		if (vehicle.images.length === 0) {
			return NextResponse.json(
				{
					error: "At least one photo is required",
				},
				{ status: 400 },
			);
		}

		// Update vehicle status to pending
		const updatedVehicle = await prisma.vehicle.update({
			where: { id },
			data: {
				status: "PENDING",
				submittedAt: new Date(),
			},
		});

		return NextResponse.json(updatedVehicle);
	} catch (error) {
		console.error("Error submitting vehicle:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
