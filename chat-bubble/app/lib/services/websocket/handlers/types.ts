import type { WebSocketMessage } from "~/lib/services/websocket/types";

export interface IWebSocketHandler {
  handle(message: WebSocketMessage): void;
}

export interface IWebSocketHandlerFactory {
  createHandler(): IWebSocketHandler;
}
