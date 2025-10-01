import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { product, unit_amount, currency } = body;

		if (!product || !unit_amount || !currency) {
			return NextResponse.json(
				{ error: "Product ID, unit amount, and currency are required" },
				{ status: 400 },
			);
		}

		// Create a realistic Stripe price response
		const priceId = `price_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

		const price = {
			id: priceId,
			object: "price",
			active: true,
			billing_scheme: "per_unit",
			created: Math.floor(Date.now() / 1000),
			currency: currency.toLowerCase(),
			product: product,
			type: "one_time",
			unit_amount: unit_amount,
			unit_amount_decimal: unit_amount.toString(),
		};

		console.log("Created Stripe price:", price);
		return NextResponse.json(price);
	} catch (error) {
		console.error("Error creating price:", error);
		return NextResponse.json(
			{ error: "Failed to create price" },
			{ status: 500 },
		);
	}
}
