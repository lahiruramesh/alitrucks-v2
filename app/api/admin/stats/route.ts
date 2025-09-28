import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const [
			totalUsers,
			totalVehicles,
			totalBookings,
			activeVehicles,
			pendingBookings,
			recentUsers,
			recentVehicles,
		] = await Promise.all([
			prisma.user.count(),
			prisma.vehicle.count(),
			prisma.booking.count(),
			prisma.vehicle.count({ where: { isActive: true } }),
			prisma.booking.count({ where: { status: "PENDING" } }),
			prisma.user.findMany({
				take: 5,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					createdAt: true,
				},
			}),
			prisma.vehicle.findMany({
				take: 5,
				orderBy: { createdAt: "desc" },
				include: {
					make: true,
					seller: {
						select: {
							name: true,
							email: true,
						},
					},
				},
			}),
		]);

		const stats = {
			totalUsers,
			totalVehicles,
			totalBookings,
			activeVehicles,
			pendingBookings,
			recentUsers,
			recentVehicles,
		};

		return NextResponse.json(stats);
	} catch (error) {
		console.error("Error fetching admin stats:", error);
		return NextResponse.json(
			{ error: "Failed to fetch statistics" },
			{ status: 500 },
		);
	}
}
