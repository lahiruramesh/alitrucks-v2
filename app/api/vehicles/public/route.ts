import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		// Pagination
		const page = parseInt(searchParams.get("page") || "1", 10);
		const limit = parseInt(searchParams.get("limit") || "20", 10);
		const offset = (page - 1) * limit;

		// Filters
		const location = searchParams.get("location");
		const vehicleType = searchParams.get("vehicleType");
		const minPrice = searchParams.get("minPrice");
		const maxPrice = searchParams.get("maxPrice");
		const capacity = searchParams.get("capacity");
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");
		const status = searchParams.get("status") || "APPROVED";

		// Build where clause
		const where: any = {
			status: status,
			isActive: true,
			isPublished: true,
		};

		// Location filter (search in city and region)
		if (location) {
			where.OR = [
				{ city: { contains: location, mode: "insensitive" } },
				{ region: { contains: location, mode: "insensitive" } },
			];
		}

		// Vehicle type filter
		if (vehicleType) {
			where.typeId = parseInt(vehicleType, 10);
		}

		// Price range filter
		if (minPrice || maxPrice) {
			where.pricePerDay = {};
			if (minPrice) where.pricePerDay.gte = parseFloat(minPrice);
			if (maxPrice) where.pricePerDay.lte = parseFloat(maxPrice);
		}

		// Capacity filter (using numberOfSeats as proxy)
		if (capacity) {
			switch (capacity) {
				case "1-2":
					where.numberOfSeats = { gte: 1, lte: 2 };
					break;
				case "3-5":
					where.numberOfSeats = { gte: 3, lte: 5 };
					break;
				case "6-10":
					where.numberOfSeats = { gte: 6, lte: 10 };
					break;
				case "10+":
					where.numberOfSeats = { gte: 10 };
					break;
			}
		}

		// Date availability filter
		if (startDate && endDate) {
			const start = new Date(startDate);
			const end = new Date(endDate);

			// Find vehicles that have availability in the requested date range
			where.availabilities = {
				some: {
					date: {
						gte: start,
						lte: end,
					},
					isAvailable: true,
					isBooked: false,
				},
			};
		}

		// Fetch vehicles with relations
		const vehicles = await prisma.vehicle.findMany({
			where,
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
					take: 10,
				},
				_count: {
					select: {
						approvals: true,
					},
				},
			},
			orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
			skip: offset,
			take: limit,
		});

		// Get total count for pagination
		const totalCount = await prisma.vehicle.count({ where });

		return NextResponse.json({
			vehicles,
			pagination: {
				page,
				limit,
				total: totalCount,
				pages: Math.ceil(totalCount / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching public vehicles:", error);
		return NextResponse.json(
			{ error: "Failed to fetch vehicles" },
			{ status: 500 },
		);
	}
}
