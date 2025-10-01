import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { MessageType } from "@/prisma/generated/prisma";

// GET /api/chat/[chatId]/messages - Get messages for a specific chat
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

		// Check if user is a participant in the chat
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
		});

		if (!chat && session.user.role !== "ADMIN") {
			return NextResponse.json(
				{ error: "Chat not found or access denied" },
				{ status: 404 },
			);
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "1", 10);
		const limit = parseInt(searchParams.get("limit") || "50", 10);
		const since = searchParams.get("since"); // For real-time polling
		const skip = (page - 1) * limit;

		// Build where clause
		const whereClause: any = {
			chatId: chatId,
		};

		// If 'since' parameter provided, get messages after that message ID
		if (since) {
			whereClause.id = {
				gt: since,
			};
		}

		const messages = await prisma.chatMessage.findMany({
			where: whereClause,
			include: {
				sender: {
					select: {
						id: true,
						name: true,
						role: true,
					},
				},
			},
			orderBy: { createdAt: "asc" },
			...(since ? {} : { skip, take: limit }), // Don't paginate when polling
		});

		// Update last seen for this user (only when not polling)
		if (!since) {
			await prisma.chatParticipant.updateMany({
				where: {
					chatId: chatId,
					userId: userId,
				},
				data: {
					lastSeenAt: new Date(),
				},
			});
		}

		const total = await prisma.chatMessage.count({
			where: { chatId: chatId },
		});

		return NextResponse.json({
			messages,
			pagination: since
				? undefined
				: {
						page,
						limit,
						total,
						pages: Math.ceil(total / limit),
					},
		});
	} catch (error) {
		console.error("Error fetching messages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch messages" },
			{ status: 500 },
		);
	}
}

// POST /api/chat/[chatId]/messages - Send a message to a chat
export async function POST(
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
		const { content, messageType = "TEXT" } = body;

		if (!content || content.trim().length === 0) {
			return NextResponse.json(
				{ error: "Message content is required" },
				{ status: 400 },
			);
		}

		// Check if user is a participant in the chat
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
		});

		if (!chat) {
			return NextResponse.json(
				{ error: "Chat not found or access denied" },
				{ status: 404 },
			);
		}

		// Create the message
		const message = await prisma.chatMessage.create({
			data: {
				chatId: chatId,
				senderId: userId,
				content: content.trim(),
				messageType: messageType as MessageType,
				readBy: [userId], // Mark as read by sender
			},
			include: {
				sender: {
					select: {
						id: true,
						name: true,
						role: true,
					},
				},
			},
		});

		// Update chat's updatedAt timestamp
		await prisma.chat.update({
			where: { id: chatId },
			data: { updatedAt: new Date() },
		});

		// Update sender's last seen
		await prisma.chatParticipant.updateMany({
			where: {
				chatId: chatId,
				userId: userId,
			},
			data: {
				lastSeenAt: new Date(),
			},
		});

		return NextResponse.json(message, { status: 201 });
	} catch (error) {
		console.error("Error sending message:", error);
		return NextResponse.json(
			{ error: "Failed to send message" },
			{ status: 500 },
		);
	}
}
