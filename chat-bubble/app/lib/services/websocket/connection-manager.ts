import type { WebSocketMessage } from "./types";
import type { ConnectionConfig } from "./websocket";

export class ConnectionManager {
  private ws: WebSocket | null = null;
  private config: ConnectionConfig | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private onMessageCallback: ((message: WebSocketMessage) => void) | null =
    null;
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;
  private onErrorCallback: ((error: Event) => void) | null = null;

  // Set callbacks
  setCallbacks(
    onMessage: (message: WebSocketMessage) => void,
    onConnect?: (() => void) | null,
    onDisconnect?: (() => void) | null,
    onError?: ((error: Event) => void) | null
  ) {
    this.onMessageCallback = onMessage;
    this.onConnectCallback = onConnect || null;
    this.onDisconnectCallback = onDisconnect || null;
    this.onErrorCallback = onError || null;
  }

  connect(config: ConnectionConfig): WebSocket | null {
    try {
      this.config = config;
      const { userId, inboxId, url } = config;

      const wsUrl = `${url}/contacts?contact_id=${userId}&inbox_id=${inboxId}`;

      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
      this.reconnectAttempts = 0;
      return this.ws;
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.handleReconnect();
      return null;
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      if (this.onConnectCallback) this.onConnectCallback();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        if (this.onMessageCallback) this.onMessageCallback(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      if (this.onDisconnectCallback) this.onDisconnectCallback();
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (this.onErrorCallback) this.onErrorCallback(error);
    };
  }

  private handleReconnect() {
    if (!this.config) return;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      setTimeout(
        () => this.connect(this.config!),
        this.reconnectDelay * this.reconnectAttempts
      );
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getWebSocket(): WebSocket | null {
    return this.ws;
  }

  send(message: WebSocketMessage): boolean {
    if (this.isConnected()) {
      this.ws!.send(JSON.stringify(message));
      return true;
    } else if (this.ws?.readyState === WebSocket.CONNECTING) {
      setTimeout(() => this.send(message), 100);
      return true;
    } else {
      console.error("WebSocket is not connected. Message not sent.");
      this.connect(this.config!);
      return false;
    }
  }

  getInboxId(): string | undefined {
    return this.config?.inboxId;
  }

  getUserId(): string | undefined {
    return this.config?.userId;
  }

  setUserId(userId: string) {
    this.config!.userId = userId;
  }
}
