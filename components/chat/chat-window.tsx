"use client";

import { MoreVertical, Users, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";

interface ChatUser {
	id: string;
	name: string;
	email: string;
	role: string;
}

interface Message {
	id: string;
	content: string;
	messageType: "TEXT" | "IMAGE" | "FILE";
	createdAt: string;
	sender: ChatUser;
	readBy: string[];
}

interface Chat {
	id: string;
	subject?: string;
	status: "ACTIVE" | "CLOSED" | "ARCHIVED";
	createdAt: string;
	updatedAt: string;
	initiator: ChatUser;
	participants: Array<{
		user: ChatUser;
		lastSeenAt?: string;
	}>;
	_count: {
		messages: number;
	};
}

interface ChatWindowProps {
	chat: Chat;
	messages: Message[];
	currentUserId: string;
	onSendMessage: (content: string) => void;
	onCloseChat?: () => void;
	onUpdateChatStatus?: (status: "ACTIVE" | "CLOSED" | "ARCHIVED") => void;
	isLoading?: boolean;
	className?: string;
}

export function ChatWindow({
	chat,
	messages,
	currentUserId,
	onSendMessage,
	onCloseChat,
	onUpdateChatStatus,
	isLoading = false,
	className,
}: ChatWindowProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		if (isScrolledToBottom) {
			scrollToBottom();
		}
	}, [messages, isScrolledToBottom, scrollToBottom]);

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
		const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
		setIsScrolledToBottom(isAtBottom);
	};

	const getOtherParticipants = () => {
		return chat.participants
			.filter((p) => p.user.id !== currentUserId)
			.map((p) => p.user);
	};

	const getChatDisplayName = () => {
		if (chat.subject) {
			return chat.subject;
		}

		const otherParticipants = getOtherParticipants();
		if (otherParticipants.length === 0) {
			return "Personal Chat";
		}

		return otherParticipants.map((p) => p.name).join(", ");
	};

	const getAvatarInitials = (name: string) => {
		return name
			.split(" ")
			.map((word) => word[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	const otherParticipants = getOtherParticipants();
	const displayName = getChatDisplayName();

	if (!chat) {
		return (
			<Card className={`h-full ${className}`}>
				<CardContent className="flex items-center justify-center h-full">
					<div className="text-center text-muted-foreground">
						<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>Select a chat to start messaging</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={`h-full flex flex-col overflow-hidden ${className}`}>
			<CardHeader className="pb-2 lg:pb-3 border-b flex-shrink-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 lg:gap-3 min-w-0">
						<Avatar className="w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0">
							<AvatarFallback>
								{otherParticipants.length > 0
									? getAvatarInitials(otherParticipants[0].name)
									: "CH"}
							</AvatarFallback>
						</Avatar>

						<div className="flex-1 min-w-0">
							<CardTitle className="text-base lg:text-lg truncate">
								{displayName}
							</CardTitle>
							<div className="flex items-center gap-1 lg:gap-2 mt-1">
								<Badge
									variant={chat.status === "ACTIVE" ? "default" : "secondary"}
									className="text-xs"
								>
									{chat.status}
								</Badge>
								{otherParticipants.length > 0 && (
									<span className="text-xs text-muted-foreground truncate hidden lg:inline">
										{otherParticipants
											.map((p) => `${p.name} (${p.role})`)
											.join(", ")}
									</span>
								)}
							</div>
						</div>
					</div>{" "}
					<div className="flex items-center gap-1">
						{onUpdateChatStatus && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem
										onClick={() => onUpdateChatStatus("ACTIVE")}
									>
										Mark as Active
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => onUpdateChatStatus("CLOSED")}
									>
										Close Chat
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => onUpdateChatStatus("ARCHIVED")}
									>
										Archive Chat
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}

						{onCloseChat && (
							<Button variant="ghost" size="icon" onClick={onCloseChat}>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
				<div
					className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1"
					onScroll={handleScroll}
				>
					{isLoading ? (
						<div className="space-y-4">
							{[...Array(5)].map((_, i) => (
								<div
									key={i}
									className={`animate-pulse flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
								>
									<div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
									<div className="flex-1 space-y-2 max-w-[70%]">
										<div className="h-4 bg-gray-200 rounded w-1/4" />
										<div className="h-16 bg-gray-200 rounded" />
									</div>
								</div>
							))}
						</div>
					) : messages.length === 0 ? (
						<div className="flex items-center justify-center h-full text-center text-muted-foreground">
							<div>
								<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p>No messages yet</p>
								<p className="text-xs mt-1">Start the conversation!</p>
							</div>
						</div>
					) : (
						<>
							{messages.map((message, index) => {
								const isOwn = message.sender.id === currentUserId;
								const previousMessage = messages[index - 1];
								const showAvatar =
									!previousMessage ||
									previousMessage.sender.id !== message.sender.id ||
									new Date(message.createdAt).getTime() -
										new Date(previousMessage.createdAt).getTime() >
										5 * 60 * 1000; // 5 minutes

								return (
									<ChatMessage
										key={message.id}
										message={message}
										isOwn={isOwn}
										showAvatar={showAvatar}
										currentUserId={currentUserId}
									/>
								);
							})}
							<div ref={messagesEndRef} />
						</>
					)}
				</div>

				<div className="flex-shrink-0">
					<ChatInput
						onSendMessage={onSendMessage}
						disabled={chat.status === "CLOSED" || chat.status === "ARCHIVED"}
						placeholder={
							chat.status === "CLOSED"
								? "This chat is closed"
								: chat.status === "ARCHIVED"
									? "This chat is archived"
									: "Type a message..."
						}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
