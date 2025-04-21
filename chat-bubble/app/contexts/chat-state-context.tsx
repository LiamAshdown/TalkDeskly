import { createContext, useContext, useReducer } from "react";
import type { ReactNode, Dispatch } from "react";
import {
  chatReducer,
  initialChatState,
  type ChatState,
  type ChatAction,
} from "~/stores/chat-state";

interface ChatStateContextType {
  chatState: ChatState;
  dispatch: Dispatch<ChatAction>;
}

const ChatStateContext = createContext<ChatStateContextType | null>(null);

export function ChatStateProvider({ children }: { children: ReactNode }) {
  const [chatState, dispatch] = useReducer(chatReducer, initialChatState);

  return (
    <ChatStateContext.Provider value={{ chatState, dispatch }}>
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
