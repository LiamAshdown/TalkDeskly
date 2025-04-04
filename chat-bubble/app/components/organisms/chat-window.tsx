import { Button } from "~/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ChatHeader } from "~/components/molecules/chat-header";
import { ChatMessages } from "~/components/molecules/chat-messages";
import { ChatInput } from "~/components/atoms/chat-input";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  isRead: boolean;
  sender?: {
    name: string;
    avatar?: string;
    fallback: string;
  };
}

interface ChatWindowProps {
  isFullScreen: boolean;
  isConversationEnded: boolean;
  messages: Message[];
  newMessage: string;
  onToggleFullScreen: () => void;
  onEndConversation: () => void;
  onStartNewConversation: () => void;
  onClose: () => void;
  onNewMessageChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}

export function ChatWindow({
  isFullScreen,
  isConversationEnded,
  messages,
  newMessage,
  onToggleFullScreen,
  onEndConversation,
  onStartNewConversation,
  onClose,
  onNewMessageChange,
  onSendMessage,
}: ChatWindowProps) {
  return (
    <>
      <ChatHeader
        isConversationEnded={isConversationEnded}
        isFullScreen={isFullScreen}
        onToggleFullScreen={onToggleFullScreen}
        onEndConversation={onEndConversation}
        onStartNewConversation={onStartNewConversation}
        onClose={onClose}
      />

      <ChatMessages messages={messages} />

      <div className="border-t p-3">
        {isConversationEnded ? (
          <div className="flex justify-center">
            <Button onClick={onStartNewConversation} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Start New Conversation
            </Button>
          </div>
        ) : (
          <ChatInput
            value={newMessage}
            onChange={onNewMessageChange}
            onSubmit={onSendMessage}
          />
        )}
      </div>
    </>
  );
}
