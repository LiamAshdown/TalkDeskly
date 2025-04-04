import type React from "react"
import { cn } from "~/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { CheckCheck } from "lucide-react"
import { forwardRef } from "react"

export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string
  timestamp: string
  sender?: {
    name: string
    avatar?: string
    fallback: string
  }
  isCurrentUser?: boolean
  isRead?: boolean
}

const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ message, timestamp, sender, isCurrentUser = false, isRead = false, className, ...props }, ref) => {
    const isSystemMessage = sender?.name === "System"

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full max-w-xs flex-col gap-2",
          isCurrentUser ? "ml-auto items-end" : "mr-auto items-start",
          isSystemMessage && "mx-auto items-center",
          className,
        )}
        {...props}
      >
        <div className="flex items-end gap-2">
          {!isCurrentUser && sender && !isSystemMessage && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={sender.avatar} alt={sender.name} />
              <AvatarFallback>{sender.fallback}</AvatarFallback>
            </Avatar>
          )}
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              isCurrentUser
                ? "bg-primary text-primary-foreground"
                : isSystemMessage
                  ? "bg-muted/50 text-muted-foreground italic text-center"
                  : "bg-muted",
            )}
          >
            {message}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{timestamp}</span>
          {isCurrentUser && isRead && <CheckCheck className="h-3 w-3 text-primary" />}
        </div>
      </div>
    )
  },
)

ChatBubble.displayName = "ChatBubble"

export { ChatBubble }

