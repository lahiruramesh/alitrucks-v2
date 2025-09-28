import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});
		if (!session?.user || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: paramId } = await params;
		const body = await request.json();
		const { name } = body;

		if (!name) {
			return NextResponse.json({ error: "Name is required" }, { status: 400 });
		}

		const id = parseInt(paramId, 10);
		if (Number.isNaN(id)) {
			return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
		}

		const make = await prisma.vehicleMake.update({
			where: { id },
			data: { name },
		});

		return NextResponse.json(make);
	} catch (error) {
		console.error("Error updating make:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
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
		if (!session?.user || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: paramId } = await params;
		const id = parseInt(paramId, 10);
		if (Number.isNaN(id)) {
			return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
		}

		// Check if make is in use
		const vehicleCount = await prisma.vehicle.count({
			where: { makeId: id },
		});

		if (vehicleCount > 0) {
			return NextResponse.json(
				{ error: "Cannot delete make that is in use" },
				{ status: 400 },
			);
		}

		await prisma.vehicleMake.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting make:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
