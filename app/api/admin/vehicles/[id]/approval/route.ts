import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApprovalStatus } from "@/types/vehicle";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Check if user is admin
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
		});

		if (user?.role !== "ADMIN") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { action, comments }: { action: ApprovalStatus; comments?: string } =
			await request.json();

		if (!action || !["APPROVED", "REJECTED"].includes(action)) {
			return NextResponse.json(
				{ error: "Invalid action. Must be APPROVED or REJECTED" },
				{ status: 400 },
			);
		}

		// Get the vehicle
		const vehicle = await prisma.vehicle.findUnique({
			where: { id },
			include: {
				currentApproval: true,
			},
		});

		if (!vehicle) {
			return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
		}

		if (vehicle.status !== "PENDING") {
			return NextResponse.json(
				{ error: "Vehicle is not pending approval" },
				{ status: 400 },
			);
		}

		// Create new approval record
		const approval = await prisma.vehicleApproval.create({
			data: {
				vehicleId: id,
				reviewerId: session.user.id,
				status: action,
				comments: comments || null,
				reviewedAt: new Date(),
			},
		});

		// Update vehicle status and link to new approval
		await prisma.vehicle.update({
			where: { id },
			data: {
				status: action,
				currentApprovalId: approval.id,
				...(action === "APPROVED" && {
					approvedAt: new Date(),
					isPublished: true,
					publishedAt: new Date(),
				}),
				...(action === "REJECTED" && {
					rejectedAt: new Date(),
					isPublished: false,
				}),
			},
		});

		return NextResponse.json(approval);
	} catch (error) {
		console.error("Error processing vehicle approval:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const approvals = await prisma.vehicleApproval.findMany({
			where: { vehicleId: id },
			include: {
				reviewer: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json(approvals);
	} catch (error) {
		console.error("Error fetching vehicle approvals:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
