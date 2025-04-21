import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useWebSocket } from "./websocket-context";
import { useConversationStore } from "~/stores/conversation";

interface TypingContextType {
  isTyping: boolean;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
}

const TypingContext = createContext<TypingContextType | null>(null);

export function TypingProvider({ children }: { children: ReactNode }) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { wsService } = useWebSocket();
  const { conversation } = useConversationStore();

  const handleSetMessage = (message: string) => {
    setNewMessage(message);

    if (conversation) {
      if (message.length > 0 && !isTyping) {
        setIsTyping(true);
        wsService.startTyping(conversation.conversationId);
      } else if (message.length === 0 && isTyping) {
        setIsTyping(false);
        wsService.stopTyping(conversation.conversationId);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !conversation) return;

    wsService.sendMessage(conversation.conversationId, newMessage);
    wsService.stopTyping(conversation.conversationId);
    setNewMessage("");
  };

  return (
    <TypingContext.Provider
      value={{
        isTyping,
        newMessage,
        setNewMessage: handleSetMessage,
        handleSendMessage,
      }}
    >
      {children}
    </TypingContext.Provider>
  );
}

export function useTyping() {
  const context = useContext(TypingContext);
  if (!context) {
    throw new Error("useTyping must be used within a TypingProvider");
  }
  return context;
}
