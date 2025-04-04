import { conversationService } from "@/lib/api/services/conversations";
import { Conversation } from "@/lib/interfaces";
import { ConversationPayload } from "@/lib/services/websocket/handlers/types";
import { create } from "zustand";

interface ConversationsState {
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  handleConversationStart: (payload: ConversationPayload) => void;
  fetchConversations: () => Promise<void>;
}

export const useConversationsStore = create<ConversationsState>((set, get) => {
  return {
    conversations: [],
    setConversations: (conversations: Conversation[]) => set({ conversations }),

    fetchConversations: async () => {
      const response = await conversationService.getConversations();
      set({ conversations: response.data });
    },

    handleConversationStart: (payload: ConversationPayload) => {
      const { conversations } = get();
      const conversation = conversations.find(
        (c) => c.conversationId === payload.conversationId
      );
      if (conversation) {
        set({ conversations: [...conversations, conversation] });
      } else {
        set({
          conversations: [...conversations, payload],
        });
      }
    },
  };
});
