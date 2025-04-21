import { useContactStore } from "~/stores/contact-store";
import type { WebSocketMessage } from "../types";
import type { IWebSocketHandler } from "./types";

export class ConnectionHandler implements IWebSocketHandler {
  handle(message: WebSocketMessage): void {
    switch (message.event) {
      case "connection_established":
        this.handleConnectionEstablished(message);
        break;
    }
  }

  private handleConnectionEstablished(message: WebSocketMessage): void {
    if (message.payload?.userId) {
      useContactStore.getState().setContactId(message.payload.userId);
    }

    console.log("Connection established:", message);
  }
}
