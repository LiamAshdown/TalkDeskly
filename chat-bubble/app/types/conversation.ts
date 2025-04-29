export type SenderType = "contact" | "agent" | "system" | "bot";

export interface Sender {
  id: string;
  name: string;
  type: SenderType;
  avatarUrl?: string;
}

export interface FileMetadata {
  extension: string;
  filename: string;
  path: string;
  size: number;
  type: "documents" | "images" | "videos" | "audio" | "other";
  timestamp?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  name: string;
  content: string;
  sender: Sender;
  type: "text" | "file";
  metadata?: FileMetadata & { timestamp?: string };
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
