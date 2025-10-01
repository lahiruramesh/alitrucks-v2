import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Create a new booking
export async function POST(request: NextRequest) {
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

		const { vehicleId, startDate, endDate, totalPrice } = await request.json();

		// Validate required fields
		if (!vehicleId || !startDate || !endDate || !totalPrice) {
			return NextResponse.json(
				{ error: "Missing required booking information" },
				{ status: 400 },
			);
		}

		// Convert dates
		const start = new Date(startDate);
		const end = new Date(endDate);

		// Validate dates
		if (start >= end) {
			return NextResponse.json(
				{ error: "End date must be after start date" },
				{ status: 400 },
			);
		}

		if (start < new Date()) {
			return NextResponse.json(
				{ error: "Start date cannot be in the past" },
				{ status: 400 },
			);
		}

		// Check if vehicle exists and is available
		const vehicle = await prisma.vehicle.findFirst({
			where: {
				id: vehicleId,
				status: "APPROVED",
				isActive: true,
				isPublished: true,
			},
			include: {
				seller: true,
			},
		});

		if (!vehicle) {
			return NextResponse.json(
				{ error: "Vehicle not found or not available" },
				{ status: 404 },
			);
		}

		// Check if user is trying to book their own vehicle
		if (vehicle.sellerId === session.user.id) {
			return NextResponse.json(
				{ error: "You cannot book your own vehicle" },
				{ status: 400 },
			);
		}

		// Check for conflicts with existing bookings
		const conflictingBooking = await prisma.booking.findFirst({
			where: {
				vehicleId,
				status: {
					in: ["PENDING", "APPROVED"],
				},
				OR: [
					{
						startDate: {
							lte: end,
						},
						endDate: {
							gte: start,
						},
					},
				],
			},
		});

		if (conflictingBooking) {
			return NextResponse.json(
				{ error: "Vehicle is not available for the selected dates" },
				{ status: 409 },
			);
		}

		// Create the booking
		const booking = await prisma.booking.create({
			data: {
				vehicleId,
				buyerId: session.user.id,
				startDate: start,
				endDate: end,
				totalPrice,
				status: "PENDING",
			},
			include: {
				vehicle: {
					include: {
						make: true,
						type: true,
						seller: {
							select: {
								name: true,
								email: true,
							},
						},
					},
				},
				buyer: {
					select: {
						name: true,
						email: true,
					},
				},
			},
		});

		// Mark availability slots as booked
		await prisma.vehicleAvailability.updateMany({
			where: {
				vehicleId,
				date: {
					gte: start,
					lte: end,
				},
				isAvailable: true,
			},
			data: {
				isBooked: true,
				bookingId: booking.id,
			},
		});

		return NextResponse.json(booking, { status: 201 });
	} catch (error) {
		console.error("Error creating booking:", error);
		return NextResponse.json(
			{ error: "Failed to create booking" },
			{ status: 500 },
		);
	}
}

// Get user's bookings
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
		const limit = parseInt(searchParams.get("limit") || "10", 10);
		const offset = (page - 1) * limit;
		const where: any = {
			buyerId: session.user.id,
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
						seller: {
							select: {
								name: true,
								email: true,
							},
						},
					},
				},
				payments: true,
			},
			orderBy: {
				createdAt: "desc",
			},
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
		console.error("Error fetching bookings:", error);
		return NextResponse.json(
			{ error: "Failed to fetch bookings" },
			{ status: 500 },
		);
	}
}
