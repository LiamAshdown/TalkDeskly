import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useChatStore } from "~/stores/chat-state";
import type { ChatStore } from "~/stores/chat-state";

interface ChatStateContextType extends ChatStore {}

const ChatStateContext = createContext<ChatStateContextType | null>(null);

export function ChatStateProvider({ children }: { children: ReactNode }) {
  const store = useChatStore();

  return (
    <ChatStateContext.Provider value={store}>
      {children}
    </ChatStateContext.Provider>
  );
}

export function useChatStateContext() {
  const context = useContext(ChatStateContext);
  if (!context) {
    throw new Error(
      "useChatStateContext must be used within a ChatStateProvider"
    );
  }
  return context;
}

// Export the store directly for use outside React context (like websocket handlers)
export { useChatStore };
