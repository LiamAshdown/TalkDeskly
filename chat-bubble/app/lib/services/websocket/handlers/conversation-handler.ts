import { useChatStore } from "~/stores/chat-state";
import type {
  ConversationSendMessagePayload,
  ConversationStartPayload,
  ConversationUpdatePayload,
  WebSocketMessage,
} from "~/lib/services/websocket/types";
import type { IWebSocketHandler } from "~/lib/services/websocket/handlers/types";
import type { Message } from "~/types/conversation";

export class ConversationHandler implements IWebSocketHandler {
  handle(message: WebSocketMessage): void {
    switch (message.event) {
      case "conversation_start":
        this.handleConversationStart(message);
        break;
      case "conversation_end":
        this.handleConversationEnd(message);
        break;
      case "conversation_send_message":
        this.handleConversationSendMessage(message);
        break;
      case "conversation_get_by_id":
        this.handleConversationGetById(message);
        break;
    }
  }

  private handleConversationStart(message: WebSocketMessage): void {
    const payload = message.payload as ConversationStartPayload;
    useChatStore.getState().setConversation(payload);
  }

  private handleConversationEnd(message: WebSocketMessage): void {
    // Handle conversation end
    console.log("Conversation ended:", message);
    useChatStore.getState().endConversation();
  }

  private handleConversationSendMessage(message: WebSocketMessage): void {
    const payload = message.payload as ConversationSendMessagePayload;
    useChatStore.getState().addMessage(payload as Message);
  }

  private handleConversationGetById(message: WebSocketMessage): void {
    const payload = message.payload as ConversationUpdatePayload;
    useChatStore.getState().setConversation(payload);
  }
}
