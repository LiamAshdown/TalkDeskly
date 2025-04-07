import { conversationService } from "@/lib/api/services/conversations";
import { Conversation } from "@/lib/interfaces";
import { ConversationPayload, ConversationSendMessagePayload } from "@/lib/services/websocket/handlers/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface ConversationsState {
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  handleConversationStart: (payload: ConversationPayload) => void;
  handleConversationSendMessage: (payload: ConversationSendMessagePayload) => void;
  addMessageToConversation: (conversationId: string, message: any) => void;
  fetchConversations: () => Promise<void>;
  fetchConversation: (conversationId: string) => Promise<void>;
}

export const useConversationsStore = create<ConversationsState>()(
  immer((set, get) => {
    return {
      conversations: [],
      setConversations: (conversations: Conversation[]) => set({ conversations }),

      fetchConversations: async () => {
        const response = await conversationService.getConversations();
        set({ conversations: response.data });
      },

      fetchConversation: async (conversationId: string) => {
        const response = await conversationService.getConversation(conversationId);
        set((state) => {
          state.conversations.push(response.data);
        });
      },

      addMessageToConversation: (conversationId: string, message: any) => {
        set((state) => {
          const conversationIndex = state.conversations.findIndex(
            (c) => c.conversationId === conversationId
          );

          if (conversationIndex === -1) return state;

          const updatedConversations = [...state.conversations];
          updatedConversations[conversationIndex] = {
            ...updatedConversations[conversationIndex],
            messages: [...updatedConversations[conversationIndex].messages, message]
          };

          return { conversations: updatedConversations };
        });
      },

      handleConversationStart: (payload: ConversationPayload) => {
        set((state) => {
          const conversation = state.conversations.find(
            (c) => c.conversationId === payload.conversationId
          );
          if (!conversation) {
            state.conversations.push({
              ...payload,
              messages: [],
            });
          }
        });
      },

      handleConversationSendMessage: (payload: ConversationSendMessagePayload) => {
        set((state) => {
          const conversation = state.conversations.find(
            (c) => c.conversationId === payload.conversationId
          );
          if (conversation) {
            conversation.messages.push(payload);
          } else {
            // Doesn't exist, fetch it
            get().fetchConversation(payload.conversationId);
          }
        });
      },
    };
  })
);
