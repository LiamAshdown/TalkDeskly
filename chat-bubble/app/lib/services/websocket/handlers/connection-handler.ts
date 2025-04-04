import type { WebSocketMessage, ConnectionEstablishedPayload } from "../types";
import type { IWebSocketHandler } from "./types";

export class ConnectionHandler implements IWebSocketHandler {
  private onConnectionEstablished?: (
    payload: ConnectionEstablishedPayload
  ) => void;

  constructor(
    onConnectionEstablished?: (payload: ConnectionEstablishedPayload) => void
  ) {
    this.onConnectionEstablished = onConnectionEstablished;
  }

  handle(message: WebSocketMessage): void {
    switch (message.event) {
      case "connection_established":
        this.handleConnectionEstablished(message);
        break;
    }
  }

  private handleConnectionEstablished(message: WebSocketMessage): void {
    const payload = message.payload as ConnectionEstablishedPayload;
    if (this.onConnectionEstablished) {
      this.onConnectionEstablished(payload);
    }
    console.log("Connection established:", payload);
  }
}
