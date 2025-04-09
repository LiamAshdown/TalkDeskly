export type SenderType = "contact" | "agent";

export interface Sender {
  id: string;
  name: string;
  type: SenderType;
}

export interface Message {
  id: string;
  conversationId: string;
  name: string;
  content: string;
  sender: Sender;
  type: string;
  metadata?: any;
  timestamp: string;
}

export interface Conversation {
  inboxId: string;
  conversationId: string;
  status: string;
  contact: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  messages: Message[];
  agent: {
    id: string;
    name: string;
  };
  inbox: {
    id: string;
    name: string;
  };
  updatedAt: string;
  lastMessage: string;
  lastMessageAt: string;
}
