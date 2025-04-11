import type React from "react";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { CheckCheck, Bot } from "lucide-react";
import { forwardRef } from "react";

export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    type: string;
    avatar?: string;
  };
  isRead?: boolean;
}

const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  (
    { message, timestamp, sender, isRead = false, className, ...props },
    ref
  ) => {
    const isSystemMessage = sender?.type === "system";
    const isAgentMessage = sender?.type === "agent";
    const isContactMessage = sender?.type === "contact";
    const isBotMessage = sender?.type === "bot";

    const renderAvatar = () => {
      if (isContactMessage || isSystemMessage || !sender) return null;

      return (
        <Avatar className="h-10 w-10">
          {isBotMessage ? (
            <AvatarFallback>
              <Bot className="h-6 w-6" />
            </AvatarFallback>
          ) : (
            <>
              <AvatarImage src={sender.avatar} alt={sender.name} />
              <AvatarFallback>{sender.name}</AvatarFallback>
            </>
          )}
        </Avatar>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full max-w-xs flex-col gap-2",
          isContactMessage && "ml-auto items-start",
          isSystemMessage && "mx-auto items-center",
          (isAgentMessage || isBotMessage) && "mx-auto items-end",
          className
        )}
        {...props}
      >
        <div className="flex items-end gap-2">
          {renderAvatar()}
          <div
            className={cn("rounded-lg px-3 py-2 text-sm", {
              "bg-muted": isContactMessage,
              "bg-muted/50 text-muted-foreground italic text-center":
                isSystemMessage,
              "bg-primary/90 text-primary-foreground": isBotMessage,
              "bg-primary text-primary-foreground": isAgentMessage,
            })}
          >
            {message}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{timestamp}</span>
          {isContactMessage && isRead && (
            <CheckCheck className="h-3 w-3 text-primary" />
          )}
        </div>
      </div>
    );
  }
);

ChatBubble.displayName = "ChatBubble";

export { ChatBubble };
