import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		// Users can view their own profile, admins can view any profile
		if (session.user.id !== id && session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				userType: true,
				companyName: true,
				phoneNumber: true,
				address: true,
				city: true,
				country: true,
				postalCode: true,
				emailVerified: true,
				banned: true,
				banReason: true,
				banExpires: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error("Error fetching user:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();

		// Users can update their own profile, admins can update any profile
		if (session.user.id !== id && session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Prevent non-admins from changing role or ban status
		if (session.user.role !== "ADMIN") {
			delete body.role;
			delete body.banned;
			delete body.banReason;
			delete body.banExpires;
		}

		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				name: body.name,
				phoneNumber: body.phoneNumber,
				address: body.address,
				city: body.city,
				country: body.country,
				postalCode: body.postalCode,
				companyName: body.companyName,
				// Admin-only fields
				...(session.user.role === "ADMIN" && {
					banned: body.banned,
					banReason: body.banReason,
					banExpires: body.banExpires ? new Date(body.banExpires) : null,
				}),
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				userType: true,
				companyName: true,
				phoneNumber: true,
				address: true,
				city: true,
				country: true,
				postalCode: true,
				emailVerified: true,
				banned: true,
				banReason: true,
				banExpires: true,
				updatedAt: true,
			},
		});

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		// Prevent admin from deleting themselves
		if (session.user.id === id) {
			return NextResponse.json(
				{ error: "Cannot delete your own account" },
				{ status: 400 },
			);
		}

		// Soft delete by banning the user
		const _deletedUser = await prisma.user.update({
			where: { id },
			data: {
				banned: true,
				banReason: "Account deleted by administrator",
			},
		});

		return NextResponse.json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Error deleting user:", error);
		return NextResponse.json(
			{ error: "Failed to delete user" },
			{ status: 500 },
		);
	}
}
