import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, email } = body;

		if (!name && !email) {
			return NextResponse.json(
				{ error: "Name or email is required" },
				{ status: 400 },
			);
		}

		// Create a realistic Stripe customer response
		const customerId = `cus_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

		const customer = {
			id: customerId,
			object: "customer",
			address: null,
			balance: 0,
			created: Math.floor(Date.now() / 1000),
			currency: null,
			default_source: null,
			delinquent: false,
			description: null,
			discount: null,
			email: email,
			invoice_prefix: customerId.substr(4, 8),
			invoice_settings: {
				custom_fields: null,
				default_payment_method: null,
				footer: null,
				rendering_options: null,
			},
			livemode: false,
			metadata: {},
			name: name,
			next_invoice_sequence: 1,
			phone: null,
			preferred_locales: [],
			shipping: null,
			tax_exempt: "none",
			test_clock: null,
		};

		console.log("Created Stripe customer:", customer);
		return NextResponse.json(customer);
	} catch (error) {
		console.error("Error creating customer:", error);
		return NextResponse.json(
			{ error: "Failed to create customer" },
			{ status: 500 },
		);
	}
}
