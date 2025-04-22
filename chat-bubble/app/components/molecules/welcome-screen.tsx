import { Button } from "~/components/ui/button";
import { X, ArrowRight, Loader2, MessageSquare } from "lucide-react";
import { useWebSocket } from "~/contexts/websocket-context";
import { useChatStateContext } from "~/contexts/chat-state-context";
import type { Inbox } from "~/types/inbox";
import { Skeleton } from "~/components/ui/skeleton";
import { WelcomeHeader } from "./welcome-header";
import { isWithinWorkingHours } from "~/lib/utils/working-hours";

export interface WelcomeScreenProps {
  isConnected?: boolean;
  isLoading?: boolean;
  inboxData?: Inbox | null;
}

export function WelcomeScreen({
  isConnected = false,
  isLoading = false,
  inboxData = null,
}: WelcomeScreenProps) {
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
      <div className="flex justify-between items-center p-3 border-b">
        <div className="flex items-center pl-2">
          <div className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="font-medium text-sm ml-2">TalkDeskly</span>
        </div>
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
        {isLoading ? (
          <>
            <Skeleton className="h-10 w-10 rounded-full mb-4" />
            <Skeleton className="h-8 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-6" />
            <Skeleton className="h-20 w-full rounded-md mb-4" />
            <Skeleton className="h-10 w-full rounded-md" />
          </>
        ) : (
          <>
            <WelcomeHeader inboxData={inboxData} />

            {/* Start conversation button */}
            <Button
              onClick={startConversation}
              className={`w-full ${
                isWithinWorkingHours(inboxData?.workingHours)
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white flex items-center justify-between`}
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
          </>
        )}

        {/* Spacer to push footer to bottom */}
        <div className="flex-grow"></div>

        {/* Powered by footer */}
        <div className="mt-4 text-center text-xs text-muted-foreground flex items-center justify-center">
          <span className="mr-1">•</span>
          <span>Powered by Talk Deskly</span>
        </div>
      </div>
    </div>
  );
}
