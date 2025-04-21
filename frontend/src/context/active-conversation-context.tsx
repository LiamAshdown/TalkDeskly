import { ReactNode, createContext, useContext, useState } from "react";
import { Conversation, Message } from "@/lib/interfaces";
import { conversationService } from "@/lib/api/services/conversations";
import { useWebSocket } from "./websocket-context";
import { useConversationsStore } from "@/stores/conversations";
import { FileWithPreview } from "@/components/protected/live-chat/chat/input/types";

interface ActiveConversationContextType {
  activeConversation: Conversation | null;
  activeConversationId: string | null;
  isLoadingMessages: boolean;
  isContactInfoOpen: boolean;
  setActiveConversationId: (id: string | null) => void;
  setIsContactInfoOpen: (isOpen: boolean) => void;
  sendMessage: (message: string, files: FileWithPreview[]) => void;
}

const ActiveConversationContext =
  createContext<ActiveConversationContextType | null>(null);

export function ActiveConversationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(true);
  const { wsService } = useWebSocket();
  const { conversations, setConversationMessages } = useConversationsStore();

  // Find active conversation
  const activeConversation =
    conversations.find(
      (conv) => conv.conversationId === activeConversationId
    ) || null;

  const handleSetActiveConversationId = async (
    conversationId: string | null
  ) => {
    if (!conversationId) {
      setActiveConversationId(null);
      return;
    }

    try {
      setIsLoadingMessages(true);
      const response = await conversationService.getConversationMessages(
        conversationId
      );

      wsService.subscribeToConversation(conversationId);

      if (activeConversationId) {
        wsService.unsubscribeFromConversation(activeConversationId);
      }

      setConversationMessages(conversationId, response.data);
      setActiveConversationId(conversationId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Function to send a message
  const sendMessage = (
    message: string,
    files: FileWithPreview[],
    type: "contact" | "agent" = "contact"
  ) => {
    if (!activeConversationId) return;
    wsService.sendMessage(activeConversationId, message, type);
  };

  return (
    <ActiveConversationContext.Provider
      value={{
        activeConversation,
        activeConversationId,
        isLoadingMessages,
        isContactInfoOpen,
        setActiveConversationId: handleSetActiveConversationId,
        setIsContactInfoOpen,
        sendMessage,
      }}
    >
      {children}
    </ActiveConversationContext.Provider>
  );
}

export function useActiveConversation() {
  const context = useContext(ActiveConversationContext);
  if (!context) {
    throw new Error(
      "useActiveConversation must be used within an ActiveConversationProvider"
    );
  }
  return context;
}
