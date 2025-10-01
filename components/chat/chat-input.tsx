"use client";

import { Paperclip, Send } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
	onSendMessage: (content: string) => void;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
}

export function ChatInput({
	onSendMessage,
	disabled = false,
	placeholder = "Type a message...",
	className,
}: ChatInputProps) {
	const [message, setMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!message.trim() || disabled || isSubmitting) {
			return;
		}

		setIsSubmitting(true);
		try {
			await onSendMessage(message.trim());
			setMessage("");
		} catch (error) {
			console.error("Failed to send message:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={cn("p-4 border-t bg-background", className)}
		>
			<div className="flex items-end gap-2">
				<div className="flex-1">
					<Textarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						disabled={disabled || isSubmitting}
						className="min-h-[40px] max-h-[120px] resize-none"
						rows={1}
					/>
				</div>

				<div className="flex gap-1">
					<Button
						type="button"
						variant="outline"
						size="icon"
						disabled={disabled || isSubmitting}
						className="shrink-0"
						title="Attach file (coming soon)"
					>
						<Paperclip className="h-4 w-4" />
					</Button>

					<Button
						type="submit"
						size="icon"
						disabled={disabled || isSubmitting || !message.trim()}
						className="shrink-0"
					>
						<Send className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="mt-2 text-xs text-muted-foreground">
				Press Enter to send, Shift + Enter for new line
			</div>
		</form>
	);
}
