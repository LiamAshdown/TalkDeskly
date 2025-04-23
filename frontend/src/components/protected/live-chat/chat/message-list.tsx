"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/context/websocket-context";
import MessageSkeleton from "./list/message-skeleton";
import {
  MessageListProps,
  FileMessage,
  MessageAvatar,
  TypingIndicator,
} from "./list";
import { Message } from "./list/message";

export default function MessageList({
  conversation,
  isLoading = false,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevConversationIdRef = useRef<string | null>(null);
  const { wsService } = useWebSocket();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (conversation) {
      const isNewConversation =
        prevConversationIdRef.current !== conversation.conversationId;
      messagesEndRef.current?.scrollIntoView({
        behavior: isNewConversation ? "instant" : "smooth",
      });
      prevConversationIdRef.current = conversation.conversationId;
    }
  }, [conversation]);

  useEffect(() => {
    const handleConversationTyping = (data: {
      event: string;
      payload: {
        conversationId: string;
      };
    }) => {
      if (data.payload.conversationId === conversation.conversationId) {
        setIsTyping(true);
      }
    };

    const handleConversationTypingStop = (data: {
      event: string;
      payload: {
        conversationId: string;
      };
    }) => {
      if (data.payload.conversationId === conversation.conversationId) {
        setIsTyping(false);
      }
    };

    wsService.registerHandler("conversation_typing", handleConversationTyping);
    wsService.registerHandler(
      "conversation_typing_stop",
      handleConversationTypingStop
    );

    return () => {
      wsService.unregisterHandler(
        "conversation_typing",
        handleConversationTyping
      );
      wsService.unregisterHandler(
        "conversation_typing_stop",
        handleConversationTypingStop
      );
    };
  }, [wsService, conversation.conversationId]);

  if (isLoading) {
    return <MessageSkeleton />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 h-full max-h-[calc(100vh-12rem)]">
      {conversation?.messages && conversation?.messages.length > 0 ? (
        conversation?.messages.map((message, index) => (
          <Message key={index} message={message} />
        ))
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground p-8 rounded-lg border border-dashed">
            <p>No messages in this conversation yet.</p>
            <p className="text-xs mt-1">
              Start typing to begin the conversation
            </p>
          </div>
        </div>
      )}

      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}
