import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";
import type { Inbox } from "~/types/inbox";
import type { Conversation, Message } from "~/types/conversation";

// Chat state types
export type ChatState = {
  // UI State
  isOpen: boolean;
  isFullScreen: boolean;
  isConversationEnded: boolean;
  showEndDialog: boolean;
  conversationStarted: boolean;
  unreadCount: number;
  hasNewMessage: boolean;

  // Connection State
  isConnected: boolean;
  connectionError: string | null;

  // Inbox State
  inboxData: Inbox | null;
  isInboxLoading: boolean;

  // Conversation State
  conversation: Conversation | null;
  conversationId: string | null;
};

export interface ChatActions {
  // UI Actions
  toggleChat: (isOpen?: boolean) => void;
  toggleFullscreen: () => void;
  openEndDialog: () => void;
  closeEndDialog: () => void;
  resetChat: () => void;
  startConversation: () => void;
  endConversation: () => void;
  updateUnread: (count: number) => void;
  setNewMessage: (hasNew: boolean) => void;

  // Connection Actions
  setConnected: (isConnected: boolean) => void;
  setConnectionError: (error: string) => void;

  // Inbox Actions
  setInboxData: (data: Inbox) => void;
  setInboxLoading: (isLoading: boolean) => void;

  // Conversation Actions
  setConversation: (conversation: Conversation) => void;
  setConversationId: (conversationId: string) => void;
  setConversationStatus: (status: string) => void;
  setConversationMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export type ChatStore = ChatState & ChatActions;

export const initialChatState: ChatState = {
  // UI State
  isOpen: false,
  isFullScreen: false,
  isConversationEnded: false,
  showEndDialog: false,
  conversationStarted: false,
  unreadCount: 1,
  hasNewMessage: true,

  // Connection State
  isConnected: false,
  connectionError: null,

  // Inbox State
  inboxData: null,
  isInboxLoading: true,

  // Conversation State
  conversation: null,
  conversationId: null,
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      ...initialChatState,

      // UI Actions
      toggleChat: (isOpen?: boolean) =>
        set(
          produce((state: ChatStore) => {
            state.isOpen = isOpen !== undefined ? isOpen : !state.isOpen;
            if (isOpen) {
              state.unreadCount = 0;
              state.hasNewMessage = false;
            }
          })
        ),

      toggleFullscreen: () =>
        set(
          produce((state: ChatStore) => {
            state.isFullScreen = !state.isFullScreen;
          })
        ),

      openEndDialog: () =>
        set(
          produce((state: ChatStore) => {
            state.showEndDialog = true;
          })
        ),

      closeEndDialog: () =>
        set(
          produce((state: ChatStore) => {
            state.showEndDialog = false;
          })
        ),

      resetChat: () =>
        set(
          produce((state: ChatStore) => {
            state.isOpen = false;
            state.conversationStarted = false;
            state.isConversationEnded = false;
            state.conversation = null;
            state.conversationId = null;
          })
        ),

      startConversation: () =>
        set(
          produce((state: ChatStore) => {
            state.conversationStarted = true;
          })
        ),

      endConversation: () =>
        set(
          produce((state: ChatStore) => {
            state.showEndDialog = false;
            state.isOpen = false;
            state.conversationStarted = false;
            state.isConversationEnded = false;
            state.conversation = null;
            state.conversationId = null;
          })
        ),

      updateUnread: (count: number) =>
        set(
          produce((state: ChatStore) => {
            state.unreadCount = count;
          })
        ),

      setNewMessage: (hasNew: boolean) =>
        set(
          produce((state: ChatStore) => {
            state.hasNewMessage = hasNew;
          })
        ),

      // Connection Actions
      setConnected: (isConnected: boolean) =>
        set(
          produce((state: ChatStore) => {
            state.isConnected = isConnected;
          })
        ),

      setConnectionError: (error: string) =>
        set(
          produce((state: ChatStore) => {
            state.connectionError = error || null;
            if (error) {
              state.isConnected = false;
            }
          })
        ),

      // Inbox Actions
      setInboxData: (data: Inbox) =>
        set(
          produce((state: ChatStore) => {
            state.inboxData = data;
          })
        ),

      setInboxLoading: (isLoading: boolean) =>
        set(
          produce((state: ChatStore) => {
            state.isInboxLoading = isLoading;
          })
        ),

      // Conversation Actions
      setConversation: (conversation: Conversation) =>
        set(
          produce((state: ChatStore) => {
            state.conversation = conversation;
            state.conversationId = conversation.conversationId;
          })
        ),

      setConversationId: (conversationId: string) =>
        set(
          produce((state: ChatStore) => {
            state.conversationId = conversationId;
          })
        ),

      setConversationStatus: (status: string) =>
        set(
          produce((state: ChatStore) => {
            if (state.conversation) {
              state.conversation.status = status;
            }
          })
        ),

      setConversationMessages: (messages: Message[]) =>
        set(
          produce((state: ChatStore) => {
            if (state.conversation) {
              state.conversation.messages = messages;
            }
          })
        ),

      addMessage: (message: Message) =>
        set(
          produce((state: ChatStore) => {
            if (state.conversation) {
              state.conversation.messages.push(message);
            }
          })
        ),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        conversationId: state.conversationId,
      }),
    }
  )
);
