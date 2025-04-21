export interface WebSocketMessage {
  event: EventType;
  payload: any;
  timestamp: Date;
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
  | "conversation_get_by_id"
  | "conversation_close"
  | "agent_assigned"
  | "contact_updated"
  | "contact_created"
  | "contact_deleted"
  | "contact_note_created"
  | "inbox_updated"
  | "inbox_created"
  | "inbox_deleted"
  | "connection_established"
  | "connection_error"
  | "team_member_updated"
  // PubSub events
  | "subscribe"
  | "unsubscribe"
  | "publish"
  | "subscribed"
  | "unsubscribed";
