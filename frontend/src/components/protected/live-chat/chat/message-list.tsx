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
          <div
            key={index}
            className={cn(
              "flex",
              message.sender.type === "system"
                ? "justify-center"
                : message.sender.type === "agent" ||
                  message.sender.type === "bot"
                ? "justify-end"
                : "justify-start"
            )}
          >
            {message.sender.type === "system" ? (
              <div className="flex items-center justify-center py-2">
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground font-normal px-4 py-1"
                >
                  {message.content}
                </Badge>
              </div>
            ) : (
              <div
                className={cn(
                  "flex items-start gap-3 max-w-[85%]",
                  message.sender.type === "contact"
                    ? "flex-row"
                    : "flex-row-reverse"
                )}
              >
                <MessageAvatar
                  type={message.sender.type}
                  name={message.sender.name}
                  avatarUrl={message.sender.avatarUrl}
                />
                <div
                  className={cn(
                    "rounded-lg p-3.5 shadow-sm",
                    message.sender.type === "contact"
                      ? "bg-muted rounded-tl-none"
                      : message.private
                      ? "bg-orange-500 text-white rounded-tr-none"
                      : "bg-primary text-primary-foreground rounded-tr-none"
                  )}
                >
                  {message.type === "file" ? (
                    <FileMessage
                      content={message.content}
                      metadata={message.metadata}
                    />
                  ) : (
                    <p className="leading-relaxed">{message.content}</p>
                  )}

                  {message.private && (
                    <>
                      <div className="h-px bg-white/30 my-2"></div>
                      <p className="text-xs font-medium">Private note</p>
                    </>
                  )}

                  <p
                    className={cn(
                      "text-[10px] mt-1.5",
                      message.sender.type === "contact"
                        ? "text-muted-foreground"
                        : message.private
                        ? "text-white/70"
                        : "text-primary-foreground/70"
                    )}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            )}
          </div>
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
