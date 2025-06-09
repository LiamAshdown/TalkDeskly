import { conversationService } from "@/lib/api/services/conversations";
import { Conversation, Message } from "@/lib/interfaces";
import {
  ConversationPayload,
  ConversationSendMessagePayload,
} from "@/lib/services/websocket/handlers/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface ConversationsState {
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  handleConversationStart: (payload: ConversationPayload) => void;
  handleConversationSendMessage: (
    payload: ConversationSendMessagePayload
  ) => void;
  handleConversationUpdate: (payload: ConversationPayload) => void;
  addMessageToConversation: (conversationId: string, message: any) => void;
  updateConversation: (conversation: Conversation) => void;
  fetchConversations: () => Promise<void>;
  fetchConversation: (conversationId: string) => Promise<void>;
  setConversationMessages: (
    conversationId: string,
    messages: Message[]
  ) => void;
}

export const useConversationsStore = create<ConversationsState>()(
  immer((set, get) => {
    return {
      conversations: [],
      setConversations: (conversations: Conversation[]) =>
        set({
          conversations,
        }),

      fetchConversations: async () => {
        const response = await conversationService.getConversations();
        set({ conversations: response.data });
      },

      fetchConversation: async (conversationId: string) => {
        const response = await conversationService.getConversation(
          conversationId
        );
        set((state) => {
          // Check if conversation already exists
          const existingIndex = state.conversations.findIndex(
            (c) => c.conversationId === conversationId
          );

          if (existingIndex !== -1) {
            // Update existing conversation
            state.conversations[existingIndex] = response.data;
          } else {
            // Add new conversation at the top
            state.conversations.unshift(response.data);
          }
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
            messages: [
              ...updatedConversations[conversationIndex].messages,
              message,
            ],
          };

          return {
            conversations: updatedConversations,
          };
        });
      },

      handleConversationStart: (payload: ConversationPayload) => {
        set((state) => {
          state.conversations.unshift(payload);
        });
      },

      handleConversationSendMessage: (
        payload: ConversationSendMessagePayload
      ) => {
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

      updateConversation: (conversation: Conversation) => {
        set((state) => {
          const index = state.conversations.findIndex(
            (c) => c.conversationId === conversation.conversationId
          );
          if (index !== -1) {
            state.conversations[index] = conversation;
          }
        });
      },

      handleConversationUpdate: (payload: ConversationPayload) => {
        set((state) => {
          const conversationIndex = state.conversations.findIndex(
            (c) => c.conversationId === payload.conversationId
          );
          if (conversationIndex !== -1) {
            state.conversations[conversationIndex] = {
              ...state.conversations[conversationIndex],
              ...payload,
              messages:
                payload.messages && payload.messages.length > 0
                  ? payload.messages
                  : state.conversations[conversationIndex].messages,
            };
          }
        });
      },

      setConversationMessages: (
        conversationId: string,
        messages: Message[]
      ) => {
        set((state) => {
          const conversationIndex = state.conversations.findIndex(
            (c) => c.conversationId === conversationId
          );

          if (conversationIndex !== -1) {
            state.conversations[conversationIndex] = {
              ...state.conversations[conversationIndex],
              messages: messages,
            };
          }
        });
      },
    };
  })
);
