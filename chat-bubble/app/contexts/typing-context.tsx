import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useWebSocket } from "./websocket-context";
import { useChatStateContext } from "./chat-state-context";

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
  const chatState = useChatStateContext();

  const handleSetMessage = (message: string) => {
    setNewMessage(message);

    if (chatState.conversation) {
      if (message.length > 0 && !isTyping) {
        setIsTyping(true);
        wsService.startTyping(chatState.conversation.conversationId);
      } else if (message.length === 0 && isTyping) {
        setIsTyping(false);
        wsService.stopTyping(chatState.conversation.conversationId);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !chatState.conversation) return;

    wsService.sendMessage(chatState.conversation.conversationId, newMessage);
    wsService.stopTyping(chatState.conversation.conversationId);
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
