import { Button } from "~/components/ui/button";
import { X, MessageSquare, ArrowRight, Loader2 } from "lucide-react";
import { useWebSocket } from "~/contexts/websocket-context";
import { useChatStateContext } from "~/contexts/chat-state-context";

export function WelcomeScreen({ isConnected = false }) {
  const { dispatch } = useChatStateContext();
  const { wsService } = useWebSocket();

  const resetChat = () => {
    dispatch({ type: "RESET_CHAT" });
  };

  const startConversation = () => {
    dispatch({ type: "START_CONVERSATION" });
    wsService.sendCreateConversation();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with close button */}
      <div className="flex justify-end p-3">
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

      {/* Welcome content */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="bg-blue-500 h-12 w-12 rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>

        <h2 className="text-2xl font-semibold mb-2">Hi there! 👋</h2>
        <p className="text-muted-foreground mb-auto">
          We make it simple to connect with us. Feel free to ask us anything or
          share your feedback.
        </p>

        {/* Status message */}
        <div className="mt-6 bg-muted rounded-md p-4 mb-4">
          <p className="font-medium text-sm">We are away at the moment</p>
          <p className="text-muted-foreground text-sm">
            We will be back online at 09:00 AM
          </p>
        </div>

        {/* Start conversation button */}
        <Button
          onClick={startConversation}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-between"
          disabled={!isConnected}
        >
          {!isConnected ? (
            <>
              <span>Connecting...</span>
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              <span>Start Conversation</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        {/* Powered by footer */}
        <div className="mt-4 text-center text-xs text-muted-foreground flex items-center justify-center">
          <span className="mr-1">•</span>
          <span>Powered by Liam</span>
        </div>
      </div>
    </div>
  );
}
