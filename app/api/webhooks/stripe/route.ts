import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
	try {
		const body = await request.text();
		const sig = request.headers.get("stripe-signature");

		if (!sig) {
			return NextResponse.json(
				{ error: "Missing stripe-signature header" },
				{ status: 400 },
			);
		}

		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
		if (!webhookSecret) {
			throw new Error("STRIPE_WEBHOOK_SECRET is not set");
		}

		let event: any;
		try {
			event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
		} catch (err) {
			console.error("Webhook signature verification failed:", err);
			return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
		}

		// Handle the event
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object;
				await handleCheckoutSessionCompleted(session);
				break;
			}

			case "setup_intent.succeeded": {
				const setupIntent = event.data.object;
				await handleSetupIntentSucceeded(setupIntent);
				break;
			}

			case "payment_intent.succeeded": {
				const paymentIntent = event.data.object;
				await handlePaymentIntentSucceeded(paymentIntent);
				break;
			}

			case "payment_intent.payment_failed": {
				const paymentIntent = event.data.object;
				await handlePaymentIntentFailed(paymentIntent);
				break;
			}

			case "account.updated": {
				const account = event.data.object;

				// Update our database with the latest account status
				await prisma.stripeAccount.update({
					where: { stripeAccountId: account.id },
					data: {
						detailsSubmitted: account.details_submitted,
						chargesEnabled: account.charges_enabled,
						payoutsEnabled: account.payouts_enabled,
						currentlyDue: account.requirements?.currently_due || [],
						eventuallyDue: account.requirements?.eventually_due || [],
						pastDue: account.requirements?.past_due || [],
						pendingVerification:
							account.requirements?.pending_verification || [],
					},
				});

				// Also update the user's verification status
				if (account.details_submitted && account.charges_enabled) {
					await prisma.user.update({
						where: { stripeAccountId: account.id },
						data: {
							stripeAccountVerified: true,
						},
					});
				}

				console.log("Account updated:", account.id);
				break;
			}

			case "account.application.deauthorized": {
				const account = event.data.object;

				// Mark account as deauthorized
				await prisma.stripeAccount.update({
					where: { stripeAccountId: account.id },
					data: {
						detailsSubmitted: false,
						chargesEnabled: false,
						payoutsEnabled: false,
					},
				});

				await prisma.user.update({
					where: { stripeAccountId: account.id },
					data: {
						stripeAccountVerified: false,
					},
				});

				console.log("Account deauthorized:", account.id);
				break;
			}

			case "payout.created": {
				const payout = event.data.object;

				// Ensure destination is a string (account ID)
				if (typeof payout.destination !== "string") {
					console.warn(
						"Payout destination is not a string:",
						payout.destination,
					);
					break;
				}

				// Find the associated Stripe account
				const stripeAccount = await prisma.stripeAccount.findUnique({
					where: { stripeAccountId: payout.destination },
				});

				if (stripeAccount) {
					await prisma.payout.create({
						data: {
							stripePayoutId: payout.id,
							stripeAccountId: payout.destination,
							amount: payout.amount,
							currency: payout.currency.toUpperCase(),
							status: "PENDING",
							description: payout.description,
							arrivalDate: payout.arrival_date
								? new Date(payout.arrival_date * 1000)
								: null,
							method: payout.method,
							type: payout.type,
						},
					});
				}

				console.log("Payout created:", payout.id);
				break;
			}

			case "payout.updated": {
				const payout = event.data.object;

				let status: "PENDING" | "IN_TRANSIT" | "PAID" | "FAILED" | "CANCELED" =
					"PENDING";

				switch (payout.status) {
					case "in_transit":
						status = "IN_TRANSIT";
						break;
					case "paid":
						status = "PAID";
						break;
					case "failed":
						status = "FAILED";
						break;
					case "canceled":
						status = "CANCELED";
						break;
					default:
						status = "PENDING";
				}

				await prisma.payout.update({
					where: { stripePayoutId: payout.id },
					data: {
						status,
						arrivalDate: payout.arrival_date
							? new Date(payout.arrival_date * 1000)
							: null,
						failureCode: payout.failure_code,
						failureMessage: payout.failure_message,
					},
				});

				console.log("Payout updated:", payout.id, "Status:", status);
				break;
			}

			default:
				console.log("Unhandled event type:", event.type);
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("Webhook error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

async function handleCheckoutSessionCompleted(session: any) {
	try {
		const bookingId = session.metadata?.booking_id;

		if (!bookingId) {
			console.error("No booking ID in checkout session metadata");
			return;
		}

		console.log(`Checkout session completed for booking: ${bookingId}`);
	} catch (error) {
		console.error("Error handling checkout session completed:", error);
	}
}

async function handleSetupIntentSucceeded(setupIntent: any) {
	try {
		const bookingId = setupIntent.metadata?.booking_id;

		if (!bookingId) {
			console.error("No booking ID in setup intent metadata");
			return;
		}

		// The setup intent succeeded, meaning we have a saved payment method
		// We can now create a payment intent when the booking is approved

		console.log(`Setup intent succeeded for booking: ${bookingId}`);
	} catch (error) {
		console.error("Error handling setup intent succeeded:", error);
	}
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
	try {
		const bookingId = paymentIntent.metadata?.booking_id;

		if (!bookingId) {
			console.error("No booking ID in payment intent metadata");
			return;
		}

		// Update payment status
		await prisma.payment.updateMany({
			where: {
				bookingId: bookingId,
				stripePaymentIntentId: paymentIntent.id,
			},
			data: {
				paymentStatus: "COMPLETED",
			},
		});

		console.log(`Payment intent succeeded for booking: ${bookingId}`);
	} catch (error) {
		console.error("Error handling payment intent succeeded:", error);
	}
}

async function handlePaymentIntentFailed(paymentIntent: any) {
	try {
		const bookingId = paymentIntent.metadata?.booking_id;

		if (!bookingId) {
			console.error("No booking ID in payment intent metadata");
			return;
		}

		// Update payment status
		await prisma.payment.updateMany({
			where: {
				bookingId: bookingId,
				stripePaymentIntentId: paymentIntent.id,
			},
			data: {
				paymentStatus: "FAILED",
			},
		});

		console.log(`Payment intent failed for booking: ${bookingId}`);
	} catch (error) {
		console.error("Error handling payment intent failed:", error);
	}
}
