import { ChatHeader } from "~/components/conversation/chat-header";
import { ChatMessages } from "~/components/conversation/chat-bubble/chat-messages";
import { ChatInput } from "~/components/conversation/input/chat-input";
import { useChatStateContext } from "~/contexts/chat-state-context";
import { useTyping } from "~/contexts/typing-context";

export function ChatWindow() {
  const chatState = useChatStateContext();
  const { newMessage, setNewMessage, handleSendMessage } = useTyping();

  console.log("chatState", chatState.conversation);

  return (
    <>
      <ChatHeader />
      <ChatMessages messages={chatState.conversation?.messages || []} />
      <div className="border-t p-3">
        <ChatInput
          value={newMessage}
          onChange={setNewMessage}
          onSubmit={handleSendMessage}
          disabled={
            chatState.isConversationEnded ||
            chatState.conversation?.status === "closed"
          }
        />
      </div>
    </>
  );
}
