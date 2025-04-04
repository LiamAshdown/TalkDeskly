import type { WebSocketMessage } from "../types";
import type { IWebSocketHandler } from "./types";

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
    }
  }

  private handleContactUpdated(message: WebSocketMessage): void {
    // Handle contact update
    console.log("Contact updated:", message);
  }

  private handleContactCreated(message: WebSocketMessage): void {
    // Handle contact creation
    console.log("Contact created:", message);
  }

  private handleContactDeleted(message: WebSocketMessage): void {
    // Handle contact deletion
    console.log("Contact deleted:", message);
  }
}
