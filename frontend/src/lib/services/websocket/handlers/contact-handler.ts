import {
  ContactNotePayload,
  IWebSocketHandler,
} from "@/lib/services/websocket/handlers/types";
import {
  ContactPayload,
  WebSocketMessage,
} from "@/lib/services/websocket/handlers/types";
import { useContactsStore } from "@/stores/contacts";

export class ContactHandler implements IWebSocketHandler {
  handle(message: WebSocketMessage): void {
    switch (message.event) {
      case "contact_updated":
        this.handleContactUpdated(message);
        break;
      case "contact_created":
        this.handleContactCreated(message);
        break;
      case "contact_deleted":
        this.handleContactDeleted(message);
        break;
      case "contact_note_created":
        this.handleContactNoteCreated(message);
        break;
    }
  }

  private handleContactUpdated(message: WebSocketMessage): void {
    useContactsStore
      .getState()
      .handleContactUpdated(message.payload as ContactPayload);
  }

  private handleContactCreated(message: WebSocketMessage): void {
    useContactsStore
      .getState()
      .handleContactCreated(message.payload as ContactPayload);
  }

  private handleContactDeleted(message: WebSocketMessage): void {
    // TODO
  }

  private handleContactNoteCreated(message: WebSocketMessage): void {
    useContactsStore
      .getState()
      .handleContactNoteCreated(message.payload as ContactNotePayload);
  }
}
