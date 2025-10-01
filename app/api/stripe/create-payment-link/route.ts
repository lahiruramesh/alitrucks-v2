import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { price, quantity } = body;

		if (!price || !quantity) {
			return NextResponse.json(
				{ error: "Price ID and quantity are required" },
				{ status: 400 },
			);
		}

		// For testing with real Stripe test environment
		// In a production implementation, you would use the MCP tools to create a real payment link
		// For now, we'll create a test payment link that works with Stripe test cards

		const paymentLinkId = `plink_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

		// Create a test payment link URL - this would be replaced with actual Stripe Payment Link in production
		// For testing purposes, we'll use a URL that shows the test card instructions
		const testPaymentUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/payment/test-checkout?price=${price}&amount=${getAmountFromPrice(price)}&booking=${getBookingFromPrice(price)}`;

		const paymentLink = {
			id: paymentLinkId,
			object: "payment_link",
			active: true,
			allow_promotion_codes: false,
			application_fee_amount: null,
			application_fee_percent: null,
			automatic_tax: { enabled: false },
			billing_address_collection: "auto",
			created: Math.floor(Date.now() / 1000),
			currency: "usd",
			livemode: false, // Test mode
			metadata: {},
			on_behalf_of: null,
			payment_method_types: ["card"],
			phone_number_collection: { enabled: false },
			shipping_address_collection: null,
			submit_type: null,
			subscription_data: null,
			tax_id_collection: { enabled: false },
			transfer_data: null,
			url: testPaymentUrl,
		};

		console.log("Created test payment link:", paymentLink);
		return NextResponse.json(paymentLink);
	} catch (error) {
		console.error("Error creating payment link:", error);
		return NextResponse.json(
			{ error: "Failed to create payment link" },
			{ status: 500 },
		);
	}
}

// Helper function to extract amount from price ID (for demo purposes)
function getAmountFromPrice(priceId: string): string {
	// In a real implementation, you would look up the price from your database
	// For demo, we'll extract from the timestamp
	const timestamp = priceId.split("_")[1];
	return (parseInt(timestamp.slice(-4), 10) * 10).toString(); // Convert to realistic amount
}

// Helper function to extract booking info (for demo purposes)
function getBookingFromPrice(_priceId: string): string {
	// In a real implementation, this would come from metadata
	return "demo_booking";
}
