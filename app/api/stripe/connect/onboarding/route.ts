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

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			include: { stripeAccount: true },
		});

		if (!user || !user.stripeAccount) {
			return NextResponse.json(
				{ error: "Stripe account not found" },
				{ status: 404 },
			);
		}

		// Create account link for onboarding
		const accountLink = await stripe.accountLinks.create({
			account: user.stripeAccount.stripeAccountId,
			refresh_url: `${process.env.NEXT_PUBLIC_URL}/seller/onboarding/refresh`,
			return_url: `${process.env.NEXT_PUBLIC_URL}/seller/onboarding/success`,
			type: "account_onboarding",
		});

		// Update the onboarding URL in database
		await prisma.stripeAccount.update({
			where: { id: user.stripeAccount.id },
			data: {
				onboardingUrl: accountLink.url,
			},
		});

		return NextResponse.json({
			url: accountLink.url,
		});
	} catch (error) {
		console.error("Error creating onboarding link:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
