import type { EventType, WebSocketMessage } from "./types";
import {
  ConversationHandler,
  ConnectionHandler,
} from "./handlers";
import {
  convertKeysToCamelCase,
  convertKeysToSnakeCase,
} from "~/lib/utils/string-transforms";

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private handlers: Map<EventType, any> = new Map();
  private eventListeners: Map<
    EventType,
    ((message: WebSocketMessage) => void)[]
  > = new Map();

  constructor(
    private url: string,
    private userId: string,
    private userType: "contact",
    private inboxId: string
  ) {
    this.initializeHandlers();
  }

  private initializeHandlers() {
    const conversationHandler = new ConversationHandler();
    const connectionHandler = new ConnectionHandler();

    this.handlers.set("connection_established", connectionHandler);
    this.handlers.set("conversation_start", conversationHandler);
    this.handlers.set("conversation_send_message", conversationHandler);
    this.handlers.set("conversation_get_by_id", conversationHandler);
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

  connect() {
    try {
      this.ws = new WebSocket(
        `${this.url}?type=${this.userType}&user_id=${this.userId}&inbox_id=${this.inboxId}`
      );
      this.setupEventHandlers();
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.handleReconnect();
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
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      setTimeout(
        () => this.connect(),
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

    // Notify event listeners
    const listeners = this.eventListeners.get(message.event);
    if (listeners) {
      listeners.forEach((listener) => listener(message));
    }
  }

  public sendCreateConversation() {
    const message = this.createWebSocketMessage("conversation_start", {
      inboxId: this.inboxId,
    });
    this.send(message);
  }

  public sendMessage(conversationId: string, content: string) {
    const message = this.createWebSocketMessage("conversation_send_message", {
      conversationId,
      content,
      type: "text",
    });
    this.send(message);
  }

  public getConversationById(conversationId: string) {
    const message = this.createWebSocketMessage("conversation_get_by_id", {
      conversationId,
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

  public on(event: EventType, handler: (message: WebSocketMessage) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(handler);
  }

  public off(event: EventType, handler: (message: WebSocketMessage) => void) {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }
}
