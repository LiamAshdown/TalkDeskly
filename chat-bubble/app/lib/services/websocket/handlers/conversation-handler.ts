import type { WebSocketMessage } from "../types";
import type { IWebSocketHandler } from "./types";

export class ConversationHandler implements IWebSocketHandler {
  handle(message: WebSocketMessage): void {
    switch (message.event) {
      case "join":
        this.handleJoin(message);
        break;
      case "leave":
        this.handleLeave(message);
        break;
      case "conversation_start":
        this.handleConversationStart(message);
        break;
      case "conversation_end":
        this.handleConversationEnd(message);
        break;
      case "agent_assigned":
        this.handleAgentAssigned(message);
        break;
    }
  }

  private handleJoin(message: WebSocketMessage): void {
    // Handle user joining conversation
    console.log("User joined conversation:", message);
  }

  private handleLeave(message: WebSocketMessage): void {
    // Handle user leaving conversation
    console.log("User left conversation:", message);
  }

  private handleConversationStart(message: WebSocketMessage): void {
    // Handle conversation start
    console.log("Conversation started:", message);
  }

  private handleConversationEnd(message: WebSocketMessage): void {
    // Handle conversation end
    console.log("Conversation ended:", message);
  }

  private handleAgentAssigned(message: WebSocketMessage): void {
    // Handle agent assignment
    console.log("Agent assigned:", message);
  }
}
