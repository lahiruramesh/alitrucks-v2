import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
	throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(stripeSecretKey, {
	apiVersion: "2025-08-27.basil",
});

// Release pre-authorized payment (when booking is rejected/cancelled)
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

		const { paymentIntentId, bookingId } = await request.json();

		if (!paymentIntentId || !bookingId) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Verify booking and payment
		const booking = await prisma.booking.findFirst({
			where: {
				id: bookingId,
				OR: [
					{ vehicle: { sellerId: session.user.id } }, // Seller can release
					{ buyerId: session.user.id }, // Buyer can release (for cancellation)
				],
				status: {
					in: ["REJECTED", "CANCELLED"],
				},
			},
			include: {
				payments: {
					where: {
						stripePaymentIntentId: paymentIntentId,
					},
				},
			},
		});

		if (!booking || booking.payments.length === 0) {
			return NextResponse.json(
				{ error: "Booking or payment not found" },
				{ status: 404 },
			);
		}

		const payment = booking.payments[0];

		if (
			payment.paymentStatus === "REFUNDED" ||
			payment.paymentStatus === "FAILED"
		) {
			return NextResponse.json(
				{ error: "Payment already released" },
				{ status: 400 },
			);
		}

		// Cancel the payment intent in Stripe (releases the authorization)
		const cancelledPaymentIntent =
			await stripe.paymentIntents.cancel(paymentIntentId);

		// Update payment status in database
		const updatedPayment = await prisma.payment.update({
			where: { id: payment.id },
			data: {
				paymentStatus: "REFUNDED",
			},
		});

		return NextResponse.json({
			success: true,
			paymentIntent: cancelledPaymentIntent,
			payment: updatedPayment,
		});
	} catch (error) {
		console.error("Error releasing payment:", error);

		if (error instanceof Stripe.errors.StripeError) {
			return NextResponse.json(
				{ error: `Stripe error: ${error.message}` },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{ error: "Failed to release payment" },
			{ status: 500 },
		);
	}
}
