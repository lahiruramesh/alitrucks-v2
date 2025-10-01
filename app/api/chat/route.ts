import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatStatus } from "@/prisma/generated/prisma";

// GET /api/chat - Get all chats for the current user
export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = session.user.id;
		const userRole = session.user.role;

		let chats: any;

		if (userRole === "ADMIN") {
			// Admin can see all chats
			chats = await prisma.chat.findMany({
				include: {
					initiator: {
						select: {
							id: true,
							name: true,
							email: true,
							role: true,
						},
					},
					participants: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									role: true,
								},
							},
						},
					},
					messages: {
						orderBy: { createdAt: "desc" },
						take: 1,
						include: {
							sender: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
					_count: {
						select: {
							messages: true,
						},
					},
				},
				orderBy: { updatedAt: "desc" },
			});
		} else {
			// Sellers and buyers only see chats they're involved in
			chats = await prisma.chat.findMany({
				where: {
					OR: [
						{ initiatorId: userId },
						{
							participants: {
								some: {
									userId: userId,
								},
							},
						},
					],
				},
				include: {
					initiator: {
						select: {
							id: true,
							name: true,
							email: true,
							role: true,
						},
					},
					participants: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									role: true,
								},
							},
						},
					},
					messages: {
						orderBy: { createdAt: "desc" },
						take: 1,
						include: {
							sender: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
					_count: {
						select: {
							messages: true,
						},
					},
				},
				orderBy: { updatedAt: "desc" },
			});
		}

		return NextResponse.json(chats);
	} catch (error) {
		console.error("Error fetching chats:", error);
		return NextResponse.json(
			{ error: "Failed to fetch chats" },
			{ status: 500 },
		);
	}
}

// POST /api/chat - Create a new chat
export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { subject, participantIds } = body;

		if (
			!participantIds ||
			!Array.isArray(participantIds) ||
			participantIds.length === 0
		) {
			return NextResponse.json(
				{ error: "At least one participant is required" },
				{ status: 400 },
			);
		}

		const userId = session.user.id;

		// Create the chat
		const chat = await prisma.chat.create({
			data: {
				subject: subject || undefined,
				initiatorId: userId,
				status: ChatStatus.ACTIVE,
				participants: {
					create: [
						// Add the initiator as a participant
						{
							userId: userId,
						},
						// Add other participants
						...participantIds
							.filter((id: string) => id !== userId)
							.map((id: string) => ({
								userId: id,
							})),
					],
				},
			},
			include: {
				initiator: {
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
					},
				},
				participants: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
								role: true,
							},
						},
					},
				},
				messages: true,
			},
		});

		return NextResponse.json(chat, { status: 201 });
	} catch (error) {
		console.error("Error creating chat:", error);
		return NextResponse.json(
			{ error: "Failed to create chat" },
			{ status: 500 },
		);
	}
}
