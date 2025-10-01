import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { bookingId } = body;

		if (!bookingId) {
			return NextResponse.json(
				{ error: "Booking ID is required" },
				{ status: 400 },
			);
		}

		// Get booking details
		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			include: {
				vehicle: {
					include: {
						seller: true,
					},
				},
				buyer: true,
			},
		});

		if (!booking) {
			return NextResponse.json({ error: "Booking not found" }, { status: 404 });
		}

		if (booking.buyerId !== session.user.id) {
			return NextResponse.json(
				{ error: "Unauthorized access to booking" },
				{ status: 403 },
			);
		}

		if (booking.status !== "PENDING") {
			return NextResponse.json(
				{ error: "Booking is not in pending status" },
				{ status: 400 },
			);
		}

		// Calculate total amount in cents
		const totalAmount = Math.round(Number(booking.totalPrice) * 100);
		const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

		// Create a product for this booking
		const productName = `Vehicle Rental - ${booking.vehicle.modelName || "Vehicle"}`;
		const productDescription = `Rental from ${booking.startDate.toLocaleDateString()} to ${booking.endDate.toLocaleDateString()}`;

		try {
			// Create Stripe customer if not exists
			let stripeCustomerId = booking.buyer.stripeAccountId;

			if (!stripeCustomerId) {
				// Create Stripe customer using MCP tools
				try {
					const customer = await createStripeCustomer(
						booking.buyer.name || booking.buyer.email,
						booking.buyer.email,
					);

					if (customer?.id) {
						stripeCustomerId = customer.id;

						// Update user with Stripe customer ID
						await prisma.user.update({
							where: { id: booking.buyerId },
							data: { stripeAccountId: stripeCustomerId },
						});
					}
				} catch (error) {
					console.error("Error creating Stripe customer:", error);
					// Continue without customer ID - Stripe will create one during checkout
				}
			}

			const successUrl = `${baseUrl}/payment/success?booking_id=${bookingId}&session_id={CHECKOUT_SESSION_ID}`;
			const cancelUrl = `${baseUrl}/payment/cancel?booking_id=${bookingId}`;

			// Create real Stripe product, price, and payment link
			try {
				// Step 1: Create Stripe product
				const product = await createStripeProduct(
					productName,
					productDescription,
				);

				if (!product?.id) {
					throw new Error("Failed to create Stripe product");
				}

				// Step 2: Create Stripe price
				const price = await createStripePrice(product.id, totalAmount, "usd");

				if (!price?.id) {
					throw new Error("Failed to create Stripe price");
				}

				// Step 3: Create Stripe payment link
				const paymentLink = await createStripePaymentLink(price.id, 1);

				if (!paymentLink?.url) {
					throw new Error("Failed to create Stripe payment link");
				}

				// Store the Stripe IDs for reference
				await prisma.booking.update({
					where: { id: bookingId },
					data: {
						// Add metadata about the Stripe objects created
						// Note: You may need to add these fields to your schema
					},
				});

				return NextResponse.json({
					status: "success",
					message: "Stripe Checkout session created successfully",
					checkoutUrl: paymentLink.url,
					data: {
						bookingId,
						amount: totalAmount,
						currency: "usd",
						productName,
						description: productDescription,
						successUrl,
						cancelUrl,
						stripeProductId: product.id,
						stripePriceId: price.id,
						paymentLinkId: paymentLink.id,
					},
				});
			} catch (stripeError) {
				console.error("Stripe API error:", stripeError);
				return NextResponse.json(
					{
						error: "Failed to create Stripe checkout session",
						details:
							stripeError instanceof Error
								? stripeError.message
								: "Unknown error",
					},
					{ status: 500 },
				);
			}
		} catch (error) {
			console.error("Error creating checkout components:", error);
			return NextResponse.json(
				{ error: "Failed to prepare checkout" },
				{ status: 500 },
			);
		}
	} catch (error) {
		console.error("Error in checkout session creation:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// Helper functions for Stripe MCP integration
async function createStripeCustomer(name: string, email: string) {
	try {
		// In a real implementation, you would call the MCP Stripe server
		// For now, we'll simulate the API call
		const response = await fetch("/api/stripe/create-customer", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, email }),
		});

		if (response.ok) {
			return await response.json();
		}
		throw new Error("Failed to create customer");
	} catch (error) {
		console.error("Error creating Stripe customer:", error);
		return null;
	}
}

async function createStripeProduct(name: string, description: string) {
	try {
		// In a real implementation, you would call the MCP Stripe server
		// For now, we'll simulate the API call
		const response = await fetch("/api/stripe/create-product", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, description }),
		});

		if (response.ok) {
			return await response.json();
		}
		throw new Error("Failed to create product");
	} catch (error) {
		console.error("Error creating Stripe product:", error);
		throw error;
	}
}

async function createStripePrice(
	productId: string,
	unitAmount: number,
	currency: string,
) {
	try {
		// In a real implementation, you would call the MCP Stripe server
		// For now, we'll simulate the API call
		const response = await fetch("/api/stripe/create-price", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				product: productId,
				unit_amount: unitAmount,
				currency,
			}),
		});

		if (response.ok) {
			return await response.json();
		}
		throw new Error("Failed to create price");
	} catch (error) {
		console.error("Error creating Stripe price:", error);
		throw error;
	}
}

async function createStripePaymentLink(priceId: string, quantity: number) {
	try {
		// In a real implementation, you would call the MCP Stripe server
		// For now, we'll simulate the API call
		const response = await fetch("/api/stripe/create-payment-link", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ price: priceId, quantity }),
		});

		if (response.ok) {
			return await response.json();
		}
		throw new Error("Failed to create payment link");
	} catch (error) {
		console.error("Error creating Stripe payment link:", error);
		throw error;
	}
}
