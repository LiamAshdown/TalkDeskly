import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";
import type { Conversation, Message } from "~/types/conversation";

interface ConversationState {
  conversation: Conversation | null;
  conversationId: string | null;
  setConversation: (conversation: Conversation) => void;
  setStatus: (status: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  endConversation: () => void;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set) => ({
      conversation: null,
      conversationId: null,
      setConversation: (conversation: Conversation) => {
        set({ conversation });

        if (conversation.conversationId) {
          set({ conversationId: conversation.conversationId });
        }
      },
      setConversationId: (conversationId: string) => {
        set({ conversationId });
      },
      setStatus: (status: string) => {
        set(
          produce((state: ConversationState) => {
            if (state.conversation) {
              state.conversation.status = status;
            }
          })
        );
      },
      setMessages: (messages: Message[]) => {
        set(
          produce((state: ConversationState) => {
            if (state.conversation) {
              state.conversation.messages = messages;
            }
          })
        );
      },

      addMessage: (message: Message) => {
        set(
          produce((state: ConversationState) => {
            if (state.conversation) {
              state.conversation.messages.push(message);
            }
          })
        );
      },
      endConversation: () => {
        set({ conversation: null, conversationId: null });
      },
    }),
    {
      name: "conversation-storage",
      partialize: (state) => ({ conversationId: state.conversationId }),
    }
  )
);
