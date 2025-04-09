"use client";

import type { Conversation } from "@/lib/interfaces";
import { useMobileView } from "@/context/mobile-view-context";
import EmptyChatState from "./chat/empty-chat-state";
import ChatHeader from "./chat/chat-header";
import MessageList from "./chat/message-list";
import MessageInput from "./chat/message-input";

interface ChatPanelProps {
  conversation: Conversation | null;
  onSendMessage: (message: string) => void;
  isContactInfoOpen?: boolean;
  onToggleContactInfo?: () => void;
}

export default function ChatPanel({
  conversation,
  onSendMessage,
  isContactInfoOpen = true,
  onToggleContactInfo = () => {},
}: ChatPanelProps) {
  const { setMobileView } = useMobileView();

  if (!conversation) {
    return (
      <EmptyChatState
        onViewConversations={() => setMobileView("conversations")}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ChatHeader
        conversation={conversation}
        isContactInfoOpen={isContactInfoOpen}
        onToggleContactInfo={onToggleContactInfo}
        onBackToConversations={() => setMobileView("conversations")}
      />
      <MessageList conversation={conversation} />
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}
