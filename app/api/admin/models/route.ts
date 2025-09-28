import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});
		if (!session?.user || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "1", 10);
		const limit = parseInt(searchParams.get("limit") || "10", 10);
		const search = searchParams.get("search") || "";
		const makeId = searchParams.get("makeId");

		const skip = (page - 1) * limit;

		const where: any = {};

		if (search) {
			where.name = { contains: search, mode: "insensitive" as const };
		}

		if (makeId) {
			where.makeId = makeId;
		}

		const [models, total] = await Promise.all([
			prisma.vehicleModel.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					make: true,
					_count: {
						select: { vehicles: true },
					},
				},
			}),
			prisma.vehicleModel.count({ where }),
		]);

		return NextResponse.json({
			models,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching models:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});
		if (!session?.user || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { name, makeId } = body;

		if (!name || !makeId) {
			return NextResponse.json(
				{ error: "Name and make are required" },
				{ status: 400 },
			);
		}

		const model = await prisma.vehicleModel.create({
			data: {
				name,
				makeId,
			},
			include: {
				make: true,
			},
		});

		return NextResponse.json(model, { status: 201 });
	} catch (error) {
		console.error("Error creating model:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
