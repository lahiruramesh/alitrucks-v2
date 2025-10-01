"use client";

import { useEffect, useRef, useState } from "react";

interface UseRealTimeChatOptions {
  chatId?: string;
  userId?: string;
  enabled?: boolean;
  onNewMessage?: (message: any) => void;
  onChatUpdate?: (chat: any) => void;
}

export function useRealTimeChat({
  chatId,
  userId,
  enabled = true,
  onNewMessage,
  onChatUpdate
}: UseRealTimeChatOptions) {
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [lastChatUpdate, setLastChatUpdate] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for new messages
  const checkForNewMessages = async () => {
    if (!chatId || !enabled) return;

    try {
      const response = await fetch(`/api/chat/${chatId}/messages?since=${lastMessageId || ''}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const { messages } = data;

        if (messages && messages.length > 0) {
          // Get the latest message
          const latestMessage = messages[messages.length - 1];
          
          // Only trigger callback if it's not from the current user and is actually new
          if (latestMessage.senderId !== userId && latestMessage.id !== lastMessageId) {
            onNewMessage?.(latestMessage);
            setLastMessageId(latestMessage.id);
          }
        }
      }
    } catch (error) {
      console.error("Error polling for new messages:", error);
    }
  };

  // Poll for chat updates (status changes, etc.)
  const checkForChatUpdates = async () => {
    if (!chatId || !enabled) return;

    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        credentials: "include",
      });

      if (response.ok) {
        const chat = await response.json();
        
        // Check if chat was updated since last check
        if (lastChatUpdate && chat.updatedAt !== lastChatUpdate) {
          onChatUpdate?.(chat);
        }
        
        setLastChatUpdate(chat.updatedAt);
      }
    } catch (error) {
      console.error("Error polling for chat updates:", error);
    }
  };

  // Set up polling interval
  useEffect(() => {
    if (!enabled || !chatId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Poll every 2 seconds for new messages and updates
    intervalRef.current = setInterval(() => {
      checkForNewMessages();
      checkForChatUpdates();
    }, 2000);

    // Initial check
    checkForNewMessages();
    checkForChatUpdates();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [chatId, enabled, userId, lastMessageId, lastChatUpdate]);

  // Reset when chat changes
  useEffect(() => {
    setLastMessageId(null);
    setLastChatUpdate(null);
  }, [chatId]);

  return {
    isPolling: !!intervalRef.current,
  };
}