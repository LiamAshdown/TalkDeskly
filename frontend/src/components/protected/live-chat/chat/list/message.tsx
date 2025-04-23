import { cn } from "@/lib/utils";
import { Message as MessageType } from "@/lib/interfaces";
import { Badge } from "@/components/ui/badge";
import { FileMessage } from ".";
import { MessageAvatar } from ".";
import { Fragment, ReactNode } from "react";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const renderMessageWithMentions = (text: string, mention: string) => {
    const regex = new RegExp(`@${mention}`, "gi");
    const parts = text.split(regex);

    if (parts.length === 1) return text;

    const result: ReactNode[] = [];
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        result.push(
          <span
            key={`mention-${i}`}
            className="bg-orange-100 text-orange-700 rounded p-1 font-medium"
          >
            @{mention}
          </span>
        );
      }
      if (parts[i]) {
        result.push(<Fragment key={`text-${i}`}>{parts[i]}</Fragment>);
      }
    }
    return result;
  };

  return (
    <div
      className={cn(
        "flex",
        message.sender.type === "system"
          ? "justify-center"
          : message.sender.type === "agent" || message.sender.type === "bot"
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
            message.sender.type === "contact" ? "flex-row" : "flex-row-reverse"
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
              <p className="leading-relaxed">
                {renderMessageWithMentions(
                  message.content,
                  message.sender.name
                )}
              </p>
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
  );
}
