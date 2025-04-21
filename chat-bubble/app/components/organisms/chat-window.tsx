import { Button } from "~/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ChatHeader } from "~/components/molecules/chat-header";
import { ChatMessages } from "~/components/molecules/chat-messages";
import { ChatInput } from "~/components/atoms/chat-input";
import { useConversationStore } from "~/stores/conversation";
import { useChatStateContext } from "~/contexts/chat-state-context";
import { useTyping } from "~/contexts/typing-context";

export function ChatWindow() {
  const { conversation } = useConversationStore();
  const { chatState, dispatch } = useChatStateContext();
  const { newMessage, setNewMessage, handleSendMessage } = useTyping();

  const startNewConversation = () => {
    dispatch({ type: "RESET_CHAT" });
    dispatch({ type: "TOGGLE_CHAT", payload: true });
  };

  return (
    <>
      <ChatHeader />

      <ChatMessages messages={conversation?.messages || []} />

      <div className="border-t p-3">
        {chatState.isConversationEnded ? (
          <div className="flex justify-center">
            <Button onClick={startNewConversation} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Start New Conversation
            </Button>
          </div>
        ) : (
          <ChatInput
            value={newMessage}
            onChange={setNewMessage}
            onSubmit={handleSendMessage}
            disabled={
              chatState.isConversationEnded || conversation?.status === "closed"
            }
          />
        )}
      </div>
    </>
  );
}
