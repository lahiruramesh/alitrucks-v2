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

		// Check if account is ready for dashboard access
		if (!user.stripeAccount.detailsSubmitted) {
			return NextResponse.json(
				{ error: "Account onboarding not completed" },
				{ status: 400 },
			);
		}

		// Create login link for Stripe dashboard
		const loginLink = await stripe.accounts.createLoginLink(
			user.stripeAccount.stripeAccountId,
		);

		// Update the dashboard URL in database
		await prisma.stripeAccount.update({
			where: { id: user.stripeAccount.id },
			data: {
				dashboardUrl: loginLink.url,
			},
		});

		return NextResponse.json({
			url: loginLink.url,
		});
	} catch (error) {
		console.error("Error creating dashboard link:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
