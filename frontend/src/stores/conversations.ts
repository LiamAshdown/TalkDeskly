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

// Helper function to sort conversations by last message timestamp
const sortConversationsByLastMessage = (
  conversations: Conversation[]
): Conversation[] => {
  return [...conversations].sort((a, b) => {
    // Get the last message timestamp for each conversation
    const aLastMessage =
      a.messages.length > 0 ? a.messages[a.messages.length - 1].timestamp : "";
    const bLastMessage =
      b.messages.length > 0 ? b.messages[b.messages.length - 1].timestamp : "";

    // Sort in descending order (newest first)
    return bLastMessage.localeCompare(aLastMessage);
  });
};

export const useConversationsStore = create<ConversationsState>()(
  immer((set, get) => {
    return {
      conversations: [],
      setConversations: (conversations: Conversation[]) =>
        set({
          conversations: sortConversationsByLastMessage(conversations),
        }),

      fetchConversations: async () => {
        const response = await conversationService.getConversations();
        set({ conversations: sortConversationsByLastMessage(response.data) });
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
            // Add new conversation
            state.conversations.push(response.data);
          }

          // Sort conversations by last message
          state.conversations = sortConversationsByLastMessage(
            state.conversations
          );
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

          // Sort conversations by last message
          return {
            conversations: sortConversationsByLastMessage(updatedConversations),
          };
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
              updatedAt: new Date().toISOString(),
              lastMessage: "",
              lastMessageAt: new Date().toISOString(),
            });
            // Sort conversations by last message
            state.conversations = sortConversationsByLastMessage(
              state.conversations
            );
          }
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
            // Sort conversations by last message
            state.conversations = sortConversationsByLastMessage(
              state.conversations
            );
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
            state.conversations = sortConversationsByLastMessage(
              state.conversations
            );
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
                payload.messages ||
                state.conversations[conversationIndex].messages,
            };

            state.conversations = sortConversationsByLastMessage(
              state.conversations
            );
          }
        });
      },

      setConversationMessages: (
        conversationId: string,
        messages: Message[]
      ) => {
        set((state) => {
          const conversation = state.conversations.find(
            (c) => c.conversationId === conversationId
          );

          if (conversation) {
            conversation.messages = messages;
          }
        });
      },
    };
  })
);
