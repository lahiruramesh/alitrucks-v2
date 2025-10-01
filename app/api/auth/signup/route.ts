import { type NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";
import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			name,
			email,
			password,
			role,
			userType,
			companyName,
			phoneNumber,
			address,
			city,
			country,
			postalCode,
		} = body;

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: "User already exists" },
				{ status: 400 },
			);
		}
		const { data, error } = await authClient.signUp.email({
			name,
			email,
			password,
		});
		if (error || !data?.user) {
			console.error("Error during signup:", error);
			return NextResponse.json(
				{ error: "Failed to create account" },
				{ status: 500 },
			);
		}
		const user = data.user;

		await prisma.user.update({
			where: { id: user.id },
			data: {
				role: role || "BUYER",
				userType: userType || "INDIVIDUAL",
				companyName,
				phoneNumber,
				address,
				city,
				country,
				postalCode,
			},
		});

		return NextResponse.json({
			success: true,
			user: {
				id: user.id,
			},
		});
	} catch (error) {
		console.error("Signup error:", error);
		return NextResponse.json(
			{ error: "Failed to create account" },
			{ status: 500 },
		);
	}
}
