"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChatUser {
	id: string;
	name: string;
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

interface ChatMessageProps {
	message: Message;
	isOwn: boolean;
	showAvatar?: boolean;
	currentUserId: string;
}

export function ChatMessage({
	message,
	isOwn,
	showAvatar = true,
	currentUserId,
}: ChatMessageProps) {
	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	const getAvatarInitials = (name: string) => {
		return name
			.split(" ")
			.map((word) => word[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	const isRead = message.readBy.includes(currentUserId);

	return (
		<div
			className={cn(
				"flex gap-2 sm:gap-3 mb-3 sm:mb-4",
				isOwn && "flex-row-reverse",
			)}
		>
			{showAvatar && (
				<Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
					<AvatarFallback className="text-xs bg-muted">
						{getAvatarInitials(message.sender.name)}
					</AvatarFallback>
				</Avatar>
			)}

			<div
				className={cn(
					"flex flex-col min-w-0 flex-1",
					isOwn ? "items-end" : "items-start",
					!showAvatar && (isOwn ? "mr-8 sm:mr-11" : "ml-8 sm:ml-11"),
				)}
			>
				{showAvatar && (
					<div
						className={cn(
							"flex items-center gap-1 sm:gap-2 mb-1",
							isOwn && "flex-row-reverse",
						)}
					>
						<span className="text-xs font-medium text-foreground truncate">
							{message.sender.name}
						</span>
						<Badge variant="outline" className="text-xs shrink-0">
							{message.sender.role}
						</Badge>
					</div>
				)}

				<div
					className={cn(
						"max-w-[85%] sm:max-w-[70%] px-2 sm:px-3 py-2 rounded-lg text-sm",
						isOwn
							? "bg-primary text-primary-foreground rounded-br-sm"
							: "bg-muted text-muted-foreground rounded-bl-sm",
					)}
				>
					{message.messageType === "TEXT" ? (
						<p className="whitespace-pre-wrap break-words">{message.content}</p>
					) : (
						<div className="flex items-center gap-2">
							<span className="text-xs opacity-70 shrink-0">
								{message.messageType === "IMAGE" ? "📷 Image" : "📎 File"}
							</span>
							<p className="break-words min-w-0">{message.content}</p>
						</div>
					)}
				</div>

				<div
					className={cn(
						"flex items-center gap-1 sm:gap-2 mt-1",
						isOwn && "flex-row-reverse",
					)}
				>
					<span className="text-xs text-muted-foreground">
						{formatTime(message.createdAt)}
					</span>
					{isOwn && (
						<span className="text-xs text-muted-foreground">
							{isRead ? "✓✓" : "✓"}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
