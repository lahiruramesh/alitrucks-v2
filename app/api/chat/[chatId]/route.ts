import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatStatus } from "@/prisma/generated/prisma";

// GET /api/chat/[chatId] - Get a specific chat
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ chatId: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { chatId } = await params;
		const userId = session.user.id;

		// Check if user has access to this chat
		const chat = await prisma.chat.findFirst({
			where: {
				id: chatId,
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
				_count: {
					select: {
						messages: true,
					},
				},
			},
		});

		if (!chat && session.user.role !== "ADMIN") {
			return NextResponse.json(
				{ error: "Chat not found or access denied" },
				{ status: 404 },
			);
		}

		// If admin and chat not found in user's accessible chats, try to get it directly
		if (!chat && session.user.role === "ADMIN") {
			const adminChat = await prisma.chat.findUnique({
				where: { id: chatId },
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
					_count: {
						select: {
							messages: true,
						},
					},
				},
			});

			if (!adminChat) {
				return NextResponse.json({ error: "Chat not found" }, { status: 404 });
			}

			return NextResponse.json(adminChat);
		}

		return NextResponse.json(chat);
	} catch (error) {
		console.error("Error fetching chat:", error);
		return NextResponse.json(
			{ error: "Failed to fetch chat" },
			{ status: 500 },
		);
	}
}

// PATCH /api/chat/[chatId] - Update chat status or subject
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ chatId: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { chatId } = await params;
		const userId = session.user.id;
		const body = await request.json();
		const { status, subject } = body;

		// Check if user has permission to update this chat
		const chat = await prisma.chat.findFirst({
			where: {
				id: chatId,
				OR: [
					{ initiatorId: userId },
					// Admins can update any chat
					...(session.user.role === "ADMIN" ? [{}] : []),
				],
			},
		});

		if (!chat) {
			return NextResponse.json(
				{ error: "Chat not found or access denied" },
				{ status: 404 },
			);
		}

		const updateData: { status?: ChatStatus; subject?: string } = {};

		if (status && Object.values(ChatStatus).includes(status)) {
			updateData.status = status;
		}

		if (subject !== undefined) {
			updateData.subject = subject || null;
		}

		const updatedChat = await prisma.chat.update({
			where: { id: chatId },
			data: updateData,
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
				_count: {
					select: {
						messages: true,
					},
				},
			},
		});

		return NextResponse.json(updatedChat);
	} catch (error) {
		console.error("Error updating chat:", error);
		return NextResponse.json(
			{ error: "Failed to update chat" },
			{ status: 500 },
		);
	}
}
