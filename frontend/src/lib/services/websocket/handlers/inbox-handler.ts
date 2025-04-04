import { IWebSocketHandler } from "@/lib/services/websocket/handlers/types";
import {
  InboxPayload,
  WebSocketMessage,
} from "@/lib/services/websocket/handlers/types";
import { useInboxesStore } from "@/stores/inboxes";

export class InboxHandler implements IWebSocketHandler {
  handle(message: WebSocketMessage): void {
    switch (message.event) {
      case "inbox_updated":
        this.handleInboxUpdated(message);
        break;
      case "inbox_created":
        this.handleInboxCreated(message);
        break;
    }
  }

  private handleInboxUpdated(message: WebSocketMessage): void {
    useInboxesStore
      .getState()
      .handleInboxUpdated(message.payload as InboxPayload);
  }

  private handleInboxCreated(message: WebSocketMessage): void {
    useInboxesStore
      .getState()
      .handleInboxCreated(message.payload as InboxPayload);
  }
}
