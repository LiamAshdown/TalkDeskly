import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Conversation, Message } from "@/lib/interfaces";
import { conversationService } from "@/lib/api/services/conversations";
import { useWebSocket } from "./websocket-context";
import { useConversationsStore } from "@/stores/conversations";

interface ActiveConversationContextType {
  activeConversation: Conversation | null;
  activeConversationId: string | null;
  isLoadingMessages: boolean;
  isContactInfoOpen: boolean;
  setActiveConversationId: (id: string | null) => void;
  setIsContactInfoOpen: (isOpen: boolean) => void;
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
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
  const { wsService } = useWebSocket();
  const { conversations, setConversationMessages } = useConversationsStore();
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  useEffect(() => {
    if (activeConversationId) {
      const conversation = conversations.find(
        (conv) => conv.conversationId === activeConversationId
      );

      if (conversation) {
        setActiveConversation({
          ...conversation,
          messages: conversation.messages,
        });
      } else {
        setActiveConversation(null);
      }
    }
  }, [activeConversationId, conversations]);

  const handleSetActiveConversationId = async (
    conversationId: string | null
  ) => {
    if (!conversationId) {
      setActiveConversationId(null);
      return;
    }

    // Skip if it's already the active conversation
    if (conversationId === activeConversationId) {
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

  return (
    <ActiveConversationContext.Provider
      value={{
        activeConversation,
        activeConversationId,
        isLoadingMessages,
        isContactInfoOpen,
        setActiveConversationId: handleSetActiveConversationId,
        setIsContactInfoOpen,
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
