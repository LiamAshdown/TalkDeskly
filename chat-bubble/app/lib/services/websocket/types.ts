export type EventType =
  | "connection_established"
  | "join"
  | "leave"
  | "message"
  | "conversation_send_message"
  | "message_sent"
  | "message_read"
  | "typing_start"
  | "typing_stop"
  | "conversation_start"
  | "conversation_end"
  | "agent_assigned"
  | "contact_updated"
  | "contact_created"
  | "contact_deleted"
  | "inbox_updated"
  | "team_member_updated";

export interface WebSocketMessage {
  event: EventType;
  payload: any;
  timestamp: Date;
}

export interface ConnectionEstablishedPayload {
  contactId: string;
  userId: string;
  userType: "agent" | "contact";
}

export interface MessagePayload {
  conversation_id: string;
  content: string;
  type: string;
  metadata?: any;
}

export interface ConversationPayload {
  conversation_id: string;
  contact_id: string;
  agent_id?: string;
}
