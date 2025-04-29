import { ChatHeader } from "~/components/conversation/chat-header";
import { ChatMessages } from "~/components/conversation/chat-bubble/chat-messages";
import { ChatInput } from "~/components/conversation/input/chat-input";
import { useConversationStore } from "~/stores/conversation";
import { useChatStateContext } from "~/contexts/chat-state-context";
import { useTyping } from "~/contexts/typing-context";

export function ChatWindow() {
  const { conversation } = useConversationStore();
  const { chatState, dispatch } = useChatStateContext();
  const { newMessage, setNewMessage, handleSendMessage } = useTyping();

  return (
    <>
      <ChatHeader />
      <ChatMessages messages={conversation?.messages || []} />
      <div className="border-t p-3">
        <ChatInput
          value={newMessage}
          onChange={setNewMessage}
          onSubmit={handleSendMessage}
          disabled={
            chatState.isConversationEnded || conversation?.status === "closed"
          }
        />
      </div>
    </>
  );
}
