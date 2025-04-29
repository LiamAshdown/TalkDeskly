import type {
  EventType,
  WebSocketMessage,
  SubscribedPayload,
  UnsubscribedPayload,
} from "~/lib/services/websocket/types";
import { ConnectionManager } from "~/lib/services/websocket/connection-manager";
import { SubscriptionManager } from "~/lib/services/websocket/subscription-manager";
import { EventDispatcher } from "~/lib/services/websocket/event-dispatcher";
import { MessageFactory } from "~/lib/services/websocket/message-factory";

// Connection configuration
export interface ConnectionConfig {
  userId: string;
  inboxId: string;
}

/**
 * Main WebSocket service for chat bubble (contact side)
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

    // Add handlers for subscription confirmations
    this.eventDispatcher.registerHandler(
      "subscribed",
      (message: WebSocketMessage) => {
        const payload = message.payload as SubscribedPayload;
        console.log(`Successfully subscribed to topic: ${payload.topic}`);
      }
    );

    this.eventDispatcher.registerHandler(
      "unsubscribed",
      (message: WebSocketMessage) => {
        const payload = message.payload as UnsubscribedPayload;
        console.log(`Successfully unsubscribed from topic: ${payload.topic}`);
      }
    );
  }

  // Connection methods
  public connect(userId: string, inboxId: string) {
    this.connectionManager.connect({ userId, inboxId });
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
    handler: (message: WebSocketMessage) => void
  ) {
    this.eventDispatcher.registerHandler(eventType, handler);
  }

  public unregisterHandler(
    eventType: EventType,
    handler: (message: WebSocketMessage) => void
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

  public unsubscribeFromConversation(conversationId: string): boolean {
    return this.subscriptionManager.unsubscribeFromConversation(conversationId);
  }

  public getSubscriptions(): Set<string> {
    return this.subscriptionManager.getSubscriptions();
  }

  // Conversation action methods
  public sendCreateConversation() {
    const payload = MessageFactory.preparePayload({
      inbox_id: this.connectionManager.getInboxId(),
    });

    const message = MessageFactory.createMessage("conversation_start", payload);
    this.connectionManager.send(message);
  }

  // Method to start conversation with pre-chat form data
  public startConversation(formData: any) {
    const payload = MessageFactory.preparePayload({
      inbox_id: this.connectionManager.getInboxId(),
      pre_chat_form_data: formData.formData,
    });

    const message = MessageFactory.createMessage("conversation_start", payload);
    this.connectionManager.send(message);
  }

  public sendMessage(conversationId: string, content: string) {
    const payload = MessageFactory.preparePayload({
      conversation_id: conversationId,
      content,
      type: "text",
    });

    const message = MessageFactory.createMessage(
      "conversation_send_message",
      payload
    );
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

  public getInboxDetails() {
    const payload = MessageFactory.preparePayload({
      inbox_id: this.connectionManager.getInboxId(),
    });

    const message = MessageFactory.createMessage("inbox_get_details", payload);
    this.connectionManager.send(message);
  }

  public startTyping(conversationId: string) {
    const payload = MessageFactory.preparePayload({
      conversation_id: conversationId,
    });

    const message = MessageFactory.createMessage(
      "conversation_typing",
      payload
    );
    this.connectionManager.send(message);
  }

  public stopTyping(conversationId: string) {
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

  public setUserId(userId: string) {
    this.connectionManager.setUserId(userId);
  }

  public getInboxId(): string | undefined {
    return this.connectionManager.getInboxId();
  }
}
