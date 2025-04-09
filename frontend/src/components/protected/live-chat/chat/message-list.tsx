import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/interfaces";
import { generateAvatarUrl } from "@/lib/utils/avatar";

interface MessageListProps {
  conversation: Conversation;
}

// MessageAvatar component to avoid duplication
const MessageAvatar = ({
  isAgent,
  name,
}: {
  isAgent: boolean;
  name: string;
}) => {
  if (isAgent) {
    return (
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Agent" />
        <AvatarFallback>AG</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className="h-8 w-8 mt-1">
      <AvatarImage src={generateAvatarUrl(name)} alt={name} />
      <AvatarFallback>
        {name.substring(0, 2).toUpperCase() || "CA"}
      </AvatarFallback>
    </Avatar>
  );
};

export default function MessageList({ conversation }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevConversationIdRef = useRef<string | null>(null);

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

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 h-full max-h-[calc(100vh-12rem)]">
      {conversation?.messages && conversation?.messages.length > 0 ? (
        conversation?.messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex",
              message.sender.type === "agent" ? "justify-end" : "justify-start"
            )}
          >
            <div className="flex items-start gap-2 max-w-[80%]">
              {message.sender.type !== "agent" && (
                <MessageAvatar isAgent={false} name={message.sender.name} />
              )}
              <div
                className={cn(
                  "rounded-lg p-3",
                  message.sender.type === "agent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p>{message.content}</p>
                <p>{message.sender.type}</p>
                <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
              </div>
              {message.sender.type === "agent" && (
                <MessageAvatar isAgent={true} name="Agent" />
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-muted-foreground py-8">
          No messages in this conversation yet.
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
