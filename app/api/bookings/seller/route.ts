import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const page = parseInt(searchParams.get("page") || "1", 10);
		const limit = parseInt(searchParams.get("limit") || "20", 10);
		const offset = (page - 1) * limit; // Build where clause for seller's vehicles
		const where: any = {
			vehicle: {
				sellerId: session.user.id,
			},
		};

		if (status) {
			where.status = status;
		}

		const bookings = await prisma.booking.findMany({
			where,
			include: {
				vehicle: {
					include: {
						make: true,
						type: true,
					},
				},
				buyer: {
					select: {
						name: true,
						email: true,
						id: true,
					},
				},
				payments: true,
			},
			orderBy: [
				{ status: "asc" }, // Pending first
				{ createdAt: "desc" },
			],
			skip: offset,
			take: limit,
		});

		const totalCount = await prisma.booking.count({ where });

		return NextResponse.json({
			bookings,
			pagination: {
				page,
				limit,
				total: totalCount,
				pages: Math.ceil(totalCount / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching seller bookings:", error);
		return NextResponse.json(
			{ error: "Failed to fetch bookings" },
			{ status: 500 },
		);
	}
}
