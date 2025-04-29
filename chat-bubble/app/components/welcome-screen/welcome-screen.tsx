import { Button } from "~/components/ui/button";
import { X, MessageSquare, ChevronLeft } from "lucide-react";
import { useWebSocket } from "~/contexts/websocket-context";
import { useChatStateContext } from "~/contexts/chat-state-context";
import { PreChatForm } from "../pre-chat-form/pre-chat-form";
import { useState } from "react";
import {
  isWithinWorkingHours,
  getNextOpeningTime,
} from "~/lib/utils/working-hours";
import { WelcomeScreenLoadingSkeleton } from "~/components/welcome-screen/welcome-screen-loading-skeleton";
import { WelcomeScreenHello } from "~/components/welcome-screen/welcome-screen-hello";

export interface WelcomeScreenProps {
  isConnected?: boolean;
  isLoading?: boolean;
}

export function WelcomeScreen({
  isConnected = false,
  isLoading = false,
}: WelcomeScreenProps) {
  const {
    chatState: { inboxData },
    dispatch,
  } = useChatStateContext();
  const { wsService } = useWebSocket();
  const [showPreChatForm, setShowPreChatForm] = useState(false);

  const resetChat = () => {
    dispatch({ type: "RESET_CHAT" });
  };

  const startConversation = () => {
    // Check if pre-chat form is enabled
    if (inboxData?.preChatForm && inboxData.preChatForm.enabled) {
      setShowPreChatForm(true);
    } else {
      // If no pre-chat form, start conversation directly
      dispatch({ type: "START_CONVERSATION" });
      wsService.sendCreateConversation();
    }
  };

  const isAvailable = isWithinWorkingHours(inboxData?.workingHours);
  const nextOpeningTime = getNextOpeningTime(inboxData?.workingHours);

  return (
    <div className="flex flex-col h-full bg-background dark:bg-zinc-900">
      <div className="flex justify-between items-center p-4">
        {showPreChatForm ? (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mr-2"
              onClick={() => setShowPreChatForm(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-sm">Talk Deskly</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="bg-blue-500 h-10 w-10 rounded-full flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-sm ml-3">Talk Deskly</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={resetChat}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <div className="flex-1 p-6 flex flex-col overflow-y-auto">
        {isLoading ? (
          <>
            <WelcomeScreenLoadingSkeleton />
          </>
        ) : (
          <>
            {!showPreChatForm ? (
              <WelcomeScreenHello
                inboxData={inboxData!}
                isAvailable={isAvailable}
                nextOpeningTime={nextOpeningTime}
                isConnected={isConnected}
                startConversation={startConversation}
              />
            ) : (
              <PreChatForm
                formData={inboxData!.preChatForm!}
                onBack={() => setShowPreChatForm(false)}
              />
            )}

            <div className="mt-auto pt-4 text-center text-xs text-muted-foreground flex items-center justify-center">
              <span className="mr-1">•</span>
              <span>Powered by Talk Deskly</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
