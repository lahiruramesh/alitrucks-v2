"use client";

import { MessageCircle, Users } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Admin {
	id: string;
	name: string;
	email: string;
	role: string;
}

interface NewChatDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateChat: (data: {
		subject?: string;
		participantIds: string[];
		initialMessage?: string;
	}) => void;
	admins: Admin[];
	isLoading?: boolean;
}

export function NewChatDialog({
	open,
	onOpenChange,
	onCreateChat,
	admins,
	isLoading = false,
}: NewChatDialogProps) {
	const [selectedAdminId, setSelectedAdminId] = useState<string>("");
	const [subject, setSubject] = useState("");
	const [initialMessage, setInitialMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (!open) {
			// Reset form when dialog closes
			setSelectedAdminId("");
			setSubject("");
			setInitialMessage("");
			setIsSubmitting(false);
		}
	}, [open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedAdminId || isSubmitting) {
			return;
		}

		setIsSubmitting(true);
		try {
			await onCreateChat({
				subject: subject.trim() || undefined,
				participantIds: [selectedAdminId],
				initialMessage: initialMessage.trim() || undefined,
			});
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to create chat:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const selectedAdmin = admins.find((admin) => admin.id === selectedAdminId);

	const getAvatarInitials = (name: string) => {
		return name
			.split(" ")
			.map((word) => word[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<MessageCircle className="h-5 w-5" />
						Start New Chat
					</DialogTitle>
					<DialogDescription>
						Create a new chat conversation with an admin. They will be notified
						of your message.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="admin-select">Select Admin *</Label>
						{isLoading ? (
							<div className="animate-pulse">
								<div className="h-10 bg-gray-200 rounded" />
							</div>
						) : admins.length === 0 ? (
							<div className="p-4 text-center text-muted-foreground border border-dashed rounded">
								<Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
								<p className="text-sm">No admins available</p>
							</div>
						) : (
							<Select
								value={selectedAdminId}
								onValueChange={setSelectedAdminId}
							>
								<SelectTrigger>
									<SelectValue placeholder="Choose an admin to chat with" />
								</SelectTrigger>
								<SelectContent>
									{admins.map((admin) => (
										<SelectItem key={admin.id} value={admin.id}>
											<div className="flex items-center gap-3 w-full">
												<Avatar className="w-6 h-6">
													<AvatarFallback className="text-xs">
														{getAvatarInitials(admin.name)}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1">
													<div className="flex items-center gap-2">
														<span className="font-medium">{admin.name}</span>
														<Badge variant="outline" className="text-xs">
															{admin.role}
														</Badge>
													</div>
													<p className="text-xs text-muted-foreground">
														{admin.email}
													</p>
												</div>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					{selectedAdmin && (
						<div className="p-3 bg-muted rounded-lg">
							<div className="flex items-center gap-3">
								<Avatar className="w-8 h-8">
									<AvatarFallback className="text-xs">
										{getAvatarInitials(selectedAdmin.name)}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-medium text-sm">{selectedAdmin.name}</p>
									<p className="text-xs text-muted-foreground">
										{selectedAdmin.email}
									</p>
								</div>
							</div>
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="subject">Subject (Optional)</Label>
						<Input
							id="subject"
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							placeholder="What is this chat about?"
							maxLength={100}
						/>
						<p className="text-xs text-muted-foreground">
							{subject.length}/100 characters
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="initial-message">Initial Message (Optional)</Label>
						<Textarea
							id="initial-message"
							value={initialMessage}
							onChange={(e) => setInitialMessage(e.target.value)}
							placeholder="Write your first message..."
							rows={3}
							maxLength={500}
						/>
						<p className="text-xs text-muted-foreground">
							{initialMessage.length}/500 characters
						</p>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!selectedAdminId || isSubmitting || isLoading}
						>
							{isSubmitting ? "Creating..." : "Start Chat"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
