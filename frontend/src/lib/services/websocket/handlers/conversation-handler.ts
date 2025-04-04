import { Conversation } from "@/lib/interfaces";
import { IWebSocketHandler } from "@/lib/services/websocket/handlers/types";
import { WebSocketMessage } from "@/lib/services/websocket/handlers/types";
import { useConversationsStore } from "@/stores/conversations";

export class ConversationHandler implements IWebSocketHandler {
  handle(message: WebSocketMessage): void {
    switch (message.event) {
      case "conversation_start":
        this.handleConversationStart(message);
        break;
    }
  }

  private handleConversationStart(message: WebSocketMessage): void {
    useConversationsStore
      .getState()
      .handleConversationStart(message.payload as Conversation);
  }
}
