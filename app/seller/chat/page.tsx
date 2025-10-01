"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ChatList } from "@/components/chat/chat-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { NewChatDialog } from "@/components/chat/new-chat-dialog";
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

interface Admin {
	id: string;
	name: string;
	email: string;
	role: string;
}

export default function SellerChatPage() {
	const { user } = useAuth();
	const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [admins, setAdmins] = useState<Admin[]>([]);
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
	const [showNewChatDialog, setShowNewChatDialog] = useState(false);
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

	// Fetch admins for new chat creation
	const fetchAdmins = async () => {
		try {
			setIsLoadingAdmins(true);
			const response = await fetch("/api/chat/admins", {
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch admins");
			}

			const data = await response.json();
			setAdmins(data);
		} catch (error) {
			console.error("Error fetching admins:", error);
			toast.error("Failed to load admins");
		} finally {
			setIsLoadingAdmins(false);
		}
	};

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

	// Create a new chat
	const handleCreateChat = async (data: {
		subject?: string;
		participantIds: string[];
		initialMessage?: string;
	}) => {
		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to create chat");
			}

			const newChat = await response.json();

			// Send initial message if provided
			if (data.initialMessage) {
				const messageResponse = await fetch(
					`/api/chat/${newChat.id}/messages`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
						body: JSON.stringify({
							content: data.initialMessage,
							messageType: "TEXT",
						}),
					},
				);

				if (messageResponse.ok) {
					const initialMessage = await messageResponse.json();
					newChat.messages = [initialMessage];
				}
			}

			// Add to chat list and select it
			triggerRefreshChats(); // Refresh the chat list
			setSelectedChat(newChat);
			if (data.initialMessage) {
				setMessages([newChat.messages[0]]);
			} else {
				setMessages([]);
			}

			toast.success("Chat created successfully");
		} catch (error) {
			console.error("Error creating chat:", error);
			toast.error("Failed to create chat");
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

	// Handle new chat button
	const handleNewChat = () => {
		if (admins.length === 0) {
			fetchAdmins();
		}
		setShowNewChatDialog(true);
	};

	// Initial load - nothing needed since ChatList handles chat fetching

	// Check if user is seller
	if (user?.role !== "SELLER") {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-2">
						Access Denied
					</h1>
					<p className="text-muted-foreground">
						You need seller privileges to access this page.
					</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="h-full flex flex-col lg:flex-row gap-4 p-2 lg:p-4 max-h-screen overflow-hidden">
				{/* Chat List - Left Sidebar */}
				<div className="w-full lg:w-1/3 lg:min-w-[300px] h-1/3 lg:h-full overflow-hidden">
					<ChatList
						selectedChatId={selectedChat?.id}
						onChatSelect={handleSelectChat}
						onNewChat={handleNewChat}
						showNewChatButton={true}
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
							isLoading={isLoadingMessages}
						/>
					) : (
						<div className="h-full flex items-center justify-center border border-dashed rounded-lg">
							<div className="text-center text-muted-foreground px-4">
								<div className="text-4xl lg:text-6xl mb-4">💬</div>
								<h3 className="text-base lg:text-lg font-medium mb-2">
									Welcome to Seller Chat
								</h3>
								<p className="text-sm">
									Start a conversation with an admin or select an existing chat
								</p>
								<p className="text-xs mt-2">
									Click "New Chat" to initiate a conversation with an admin
								</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* New Chat Dialog */}
			<NewChatDialog
				open={showNewChatDialog}
				onOpenChange={setShowNewChatDialog}
				onCreateChat={handleCreateChat}
				admins={admins}
				isLoading={isLoadingAdmins}
			/>
		</>
	);
}
