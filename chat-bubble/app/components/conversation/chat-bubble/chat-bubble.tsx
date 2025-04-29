import type React from "react";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { CheckCheck, Bot } from "lucide-react";
import { forwardRef } from "react";
import { FilePreview } from "./file-preview";
import type { Message } from "~/types/conversation";

export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  message: Message;
}

const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ message, className, ...props }, ref) => {
    const { content, timestamp, sender, type = "text", metadata } = message;

    const isSystemMessage = sender?.type === "system";
    const isAgentMessage = sender?.type === "agent";
    const isContactMessage = sender?.type === "contact";
    const isBotMessage = sender?.type === "bot";
    const isFileMessage = type === "file";

    // Add timestamp to metadata if it doesn't exist
    const fileMetadata = metadata
      ? {
          ...metadata,
          timestamp: metadata.timestamp || timestamp,
        }
      : undefined;

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
              {sender.avatarUrl && (
                <AvatarImage
                  src={sender.avatarUrl || "/placeholder.svg"}
                  alt={sender.name}
                />
              )}
              <AvatarFallback>
                {sender.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </>
          )}
        </Avatar>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full flex-col gap-2",
          isContactMessage && "items-start",
          isSystemMessage && "mx-auto items-center",
          (isAgentMessage || isBotMessage) && "items-end",
          isFileMessage ? "max-w-md" : "",
          className
        )}
        {...props}
      >
        <div className="flex items-end gap-2">
          <div
            className={cn("rounded-lg text-sm", {
              "bg-muted px-3 py-2": isContactMessage && !isFileMessage,
              "bg-muted/50 text-muted-foreground italic text-center px-3 py-2":
                isSystemMessage && !isFileMessage,
              "bg-primary/90 text-primary-foreground px-3 py-2":
                isBotMessage && !isFileMessage,
              "bg-primary text-primary-foreground px-3 py-2":
                isAgentMessage && !isFileMessage,
              "p-0": isFileMessage,
            })}
          >
            {isFileMessage && fileMetadata ? (
              <FilePreview
                content={content}
                metadata={fileMetadata}
                className={cn({
                  "bg-muted/10": isContactMessage,
                  "bg-muted/5": isSystemMessage,
                  "bg-primary/10": isBotMessage || isAgentMessage,
                })}
              />
            ) : (
              content
            )}
          </div>
          {renderAvatar()}
        </div>
        {!isFileMessage && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{timestamp}</span>
          </div>
        )}
      </div>
    );
  }
);

ChatBubble.displayName = "ChatBubble";

export { ChatBubble };
