import { Button } from "~/components/ui/button";
import { X, Minimize2, Maximize2, RefreshCw } from "lucide-react";
import { ChatAvatar } from "~/components/atoms/chat-avatar";

interface ChatHeaderProps {
  isConversationEnded: boolean;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onEndConversation: () => void;
  onStartNewConversation: () => void;
  onClose: () => void;
}

export function ChatHeader({
  isConversationEnded,
  isFullScreen,
  onToggleFullScreen,
  onEndConversation,
  onStartNewConversation,
  onClose,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b p-3">
      <div className="flex items-center gap-2">
        <ChatAvatar
          src="/placeholder.svg?height=32&width=32"
          fallback="SA"
          isConversationEnded={isConversationEnded}
        />
        <div>
          <h3 className="text-sm font-medium">Customer Support</h3>
          <p className="text-xs text-muted-foreground">
            {isConversationEnded ? "Conversation ended" : "Online"}
          </p>
        </div>
      </div>
      <div className="flex gap-1">
        {isConversationEnded ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={onStartNewConversation}
          >
            <RefreshCw className="h-3 w-3" />
            New Chat
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={onEndConversation}
          >
            End Chat
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleFullScreen}
          title={isFullScreen ? "Exit full screen" : "Full screen"}
        >
          {isFullScreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
          <span className="sr-only">
            {isFullScreen ? "Exit full screen" : "Full screen"}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </div>
  );
}
