import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
	try {
		const vehicleMakes = await prisma.vehicleMake.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});

		return NextResponse.json(vehicleMakes);
	} catch (error) {
		console.error("Error fetching vehicle makes:", error);
		return NextResponse.json(
			{ error: "Failed to fetch vehicle makes" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { name } = body;

		if (!name) {
			return NextResponse.json({ error: "Name is required" }, { status: 400 });
		}

		const vehicleMake = await prisma.vehicleMake.create({
			data: { name },
		});

		return NextResponse.json(vehicleMake, { status: 201 });
	} catch (error) {
		console.error("Error creating vehicle make:", error);
		return NextResponse.json(
			{ error: "Failed to create vehicle make" },
			{ status: 500 },
		);
	}
}
