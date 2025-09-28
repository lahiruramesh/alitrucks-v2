import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
	try {
		const fuelTypes = await prisma.fuelType.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});

		return NextResponse.json(fuelTypes);
	} catch (error) {
		console.error("Error fetching fuel types:", error);
		return NextResponse.json(
			{ error: "Failed to fetch fuel types" },
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

		const fuelType = await prisma.fuelType.create({
			data: { name },
		});

		return NextResponse.json(fuelType, { status: 201 });
	} catch (error) {
		console.error("Error creating fuel type:", error);
		return NextResponse.json(
			{ error: "Failed to create fuel type" },
			{ status: 500 },
		);
	}
}
