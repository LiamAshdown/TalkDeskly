import type { WebSocketMessage } from "./types";

// Connection configuration
export interface ConnectionConfig {
  userId: string;
  userType: string;
  companyId: string;
}

export class ConnectionManager {
  private ws: WebSocket | null = null;
  private url: string;
  private config: ConnectionConfig | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private onMessageCallback: ((message: WebSocketMessage) => void) | null =
    null;
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;
  private onErrorCallback: ((error: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  // Set callbacks
  setCallbacks(
    onMessage: (message: WebSocketMessage) => void,
    onConnect?: () => void,
    onDisconnect?: () => void,
    onError?: (error: Event) => void
  ) {
    this.onMessageCallback = onMessage;
    this.onConnectCallback = onConnect || null;
    this.onDisconnectCallback = onDisconnect || null;
    this.onErrorCallback = onError || null;
  }

  connect(config: ConnectionConfig): WebSocket | null {
    try {
      this.config = config;
      const { userId, userType, companyId } = config;
      const url = `${this.url}/agents/${userId}?user_type=${userType}&company_id=${companyId}`;

      this.ws = new WebSocket(url);
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
    }
    return false;
  }
}
