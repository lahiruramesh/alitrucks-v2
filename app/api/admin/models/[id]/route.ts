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
		const { name, makeId } = body;

		if (!name || !makeId) {
			return NextResponse.json(
				{ error: "Name and make are required" },
				{ status: 400 },
			);
		}

		const id = parseInt(paramId, 10);
		if (Number.isNaN(id)) {
			return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
		}

		const model = await prisma.vehicleModel.update({
			where: { id },
			data: {
				name,
				makeId,
			},
			include: {
				make: true,
			},
		});

		return NextResponse.json(model);
	} catch (error) {
		console.error("Error updating model:", error);
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

		// Check if model is in use
		const vehicleCount = await prisma.vehicle.count({
			where: { modelId: id },
		});

		if (vehicleCount > 0) {
			return NextResponse.json(
				{ error: "Cannot delete model that is in use" },
				{ status: 400 },
			);
		}

		await prisma.vehicleModel.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting model:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
