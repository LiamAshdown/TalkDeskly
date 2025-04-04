import { create } from "zustand";

interface ConversationState {
  conversationId: string;
  setConversationId: (id: string) => void;
}

const getInitialContactId = () => {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("contactId");
  return stored || "";
};

export const useConversationStore = create<ConversationState>((set) => ({
  conversationId: getInitialConversationId(),
  setConversationId: (id: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("conversationId", id);
    }
    set({ conversationId: id });
  },
}));
