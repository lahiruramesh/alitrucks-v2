"use client";

import { Clock, MessageCircle, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface Chat {
	id: string;
	title: string;
	status: "OPEN" | "CLOSED" | "PENDING";
	createdAt: string;
	updatedAt: string;
	_count: {
		messages: number;
	};
	participants: {
		user: {
			id: string;
			name: string;
			email: string;
			role: string;
		};
	}[];
	lastMessage?: {
		content: string;
		createdAt: string;
		senderId: string;
	};
}

interface ChatListProps {
	selectedChatId?: string;
	onChatSelect: (chatId: string) => void;
	onNewChat?: () => void;
	showNewChatButton?: boolean;
	className?: string;
}

export function ChatList({
	selectedChatId,
	onChatSelect,
	onNewChat,
	showNewChatButton = false,
	className,
}: ChatListProps) {
	const { user } = useAuth();
	const [chats, setChats] = useState<Chat[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchChats = async () => {
			if (!user?.id) return;

			try {
				setLoading(true);
				const response = await fetch("/api/chat");
				if (response.ok) {
					const data = await response.json();
					setChats(data);
				}
			} catch (error) {
				console.error("Error fetching chats:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchChats();
	}, [user?.id]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "OPEN":
				return "bg-green-500";
			case "PENDING":
				return "bg-yellow-500";
			case "CLOSED":
				return "bg-gray-500";
			default:
				return "bg-gray-500";
		}
	};

	const getOtherParticipant = (chat: Chat) => {
		return chat.participants.find((p) => p.user.id !== user?.id)?.user;
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return date.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			});
		} else if (diffInHours < 24 * 7) {
			return date.toLocaleDateString([], { weekday: "short" });
		} else {
			return date.toLocaleDateString([], { month: "short", day: "numeric" });
		}
	};

	if (loading) {
		return (
			<div className={cn("space-y-2", className)}>
				{[...Array(3)].map((_, i) => (
					<div key={i} className="animate-pulse">
						<div className="h-20 bg-gray-200 rounded-lg"></div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className={cn("space-y-2", className)}>
			{showNewChatButton && onNewChat && (
				<Button onClick={onNewChat} className="w-full mb-4" variant="default">
					<MessageCircle className="w-4 h-4 mr-2" />
					New Chat
				</Button>
			)}

			{chats.length === 0 ? (
				<Card>
					<CardContent className="p-6 text-center">
						<MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
						<p className="text-gray-500">No chats yet</p>
						{showNewChatButton && (
							<p className="text-sm text-gray-400 mt-1">Start a conversation</p>
						)}
					</CardContent>
				</Card>
			) : (
				chats.map((chat) => {
					const otherParticipant = getOtherParticipant(chat);
					const isSelected = selectedChatId === chat.id;

					return (
						<Card
							key={chat.id}
							className={cn(
								"cursor-pointer transition-all hover:shadow-md",
								isSelected && "ring-1 ring-green-500 border-green-300",
							)}
							onClick={() => onChatSelect(chat.id)}
						>
							<CardContent className="p-3">
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-start gap-3 flex-1 min-w-0">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
												<UserIcon className="w-5 h-5 text-gray-600" />
											</div>
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<h3 className="font-medium text-sm truncate">
													{otherParticipant?.name || "Unknown User"}
												</h3>
												<Badge
													variant="secondary"
													className={cn(
														"text-xs px-2 py-0",
														getStatusColor(chat.status),
													)}
												>
													{chat.status}
												</Badge>
											</div>

											<p className="text-xs text-gray-600 mb-1">
												{otherParticipant?.email}
											</p>

											{chat.lastMessage && (
												<p className="text-sm text-gray-700 truncate">
													{chat.lastMessage.content}
												</p>
											)}
										</div>
									</div>

									<div className="flex-shrink-0 text-right">
										<div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
											<Clock className="w-3 h-3" />
											{formatTime(
												chat.lastMessage?.createdAt || chat.updatedAt,
											)}
										</div>

										<div className="flex items-center gap-1 text-xs text-gray-400">
											<MessageCircle className="w-3 h-3" />
											{chat._count.messages}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})
			)}
		</div>
	);
}
