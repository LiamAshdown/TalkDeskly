import type { Conversation } from "~/types/conversation";

export type EventType =
  | "join"
  | "leave"
  | "message"
  | "message_sent"
  | "message_read"
  | "typing_start"
  | "typing_stop"
  | "connection_established"
  | "conversation_start"
  | "conversation_end"
  | "conversation_typing"
  | "conversation_typing_stop"
  | "conversation_send_message"
  | "conversation_get_by_id"
  | "conversation_close"
  | "agent_assigned"
  | "contact_updated"
  | "contact_created"
  | "contact_deleted"
  | "inbox_updated"
  | "team_member_updated"
  // PubSub events
  | "subscribe"
  | "unsubscribe"
  | "subscribed"
  | "unsubscribed"
  | "inbox_get_details"
  | "connection_error";

export interface WebSocketMessage {
  event: EventType;
  payload: any;
  timestamp: Date;
}

export interface ConnectionEstablishedPayload {
  userId: string;
  type: "agent" | "contact";
}

export interface ConversationStartPayload extends Conversation {}

export interface ConversationGetByIdPayload {
  conversationId: string;
}

export interface ConversationSendMessagePayload {
  id: string;
  conversationId: string;
  name: string;
  content: string;
  sender: {
    name: string;
    type: string;
    id: string;
  };
  type: string;
  metadata: any;
  timestamp: string;
}

export interface ConversationGetByIdResponsePayload extends Conversation {}
export interface ConversationUpdatePayload extends Conversation {}

// PubSub related interfaces
export interface SubscribePayload {
  topic: string;
}

export interface UnsubscribePayload {
  topic: string;
}

export interface SubscribedPayload {
  topic: string;
  status: string;
}

export interface UnsubscribedPayload {
  topic: string;
  status: string;
}
