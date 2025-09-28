import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const sellerId = searchParams.get("sellerId");
		const page = parseInt(searchParams.get("page") || "1", 10);
		const limit = parseInt(searchParams.get("limit") || "10", 10);
		const skip = (page - 1) * limit;

		const where: any = { isActive: true };

		// If sellerId is provided, filter by seller
		if (sellerId) {
			where.sellerId = sellerId;
		}

		const [vehicles, total] = await Promise.all([
			prisma.vehicle.findMany({
				where,
				include: {
					make: true,
					type: true,
					fuelType: true,
					seller: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.vehicle.count({ where }),
		]);

		return NextResponse.json({
			vehicles,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching vehicles:", error);
		return NextResponse.json(
			{ error: "Failed to fetch vehicles" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (
			!session ||
			(session.user.role !== "SELLER" && session.user.role !== "ADMIN")
		) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();

		// Calculate carbon footprint if not provided
		let carbonFootprint = body.carbonFootprint;
		if (!carbonFootprint && body.fuelTypeId && body.year) {
			// Simple calculation based on vehicle age and fuel type
			// This should be replaced with the actual Anthesis calculator
			const age = new Date().getFullYear() - body.year;
			const baseCO2 = body.fuelTypeId === 1 ? 97359 : 85000; // Diesel vs other
			carbonFootprint = baseCO2 + age * 1000;
		}

		const vehicle = await prisma.vehicle.create({
			data: {
				...body,
				sellerId: session.user.id,
				carbonFootprint,
				pricePerDay: parseFloat(body.pricePerDay),
				images: body.images || [],
			},
			include: {
				make: true,
				type: true,
				fuelType: true,
			},
		});

		return NextResponse.json(vehicle, { status: 201 });
	} catch (error) {
		console.error("Error creating vehicle:", error);
		return NextResponse.json(
			{ error: "Failed to create vehicle" },
			{ status: 500 },
		);
	}
}
