import type { EventType } from "@/lib/services/websocket/handlers/types";
import { ConnectionManager } from "./connection-manager";
import { SubscriptionManager } from "./subscription-manager";
import { EventDispatcher } from "./event-dispatcher";
import { MessageFactory } from "./message-factory";

// Connection configuration
export interface ConnectionConfig {
  userId: string;
  userType: string;
  companyId: string;
}

/**
 * Main WebSocket service that composes the functionality of other classes
 */
export class WebSocketService {
  private connectionManager: ConnectionManager;
  private subscriptionManager: SubscriptionManager;
  private eventDispatcher: EventDispatcher;

  constructor(private url: string) {
    this.connectionManager = new ConnectionManager(url);
    this.subscriptionManager = new SubscriptionManager();
    this.eventDispatcher = new EventDispatcher();

    // Set up callbacks
    this.connectionManager.setCallbacks(
      (message) => this.eventDispatcher.dispatch(message),
      () => {
        // When connected, give the subscription manager access to the websocket
        this.subscriptionManager.setWebSocket(
          this.connectionManager.getWebSocket()!
        );

        // Resubscribe to previous topics
        this.subscriptionManager.resubscribeAll();
      }
    );
  }

  public initializeHandlers() {
    this.eventDispatcher.registerTypeHandlers();
  }

  // Connection methods
  public connect(userId: string, userType: string, companyId: string) {
    this.connectionManager.connect({ userId, userType, companyId });
  }

  public disconnect() {
    this.connectionManager.disconnect();
  }

  public isConnected(): boolean {
    return this.connectionManager.isConnected();
  }

  // Event handling methods
  public registerHandler(
    eventType: EventType,
    handler: (message: any) => void
  ) {
    this.eventDispatcher.registerHandler(eventType, handler);
  }

  public unregisterHandler(
    eventType: EventType,
    handler: (message: any) => void
  ) {
    this.eventDispatcher.unregisterHandler(eventType, handler);
  }

  // Subscription methods
  public subscribe(topic: string): boolean {
    return this.subscriptionManager.subscribe(topic);
  }

  public unsubscribe(topic: string): boolean {
    return this.subscriptionManager.unsubscribe(topic);
  }

  public subscribeToConversation(conversationId: string): boolean {
    return this.subscriptionManager.subscribeToConversation(conversationId);
  }

  public subscribeToCompany(companyId: string): boolean {
    return this.subscriptionManager.subscribeToCompany(companyId);
  }

  public subscribeToUser(userId: string): boolean {
    return this.subscriptionManager.subscribeToUser(userId);
  }

  public subscribeToContact(contactId: string): boolean {
    return this.subscriptionManager.subscribeToContact(contactId);
  }

  public unsubscribeFromConversation(conversationId: string): boolean {
    return this.subscriptionManager.unsubscribeFromConversation(conversationId);
  }

  public getSubscriptions(): Set<string> {
    return this.subscriptionManager.getSubscriptions();
  }

  // Conversation action methods
  public sendMessage(
    conversationId: string,
    content: string,
    isPrivate: boolean = false
  ) {
    const payload = MessageFactory.preparePayload({
      conversation_id: conversationId,
      content,
      type: "text",
      private: isPrivate,
    });

    const message = MessageFactory.createMessage(
      "conversation_send_message",
      payload
    );
    this.connectionManager.send(message);
  }

  public startConversation(inboxId: string) {
    const payload = MessageFactory.preparePayload({
      inbox_id: inboxId,
    });

    const message = MessageFactory.createMessage("conversation_start", payload);
    this.connectionManager.send(message);
  }

  public getConversationById(conversationId: string) {
    const payload = MessageFactory.preparePayload({
      conversation_id: conversationId,
    });

    const message = MessageFactory.createMessage(
      "conversation_get_by_id",
      payload
    );
    this.connectionManager.send(message);
  }

  public closeConversation(conversationId: string) {
    const payload = MessageFactory.preparePayload({
      conversation_id: conversationId,
    });

    const message = MessageFactory.createMessage("conversation_close", payload);
    this.connectionManager.send(message);
  }

  public sendTypingIndicator(conversationId: string) {
    const payload = MessageFactory.preparePayload({
      conversation_id: conversationId,
    });

    const message = MessageFactory.createMessage(
      "conversation_typing",
      payload
    );
    this.connectionManager.send(message);
  }

  public sendTypingStopIndicator(conversationId: string) {
    const payload = MessageFactory.preparePayload({
      conversation_id: conversationId,
    });

    const message = MessageFactory.createMessage(
      "conversation_typing_stop",
      payload
    );
    this.connectionManager.send(message);
  }

  // Utility methods
  public getWebSocket(): WebSocket | null {
    return this.connectionManager.getWebSocket();
  }
}
