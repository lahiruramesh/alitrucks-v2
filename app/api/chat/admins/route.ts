import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/admins - Get list of admin users for chat initiation
export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Only sellers can get admin list for initiating chats
		if (session.user.role !== "SELLER") {
			return NextResponse.json(
				{ error: "Only sellers can initiate chats with admins" },
				{ status: 403 },
			);
		}

		const admins = await prisma.user.findMany({
			where: {
				role: "ADMIN",
				banned: { not: true }, // Exclude banned admins
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
			},
			orderBy: { name: "asc" },
		});

		return NextResponse.json(admins);
	} catch (error) {
		console.error("Error fetching admins:", error);
		return NextResponse.json(
			{ error: "Failed to fetch admins" },
			{ status: 500 },
		);
	}
}
