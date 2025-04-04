import type { WebSocketMessage } from "../types";
import type { IWebSocketHandler } from "./types";

export class TypingHandler implements IWebSocketHandler {
  handle(message: WebSocketMessage): void {
    switch (message.event) {
      case "typing_start":
        this.handleTypingStart(message);
        break;
      case "typing_stop":
        this.handleTypingStop(message);
        break;
    }
  }

  private handleTypingStart(message: WebSocketMessage): void {
    // Handle typing start
    console.log("User started typing:", message);
  }

  private handleTypingStop(message: WebSocketMessage): void {
    // Handle typing stop
    console.log("User stopped typing:", message);
  }
}
