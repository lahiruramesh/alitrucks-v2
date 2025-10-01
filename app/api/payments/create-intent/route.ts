import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
	throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(stripeSecretKey, {
	apiVersion: "2025-08-27.basil",
});

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

		const { bookingId, amount, currency = "usd" } = await request.json();

		// Validate input
		if (!bookingId || !amount) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Fetch booking details
		const booking = await prisma.booking.findFirst({
			where: {
				id: bookingId,
				buyerId: session.user.id,
				status: "PENDING",
			},
			include: {
				vehicle: {
					include: {
						make: true,
						seller: {
							select: {
								name: true,
								stripeAccountId: true,
							},
						},
					},
				},
				payments: true,
			},
		});

		if (!booking) {
			return NextResponse.json(
				{ error: "Booking not found or invalid" },
				{ status: 404 },
			);
		}

		// Check if payment already exists
		if (booking.payments.length > 0) {
			return NextResponse.json(
				{ error: "Payment already exists for this booking" },
				{ status: 400 },
			);
		}

		// Create Stripe PaymentIntent with authorization only
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount), // Amount in cents
			currency: currency.toLowerCase(),
			capture_method: "manual", // This creates a pre-authorization
			customer: session.user.email ? undefined : undefined, // We can create customer later
			metadata: {
				bookingId: booking.id,
				vehicleId: booking.vehicleId,
				buyerId: booking.buyerId,
				sellerId: booking.vehicle.sellerId,
			},
			description: `Vehicle rental: ${booking.vehicle.make?.name} ${booking.vehicle.modelName}`,
			automatic_payment_methods: {
				enabled: true,
			},
			// If seller has Stripe Connect account, set up for marketplace
			...(booking.vehicle.seller.stripeAccountId && {
				transfer_data: {
					destination: booking.vehicle.seller.stripeAccountId,
				},
				application_fee_amount: Math.round(amount * 0.05), // 5% platform fee
			}),
		});

		// Create payment record in database
		const payment = await prisma.payment.create({
			data: {
				bookingId: booking.id,
				amount: amount / 100, // Convert back to dollars for storage
				paymentStatus: "PENDING",
				stripePaymentIntentId: paymentIntent.id,
			},
		});

		return NextResponse.json({
			clientSecret: paymentIntent.client_secret,
			paymentIntentId: paymentIntent.id,
			paymentId: payment.id,
		});
	} catch (error) {
		console.error("Error creating payment intent:", error);

		if (error instanceof Stripe.errors.StripeError) {
			return NextResponse.json(
				{ error: `Payment error: ${error.message}` },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{ error: "Failed to create payment intent" },
			{ status: 500 },
		);
	}
}
