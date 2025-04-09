import {
  ConversationPayload,
  ConversationSendMessagePayload,
} from "@/lib/services/websocket/handlers/types";
import { IWebSocketHandler } from "@/lib/services/websocket/handlers/types";
import { WebSocketMessage } from "@/lib/services/websocket/handlers/types";
import { useConversationsStore } from "@/stores/conversations";

export class ConversationHandler implements IWebSocketHandler {
  handle(message: WebSocketMessage): void {
    switch (message.event) {
      case "conversation_start":
        this.handleConversationStart(message);
        break;
      case "conversation_send_message":
        this.handleConversationSendMessage(message);
        break;
      case "conversation_update":
        this.handleConversationUpdate(message);
        break;
    }
  }

  private handleConversationStart(message: WebSocketMessage): void {
    useConversationsStore
      .getState()
      .handleConversationStart(message.payload as ConversationPayload);
  }

  private handleConversationSendMessage(message: WebSocketMessage): void {
    useConversationsStore
      .getState()
      .handleConversationSendMessage(
        message.payload as ConversationSendMessagePayload
      );
  }

  private handleConversationUpdate(message: WebSocketMessage): void {
    useConversationsStore
      .getState()
      .handleConversationUpdate(message.payload as ConversationPayload);
  }
}
