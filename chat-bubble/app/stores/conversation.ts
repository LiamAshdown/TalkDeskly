import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";
import type { Conversation, Message } from "~/types/conversation";

interface ConversationState {
  conversation: Conversation | null;
  setConversation: (conversation: Conversation) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set) => ({
      conversation: null,
      setConversation: (conversation: Conversation) => {
        set({ conversation });
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
    }),
    {
      name: "conversation-storage",
    }
  )
);
