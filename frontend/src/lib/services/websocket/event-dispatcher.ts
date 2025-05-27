import { convertKeysToCamelCase } from "@/lib/utils/string-transforms";
import {
  ConversationHandler,
  InboxHandler,
  ContactHandler,
  CompanyHandler,
} from "@/lib/services/websocket/handlers";
import type { WebSocketMessage } from "./types";
import { EventType } from "./handlers/types";

export class EventDispatcher {
  private handlers: Map<EventType, Array<(message: any) => void>> = new Map();
  private typeHandlers: Map<EventType, any> = new Map();

  constructor() {}

  // Register built-in handlers
  registerTypeHandlers() {
    const contactHandler = new ContactHandler();
    const inboxHandler = new InboxHandler();
    const conversationHandler = new ConversationHandler();
    const companyHandler = new CompanyHandler();

    // Contact event handlers
    this.typeHandlers.set("contact_updated", contactHandler);
    this.typeHandlers.set("contact_created", contactHandler);
    this.typeHandlers.set("contact_deleted", contactHandler);
    this.typeHandlers.set("contact_note_created", contactHandler);

    // Inbox event handlers
    this.typeHandlers.set("inbox_updated", inboxHandler);
    this.typeHandlers.set("inbox_created", inboxHandler);
    this.typeHandlers.set("inbox_deleted", inboxHandler);

    // Conversation event handlers
    this.typeHandlers.set("conversation_start", conversationHandler);
    this.typeHandlers.set("conversation_send_message", conversationHandler);
    this.typeHandlers.set("conversation_update", conversationHandler);
    this.typeHandlers.set("conversation_typing", conversationHandler);
    this.typeHandlers.set("conversation_typing_stop", conversationHandler);
    this.typeHandlers.set("conversation_close", conversationHandler);
    this.typeHandlers.set("conversation_get_by_id", conversationHandler);

    // Company event handlers
    this.typeHandlers.set("company_updated", companyHandler);

    // Connection events handlers
    this.typeHandlers.set("connection_established", {
      handle: (message: any) => {
        console.log("Connection established:", message.payload);
      },
    });

    this.typeHandlers.set("connection_error", {
      handle: (message: any) => {
        console.error("Connection error:", message.payload);
      },
    });
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

  registerHandler(eventType: EventType, handler: (message: any) => void) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  unregisterHandler(eventType: EventType, handler: (message: any) => void) {
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
