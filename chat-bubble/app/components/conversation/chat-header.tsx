import { Button } from "~/components/ui/button";
import {
  X,
  Minimize2,
  Maximize2,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { ChatAvatar } from "~/components/conversation/chat-bubble/chat-avatar";
import { useChatStateContext } from "~/contexts/chat-state-context";

export function ChatHeader() {
  const { chatState, dispatch } = useChatStateContext();

  const toggleFullScreen = () => {
    dispatch({ type: "TOGGLE_FULLSCREEN" });
  };

  const handleEndConversation = () => {
    dispatch({ type: "OPEN_END_DIALOG" });
  };

  const startNewConversation = () => {
    // Implementation for starting a new conversation
  };

  const resetChat = () => {
    dispatch({ type: "RESET_CHAT" });
  };

  return (
    <div className="flex items-center justify-between border-b p-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <div className="bg-primary h-10 w-10 rounded-full flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <span className="font-medium text-sm ml-3">Talk Deskly</span>
        </div>
      </div>
      <div className="flex gap-1">
        {chatState.isConversationEnded ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={startNewConversation}
          >
            <RefreshCw className="h-3 w-3" />
            New Chat
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={handleEndConversation}
          >
            End Chat
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleFullScreen}
          title={chatState.isFullScreen ? "Exit full screen" : "Full screen"}
        >
          {chatState.isFullScreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
          <span className="sr-only">
            {chatState.isFullScreen ? "Exit full screen" : "Full screen"}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={resetChat}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </div>
  );
}
