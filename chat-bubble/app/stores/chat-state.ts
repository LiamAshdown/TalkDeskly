import { useReducer } from "react";
import type { Inbox } from "~/types/inbox";

// Chat state reducer types
export type ChatState = {
  isOpen: boolean;
  isFullScreen: boolean;
  isConversationEnded: boolean;
  showEndDialog: boolean;
  conversationStarted: boolean;
  unreadCount: number;
  hasNewMessage: boolean;
  inboxData: Inbox | null;
  isInboxLoading: boolean;
  isConnected: boolean;
};

export type ChatAction =
  | { type: "TOGGLE_CHAT"; payload?: boolean }
  | { type: "TOGGLE_FULLSCREEN" }
  | { type: "OPEN_END_DIALOG" }
  | { type: "CLOSE_END_DIALOG" }
  | { type: "RESET_CHAT" }
  | { type: "START_CONVERSATION" }
  | { type: "END_CONVERSATION" }
  | { type: "UPDATE_UNREAD"; count: number }
  | { type: "NEW_MESSAGE"; hasNew: boolean }
  | { type: "SET_INBOX_DATA"; data: Inbox }
  | { type: "SET_INBOX_LOADING"; isLoading: boolean }
  | { type: "SET_CONNECTED"; isConnected: boolean };

export const initialChatState: ChatState = {
  isOpen: false,
  isFullScreen: false,
  isConversationEnded: false,
  showEndDialog: false,
  conversationStarted: false,
  unreadCount: 1,
  hasNewMessage: true,
  inboxData: null,
  isInboxLoading: true,
  isConnected: false,
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "TOGGLE_CHAT":
      return {
        ...state,
        isOpen: action.payload !== undefined ? action.payload : !state.isOpen,
        unreadCount: action.payload ? 0 : state.unreadCount,
        hasNewMessage: action.payload ? false : state.hasNewMessage,
      };
    case "TOGGLE_FULLSCREEN":
      return { ...state, isFullScreen: !state.isFullScreen };
    case "OPEN_END_DIALOG":
      return { ...state, showEndDialog: true };
    case "CLOSE_END_DIALOG":
      return { ...state, showEndDialog: false };
    case "START_CONVERSATION":
      return { ...state, conversationStarted: true };
    case "END_CONVERSATION":
      return {
        ...state,
        showEndDialog: false,
        isOpen: false,
        conversationStarted: false,
        isConversationEnded: false,
      };
    case "RESET_CHAT":
      return {
        ...state,
        isOpen: false,
        conversationStarted: false,
        isConversationEnded: false,
      };
    case "UPDATE_UNREAD":
      return { ...state, unreadCount: action.count };
    case "NEW_MESSAGE":
      return { ...state, hasNewMessage: action.hasNew };
    case "SET_INBOX_DATA":
      return { ...state, inboxData: action.data };
    case "SET_INBOX_LOADING":
      return { ...state, isInboxLoading: action.isLoading };
    case "SET_CONNECTED":
      return { ...state, isConnected: action.isConnected };
    default:
      return state;
  }
}

// Custom hook to use the chat state
export function useChatState() {
  return useReducer(chatReducer, initialChatState);
}
