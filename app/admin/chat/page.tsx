"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ChatList } from "@/components/chat/chat-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { useAuth } from "@/contexts/auth-context";
import { useRealTimeChat } from "@/hooks/use-realtime-chat";

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
	messages: Message[];
	_count: {
		messages: number;
	};
}

export default function AdminChatPage() {
	const { user } = useAuth();
	const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	const [refreshChats, setRefreshChats] = useState(0);

	// Trigger refresh of chat list
	const triggerRefreshChats = useCallback(() => {
		setRefreshChats((prev) => prev + 1);
	}, []);

	// Real-time chat functionality
	useRealTimeChat({
		chatId: selectedChat?.id,
		userId: user?.id,
		enabled: !!selectedChat && !!user,
		onNewMessage: (message) => {
			// Only add message if it's not from current user (to avoid duplicates)
			if (message.sender.id !== user?.id) {
				setMessages((prev) => [...prev, message]);
				triggerRefreshChats(); // Refresh chat list to show new message
				toast.info(`New message from ${message.sender.name}`);
			}
		},
		onChatUpdate: (updatedChat) => {
			setSelectedChat(updatedChat);
			triggerRefreshChats();
		},
	});

	// Fetch messages for a specific chat
	const fetchMessages = async (chatId: string) => {
		try {
			setIsLoadingMessages(true);
			const response = await fetch(`/api/chat/${chatId}/messages`, {
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch messages");
			}

			const data = await response.json();
			setMessages(data.messages || []);
		} catch (error) {
			console.error("Error fetching messages:", error);
			toast.error("Failed to load messages");
		} finally {
			setIsLoadingMessages(false);
		}
	};

	// Send a message
	const handleSendMessage = async (content: string) => {
		if (!selectedChat) return;

		try {
			const response = await fetch(`/api/chat/${selectedChat.id}/messages`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					content,
					messageType: "TEXT",
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to send message");
			}

			const newMessage = await response.json();
			setMessages((prev) => [...prev, newMessage]);

			// Refresh chat list to update last message
			triggerRefreshChats();
		} catch (error) {
			console.error("Error sending message:", error);
			toast.error("Failed to send message");
		}
	};

	// Update chat status
	const handleUpdateChatStatus = async (
		status: "ACTIVE" | "CLOSED" | "ARCHIVED",
	) => {
		if (!selectedChat) return;

		try {
			const response = await fetch(`/api/chat/${selectedChat.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ status }),
			});

			if (!response.ok) {
				throw new Error("Failed to update chat status");
			}

			const updatedChat = await response.json();
			setSelectedChat(updatedChat);

			// Refresh chat list to show updated status
			triggerRefreshChats();

			toast.success(`Chat ${status.toLowerCase()}`);
		} catch (error) {
			console.error("Error updating chat status:", error);
			toast.error("Failed to update chat status");
		}
	};

	// Select a chat
	const handleSelectChat = async (chatId: string) => {
		try {
			// Fetch chat details
			const response = await fetch(`/api/chat/${chatId}`, {
				credentials: "include",
			});

			if (response.ok) {
				const chat = await response.json();
				setSelectedChat(chat);
				await fetchMessages(chatId);
			}
		} catch (error) {
			console.error("Error selecting chat:", error);
		}
	};

	// Initial load - nothing needed since ChatList handles chat fetching

	// Check if user is admin
	if (user?.role !== "ADMIN") {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-2">
						Access Denied
					</h1>
					<p className="text-muted-foreground">
						You need admin privileges to access this page.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col lg:flex-row gap-4 p-2 lg:p-4 max-h-screen overflow-hidden">
			{/* Chat List - Left Sidebar */}
			<div className="w-full lg:w-1/3 lg:min-w-[300px] h-1/3 lg:h-full overflow-hidden">
				<ChatList
					selectedChatId={selectedChat?.id}
					onChatSelect={handleSelectChat}
					showNewChatButton={false}
				/>
			</div>

			{/* Chat Window - Main Content */}
			<div className="flex-1 h-2/3 lg:h-full min-h-0">
				{selectedChat ? (
					<ChatWindow
						chat={selectedChat}
						messages={messages}
						currentUserId={user.id}
						onSendMessage={handleSendMessage}
						onUpdateChatStatus={handleUpdateChatStatus}
						isLoading={isLoadingMessages}
					/>
				) : (
					<div className="h-full flex items-center justify-center border border-dashed rounded-lg">
						<div className="text-center text-muted-foreground px-4">
							<div className="text-4xl lg:text-6xl mb-4">💬</div>
							<h3 className="text-base lg:text-lg font-medium mb-2">
								Welcome to Admin Chat
							</h3>
							<p className="text-sm">
								Select a chat from the list to start viewing messages
							</p>
							<p className="text-xs mt-2">
								You can see all chat conversations between sellers and admins
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
