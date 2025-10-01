import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const resolvedParams = await params;
		const vehicleId = resolvedParams.id;

		const vehicle = await prisma.vehicle.findFirst({
			where: {
				id: vehicleId,
				status: "APPROVED",
				isActive: true,
				isPublished: true,
			},
			include: {
				make: true,
				type: true,
				fuelType: true,
				seller: {
					select: {
						name: true,
						id: true,
					},
				},
				availabilities: {
					where: {
						date: {
							gte: new Date(),
						},
					},
					orderBy: {
						date: "asc",
					},
				},
				_count: {
					select: {
						approvals: true,
					},
				},
			},
		});

		if (!vehicle) {
			return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
		}

		return NextResponse.json(vehicle);
	} catch (error) {
		console.error("Error fetching vehicle details:", error);
		return NextResponse.json(
			{ error: "Failed to fetch vehicle details" },
			{ status: 500 },
		);
	}
}
