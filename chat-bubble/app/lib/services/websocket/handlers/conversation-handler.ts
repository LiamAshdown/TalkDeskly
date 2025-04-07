import { useConversationStore } from "~/stores/conversation";
import type { ConversationGetByIdPayload, ConversationGetByIdResponsePayload, ConversationSendMessagePayload, ConversationStartPayload, WebSocketMessage } from "~/lib/services/websocket/types";
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
    useConversationStore.getState().setConversation(payload);
  }

  private handleConversationEnd(message: WebSocketMessage): void {
    // Handle conversation end
    console.log("Conversation ended:", message);
  }

  private handleConversationSendMessage(message: WebSocketMessage): void {
    const payload = message.payload as ConversationSendMessagePayload;
    useConversationStore.getState().addMessage(payload as Message);
  }

  private handleConversationGetById(message: WebSocketMessage): void {
    const payload = message.payload as ConversationGetByIdResponsePayload;
    useConversationStore.getState().setConversation(payload);
  }
}
