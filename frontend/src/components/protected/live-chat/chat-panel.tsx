"use client";

import { useMobileView } from "@/context/mobile-view-context";
import { useActiveConversation } from "@/context/active-conversation-context";
import EmptyChatState from "./chat/empty-chat-state";
import ChatHeader from "./chat/chat-header";
import MessageList from "./chat/message-list";
import ChatPortal from "./chat/input/chat-portal";
import { useEffect } from "react";

export default function ChatPanel() {
  const {
    activeConversation,
    isLoadingMessages,
    isContactInfoOpen,
    setIsContactInfoOpen,
  } = useActiveConversation();
  const { setMobileView } = useMobileView();

  if (!activeConversation) {
    return (
      <EmptyChatState
        onViewConversations={() => setMobileView("conversations")}
      />
    );
  }

  const handleToggleContactInfo = () => {
    const newState = !isContactInfoOpen;
    setIsContactInfoOpen(newState);
    setMobileView(newState ? "contact" : "chat");
  };

  useEffect(() => {
    setMobileView("chat");
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ChatHeader
        conversation={activeConversation}
        isContactInfoOpen={isContactInfoOpen}
        onToggleContactInfo={handleToggleContactInfo}
        onBackToConversations={() => setMobileView("conversations")}
      />
      <MessageList
        conversation={activeConversation}
        isLoading={isLoadingMessages}
      />
      <ChatPortal
        conversation={activeConversation}
        disabled={activeConversation.status === "closed"}
      />
    </div>
  );
}
