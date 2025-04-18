import { Contact, ContactNote, Conversation, Inbox } from "@/lib/interfaces";

export interface WebSocketMessage {
  event: EventType;
  payload: any;
  timestamp: Date;
}

export interface IWebSocketHandler {
  handle(message: WebSocketMessage): void;
}

export interface IWebSocketHandlerFactory {
  createHandler(): IWebSocketHandler;
}

export type EventType =
  | "message"
  | "message_sent"
  | "message_read"
  | "typing_start"
  | "typing_stop"
  | "conversation_start"
  | "conversation_end"
  | "conversation_send_message"
  | "conversation_update"
  | "conversation_typing"
  | "conversation_typing_stop"
  | "agent_assigned"
  | "contact_updated"
  | "contact_created"
  | "contact_deleted"
  | "contact_note_created"
  | "inbox_updated"
  | "inbox_created"
  | "team_member_updated";

type ConversationStatus = "active" | "closed" | "pending";

export interface ContactPayload extends Contact {}

export interface InboxPayload extends Inbox {}

export interface ContactNotePayload extends ContactNote {}

export interface ConversationPayload extends Conversation {}
export interface ConversationSendMessagePayload {
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
