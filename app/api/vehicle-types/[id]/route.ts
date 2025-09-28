import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

export async function PUT(
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

		const { id: paramId } = await params;
		const body = await request.json();
		const { name, isActive } = body;
		const id = parseInt(paramId, 10);

		const vehicleType = await prisma.vehicleType.update({
			where: { id },
			data: { name, isActive },
		});

		return NextResponse.json(vehicleType);
	} catch (error) {
		console.error("Error updating vehicle type:", error);
		return NextResponse.json(
			{ error: "Failed to update vehicle type" },
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

		const { id: paramId } = await params;
		const id = parseInt(paramId, 10);

		const vehicleType = await prisma.vehicleType.update({
			where: { id },
			data: { isActive: false },
		});

		return NextResponse.json(vehicleType);
	} catch (error) {
		console.error("Error deleting vehicle type:", error);
		return NextResponse.json(
			{ error: "Failed to delete vehicle type" },
			{ status: 500 },
		);
	}
}
