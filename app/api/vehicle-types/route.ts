import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
	try {
		const vehicleTypes = await prisma.vehicleType.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});

		return NextResponse.json(vehicleTypes);
	} catch (error) {
		console.error("Error fetching vehicle types:", error);
		return NextResponse.json(
			{ error: "Failed to fetch vehicle types" },
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

		const vehicleType = await prisma.vehicleType.create({
			data: { name },
		});

		return NextResponse.json(vehicleType, { status: 201 });
	} catch (error) {
		console.error("Error creating vehicle type:", error);
		return NextResponse.json(
			{ error: "Failed to create vehicle type" },
			{ status: 500 },
		);
	}
}
