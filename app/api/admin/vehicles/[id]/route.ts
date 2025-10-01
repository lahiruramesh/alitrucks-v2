import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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

		// Check if user is admin
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { role: true },
		});

		if (user?.role !== "ADMIN") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const vehicle = await prisma.vehicle.findUnique({
			where: { id },
			include: {
				seller: {
					select: {
						id: true,
						name: true,
						email: true,
						phoneNumber: true,
						companyName: true,
					},
				},
				make: {
					select: { name: true },
				},
				type: {
					select: { name: true },
				},
				fuelType: {
					select: { name: true },
				},
				approvals: {
					include: {
						reviewer: {
							select: {
								name: true,
								email: true,
							},
						},
					},
					orderBy: { createdAt: "desc" },
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
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
