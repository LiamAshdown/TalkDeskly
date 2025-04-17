import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";
import type { Conversation, Message } from "~/types/conversation";

interface ConversationState {
  conversation: Conversation | null;
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
      setConversation: (conversation: Conversation) => {
        set({ conversation });
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
        set({ conversation: null });
      },
    }),
    {
      name: "conversation-storage",
    }
  )
);
