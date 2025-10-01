import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
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

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create user with all fields
		const user = await prisma.user.create({
			data: {
				id: `user_${Date.now()}_${Math.random().toString(36).substring(2)}`,
				name,
				email,
				emailVerified: false,
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

		// Create account with password
		await prisma.account.create({
			data: {
				id: `account_${Date.now()}_${Math.random().toString(36).substring(2)}`,
				accountId: user.id,
				providerId: "credential",
				userId: user.id,
				password: hashedPassword,
			},
		});

		return NextResponse.json({
			success: true,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				userType: user.userType,
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
