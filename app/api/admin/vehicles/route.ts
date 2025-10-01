import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
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

		const vehicles = await prisma.vehicle.findMany({
			include: {
				seller: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				make: {
					select: { name: true },
				},
				type: {
					select: { name: true },
				},
				approvals: {
					orderBy: { createdAt: "desc" },
					take: 1,
					select: {
						status: true,
						comments: true,
						createdAt: true,
					},
				},
			},
			orderBy: [
				{ status: "asc" },
				{ submittedAt: "desc" },
				{ createdAt: "desc" },
			],
		});

		// Transform data to include currentApproval
		const transformedVehicles = vehicles.map((vehicle) => {
			const { approvals, ...vehicleData } = vehicle;
			return {
				...vehicleData,
				currentApproval: approvals[0] || null,
			};
		});

		return NextResponse.json(transformedVehicles);
	} catch (error) {
		console.error("Error fetching vehicles:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
