import type {
  EventType,
  WebSocketMessage,
} from "@/lib/services/websocket/handlers/types";
import {
  convertKeysToCamelCase,
  convertKeysToSnakeCase,
} from "@/lib/utils/string-transforms";
import {
  ConversationHandler,
  InboxHandler,
  ContactHandler,
} from "@/lib/services/websocket/handlers";

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private handlers: Map<EventType, any> = new Map();
  private eventListeners: Map<EventType, ((message: any) => void)[]> =
    new Map();

  constructor(private url: string) {
    this.initializeHandlers();
  }

  private initializeHandlers() {
    const contactHandler = new ContactHandler();
    const inboxHandler = new InboxHandler();
    const conversationHandler = new ConversationHandler();

    this.handlers.set("contact_updated", contactHandler);
    this.handlers.set("contact_created", contactHandler);
    this.handlers.set("contact_deleted", contactHandler);

    this.handlers.set("inbox_updated", inboxHandler);
    this.handlers.set("inbox_created", inboxHandler);

    this.handlers.set("conversation_start", conversationHandler);
    this.handlers.set("conversation_send_message", conversationHandler);
  }

  private createWebSocketMessage(
    event: EventType,
    payload: any
  ): WebSocketMessage {
    return {
      event,
      payload,
      timestamp: new Date(),
    };
  }

  public connect(userId: string, userType: string) {
    try {
      this.ws = new WebSocket(`${this.url}?type=${userType}&user_id=${userId}`);
      this.setupEventHandlers();
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.handleReconnect(userId, userType);
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("WebSocket connected");
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  private handleReconnect(userId: string, userType: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      setTimeout(
        () => this.connect(userId, userType),
        this.reconnectDelay * this.reconnectAttempts
      );
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const handler = this.handlers.get(message.event);
    if (handler) {
      handler.handle(convertKeysToCamelCase(message));
    }

    // Call any registered event listeners
    const listeners = this.eventListeners.get(message.event);
    if (listeners) {
      listeners.forEach((listener) =>
        listener(convertKeysToCamelCase(message))
      );
    }
  }

  public sendMessage(conversationId: string, content: string) {
    const message = this.createWebSocketMessage("conversation_send_message", {
      conversationId,
      content,
      type: "text",
    });
    this.send(message);
  }

  private send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      message.payload = convertKeysToSnakeCase(message.payload);
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public getWebSocket(): WebSocket | null {
    return this.ws;
  }

  public registerHandler(
    eventType: EventType,
    handler: (message: any) => void
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)?.push(handler);
  }

  public unregisterHandler(
    eventType: EventType,
    handler: (message: any) => void
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(handler);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
}
