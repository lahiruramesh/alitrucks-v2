import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Check if user is a seller
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			include: { stripeAccount: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		if (user.role !== "SELLER") {
			return NextResponse.json(
				{ error: "Only sellers can create Stripe accounts" },
				{ status: 403 },
			);
		}

		// Check if user already has a Stripe account
		if (user.stripeAccount) {
			return NextResponse.json(
				{
					error: "Stripe account already exists",
					accountId: user.stripeAccount.stripeAccountId,
				},
				{ status: 400 },
			);
		}

		// Create Stripe Connect account
		const account = await stripe.accounts.create({
			type: "express",
			country: "SE", // Sweden
			email: user.email,
			business_profile: {
				name: user.name,
				support_email: user.email,
				product_description: "Vehicle sales and services",
			},
			metadata: {
				user_id: user.id,
			},
		});

		// Save to database
		await prisma.stripeAccount.create({
			data: {
				userId: user.id,
				stripeAccountId: account.id,
				detailsSubmitted: false,
				chargesEnabled: false,
				payoutsEnabled: false,
			},
		});

		return NextResponse.json({
			accountId: account.id,
			status: "created",
		});
	} catch (error) {
		console.error("Error creating Stripe account:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			include: { stripeAccount: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		if (!user.stripeAccount) {
			return NextResponse.json({
				hasAccount: false,
				account: null,
			});
		}

		// Get latest account status from Stripe
		try {
			const account = await stripe.accounts.retrieve(
				user.stripeAccount.stripeAccountId,
			);

			// Update our database with latest status
			await prisma.stripeAccount.update({
				where: { id: user.stripeAccount.id },
				data: {
					detailsSubmitted: account.details_submitted,
					chargesEnabled: account.charges_enabled,
					payoutsEnabled: account.payouts_enabled,
				},
			});

			return NextResponse.json({
				hasAccount: true,
				account: {
					id: account.id,
					detailsSubmitted: account.details_submitted,
					chargesEnabled: account.charges_enabled,
					payoutsEnabled: account.payouts_enabled,
					status: account.details_submitted ? "ACTIVE" : "PENDING",
				},
			});
		} catch (stripeError) {
			console.error("Error retrieving Stripe account:", stripeError);
			return NextResponse.json({
				hasAccount: true,
				account: user.stripeAccount,
				error: "Could not retrieve latest status from Stripe",
			});
		}
	} catch (error) {
		console.error("Error getting Stripe account:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
