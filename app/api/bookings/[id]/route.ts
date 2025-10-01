import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get individual booking details
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
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

		const resolvedParams = await params;
		const bookingId = resolvedParams.id;

		const booking = await prisma.booking.findFirst({
			where: {
				id: bookingId,
				OR: [
					{ buyerId: session.user.id },
					{ vehicle: { sellerId: session.user.id } },
				],
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
								id: true,
							},
						},
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
		});

		if (!booking) {
			return NextResponse.json({ error: "Booking not found" }, { status: 404 });
		}

		return NextResponse.json(booking);
	} catch (error) {
		console.error("Error fetching booking:", error);
		return NextResponse.json(
			{ error: "Failed to fetch booking" },
			{ status: 500 },
		);
	}
}

// Update booking status (for sellers to approve/reject)
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
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

		const resolvedParams = await params;
		const bookingId = resolvedParams.id;
		const { status } = await request.json();

		// Validate status
		if (!["APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
			return NextResponse.json({ error: "Invalid status" }, { status: 400 });
		}

		// Find the booking and verify ownership
		const booking = await prisma.booking.findFirst({
			where: {
				id: bookingId,
			},
			include: {
				vehicle: {
					include: {
						seller: true,
					},
				},
				buyer: true,
				payments: true,
			},
		});

		if (!booking) {
			return NextResponse.json({ error: "Booking not found" }, { status: 404 });
		}

		// Check permissions
		const isOwner = booking.vehicle.sellerId === session.user.id;
		const isBuyer = booking.buyerId === session.user.id;

		if (status === "CANCELLED" && !isBuyer) {
			return NextResponse.json(
				{ error: "Only the buyer can cancel a booking" },
				{ status: 403 },
			);
		}

		if ((status === "APPROVED" || status === "REJECTED") && !isOwner) {
			return NextResponse.json(
				{ error: "Only the vehicle owner can approve or reject bookings" },
				{ status: 403 },
			);
		}

		// Check if booking can be modified
		if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
			return NextResponse.json(
				{ error: "This booking cannot be modified" },
				{ status: 400 },
			);
		}

		// Update the booking
		const updatedBooking = await prisma.booking.update({
			where: { id: bookingId },
			data: { status },
			include: {
				vehicle: {
					include: {
						make: true,
						type: true,
						seller: {
							select: {
								name: true,
								email: true,
								id: true,
							},
						},
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
		});

		// If booking is approved or rejected, handle payment
		if (status === "APPROVED" && booking.payments.length > 0) {
			// Capture the pre-authorized payment
			const payment = booking.payments[0];
			if (payment.stripePaymentIntentId) {
				try {
					const captureResponse = await fetch(
						`${process.env.NEXTAUTH_URL}/api/payments/capture`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Cookie: request.headers.get("cookie") || "",
							},
							body: JSON.stringify({
								paymentIntentId: payment.stripePaymentIntentId,
								bookingId: bookingId,
							}),
						},
					);

					if (!captureResponse.ok) {
						console.error("Failed to capture payment");
					}
				} catch (error) {
					console.error("Error capturing payment:", error);
				}
			}
		} else if (
			(status === "REJECTED" || status === "CANCELLED") &&
			booking.payments.length > 0
		) {
			// Release the pre-authorized payment
			const payment = booking.payments[0];
			if (payment.stripePaymentIntentId) {
				try {
					const releaseResponse = await fetch(
						`${process.env.NEXTAUTH_URL}/api/payments/release`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Cookie: request.headers.get("cookie") || "",
							},
							body: JSON.stringify({
								paymentIntentId: payment.stripePaymentIntentId,
								bookingId: bookingId,
							}),
						},
					);

					if (!releaseResponse.ok) {
						console.error("Failed to release payment");
					}
				} catch (error) {
					console.error("Error releasing payment:", error);
				}
			}
		}

		// Update availability slots
		if (status === "REJECTED" || status === "CANCELLED") {
			await prisma.vehicleAvailability.updateMany({
				where: {
					bookingId: bookingId,
				},
				data: {
					isBooked: false,
					bookingId: null,
				},
			});
		}

		return NextResponse.json(updatedBooking);
	} catch (error) {
		console.error("Error updating booking:", error);
		return NextResponse.json(
			{ error: "Failed to update booking" },
			{ status: 500 },
		);
	}
}
