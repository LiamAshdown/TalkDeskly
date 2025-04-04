import type { WebSocketMessage } from "../types";
import type { IWebSocketHandler } from "./types";

export class InboxHandler implements IWebSocketHandler {
  handle(message: WebSocketMessage): void {
    switch (message.event) {
      case "inbox_updated":
        this.handleInboxUpdated(message);
        break;
      case "team_member_updated":
        this.handleTeamMemberUpdated(message);
        break;
    }
  }

  private handleInboxUpdated(message: WebSocketMessage): void {
    // Handle inbox update
    console.log("Inbox updated:", message);
  }

  private handleTeamMemberUpdated(message: WebSocketMessage): void {
    // Handle team member update
    console.log("Team member updated:", message);
  }
}
