export class SubscriptionManager {
  private subscriptions: Set<string> = new Set();
  private ws: WebSocket | null = null;

  constructor() {}

  setWebSocket(ws: WebSocket) {
    this.ws = ws;
  }

  subscribe(topic: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error(
        "WebSocket is not connected. Cannot subscribe to topic:",
        topic
      );
      return false;
    }

    this.subscriptions.add(topic);
    this.ws.send(
      JSON.stringify({
        event: "subscribe",
        payload: { topic },
      })
    );
    return true;
  }

  unsubscribe(topic: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error(
        "WebSocket is not connected. Cannot unsubscribe from topic:",
        topic
      );
      return false;
    }

    this.subscriptions.delete(topic);
    this.ws.send(
      JSON.stringify({
        event: "unsubscribe",
        payload: { topic },
      })
    );
    return true;
  }

  // Subscribe to common channels
  subscribeToConversation(conversationId: string): boolean {
    this.subscribe(`conversation:${conversationId}`);

    // Subscribe to the private conversation channel
    return this.subscribe(`conversation-agent:${conversationId}`);
  }

  subscribeToCompany(companyId: string): boolean {
    return this.subscribe(`company:${companyId}`);
  }

  subscribeToUser(userId: string): boolean {
    return this.subscribe(`user:${userId}`);
  }

  subscribeToContact(contactId: string): boolean {
    return this.subscribe(`contact:${contactId}`);
  }

  // Unsubscribe from common channels
  unsubscribeFromConversation(conversationId: string): boolean {
    this.unsubscribe(`conversation:${conversationId}`);

    // Unsubscribe from the private conversation channel
    return this.unsubscribe(`conversation-agent:${conversationId}`);
  }

  // Resubscribe to all previous topics (useful after reconnection)
  resubscribeAll(): void {
    if (!this.ws) return;
    this.subscriptions.forEach((topic) => {
      this.ws?.send(
        JSON.stringify({
          event: "subscribe",
          payload: { topic },
        })
      );
    });
  }

  getSubscriptions(): Set<string> {
    return new Set(this.subscriptions);
  }

  clearSubscriptions(): void {
    this.subscriptions.clear();
  }
}
