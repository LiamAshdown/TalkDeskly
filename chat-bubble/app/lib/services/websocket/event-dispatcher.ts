import { convertKeysToCamelCase } from "~/lib/utils/string-transforms";
import {
  ConversationHandler,
  ConnectionHandler,
} from "~/lib/services/websocket/handlers";
import type { EventType, WebSocketMessage } from "./types";

export class EventDispatcher {
  private handlers: Map<EventType, Array<(message: WebSocketMessage) => void>> =
    new Map();
  private typeHandlers: Map<EventType, any> = new Map();

  constructor() {}

  // Register built-in handlers
  registerTypeHandlers() {
    const connectionHandler = new ConnectionHandler();
    const conversationHandler = new ConversationHandler();

    // Connection events handlers
    this.typeHandlers.set("connection_established", connectionHandler);

    // Conversation event handlers
    this.typeHandlers.set("conversation_start", conversationHandler);
    this.typeHandlers.set("conversation_send_message", conversationHandler);
    this.typeHandlers.set("conversation_get_by_id", conversationHandler);
    this.typeHandlers.set("conversation_typing", conversationHandler);
    this.typeHandlers.set("conversation_typing_stop", conversationHandler);
    this.typeHandlers.set("conversation_close", conversationHandler);

    // Other event handlers can be added here as needed
  }

  dispatch(message: WebSocketMessage) {
    // Convert kebab/snake case to camelCase
    const transformedMessage = convertKeysToCamelCase(message);

    // Call built-in type handlers
    const typeHandler = this.typeHandlers.get(message.event);
    if (typeHandler) {
      typeHandler.handle(transformedMessage);
    }

    // Call registered event listeners
    const eventListeners = this.handlers.get(message.event);
    if (eventListeners) {
      eventListeners.forEach((handler) => handler(transformedMessage));
    }
  }

  registerHandler(
    eventType: EventType,
    handler: (message: WebSocketMessage) => void
  ) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  unregisterHandler(
    eventType: EventType,
    handler: (message: WebSocketMessage) => void
  ) {
    const listeners = this.handlers.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(handler);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  clearHandlers() {
    this.handlers.clear();
  }
}
