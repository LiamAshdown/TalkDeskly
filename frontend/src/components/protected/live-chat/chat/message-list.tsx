import { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/interfaces";
import { Bot, Info } from "lucide-react";
import { useWebSocket } from "@/context/websocket-context";
import MessageSkeleton from "./message-skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageListProps {
  conversation: Conversation;
  isLoading?: boolean;
}

// MessageAvatar component to avoid duplication
const MessageAvatar = ({
  type,
  name,
  avatarUrl,
}: {
  type: string;
  name: string;
  avatarUrl?: string;
}) => {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className="h-8 w-8 mt-1">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Agent" />}
              <AvatarFallback>
                {type === "bot" ? (
                  <Bot />
                ) : type === "system" ? (
                  <Info />
                ) : (
                  name.substring(0, 2).toUpperCase()
                )}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{name}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

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

  useEffect(() => {
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 h-full max-h-[calc(100vh-12rem)] relative">
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
                <span className="text-sm text-muted-foreground italic px-4 py-1">
                  {message.content}
                </span>
              </div>
            ) : (
              <div className={cn("flex items-start gap-2 max-w-[80%]")}>
                {message.sender.type === "contact" && (
                  <MessageAvatar
                    type={message.sender.type}
                    name={message.sender.name}
                    avatarUrl={message.sender.avatarUrl}
                  />
                )}
                <div
                  className={cn(
                    "rounded-lg p-3",
                    (message.sender.type === "agent" ||
                      message.sender.type === "bot") &&
                      message.private
                      ? "bg-orange-500 text-white"
                      : message.sender.type === "agent" ||
                        message.sender.type === "bot"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                  {message.private && (
                    <>
                      <div className="h-px bg-white/30 my-1.5"></div>
                      <p className="text-xs font-medium opacity-90">
                        Private note
                      </p>
                    </>
                  )}
                </div>
                {(message.sender.type === "agent" ||
                  message.sender.type === "bot") && (
                  <MessageAvatar
                    type={message.sender.type}
                    name={message.sender.name}
                    avatarUrl={message.sender.avatarUrl}
                  />
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center text-muted-foreground py-8">
          No messages in this conversation yet.
        </div>
      )}
      {isTyping && (
        <div className="rounded-lg p-3 bg-muted w-16 h-8 flex items-center justify-center gap-2  bottom-4 left-4">
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse "></div>
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-100"></div>
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-200"></div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
