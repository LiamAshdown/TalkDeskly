import type { WebSocketMessage } from "../types";
import type { IWebSocketHandler } from "./types";

export class MessageHandler implements IWebSocketHandler {
  handle(message: WebSocketMessage): void {
    switch (message.event) {
      case "message":
        this.handleNewMessage(message);
        break;
      case "message_sent":
        this.handleMessageSent(message);
        break;
      case "message_read":
        this.handleMessageRead(message);
        break;
    }
  }

  private handleNewMessage(message: WebSocketMessage): void {
    // Handle new message received
    console.log("New message received:", message);
  }

  private handleMessageSent(message: WebSocketMessage): void {
    // Handle message sent confirmation
    console.log("Message sent:", message);
  }

  private handleMessageRead(message: WebSocketMessage): void {
    // Handle message read confirmation
    console.log("Message read:", message);
  }
}
