export interface User {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  notificationSettings: null | any;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  newConversation: boolean;
  newMessage: boolean;
  mentions: boolean;
  emailEnabled: boolean;
  browserEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  notificationSettings: NotificationSettings;
}

export interface CompanyInvite {
  company: Company;
  user: User;
  token: string;
  email: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  website: string;
  phone: string;
  address: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactNote {
  id: string;
  content: string;
  contactId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
}

export type InboxType = "web_chat" | "email" | "sms" | "whatsapp";

export interface WidgetCustomization {
  position: string;
  color: string;
}

export interface WorkingHours {
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export interface WorkingHoursMap {
  [key: string]: WorkingHours;
}

export interface UserInbox {
  id: string;
  name: string;
}

// Base inbox interface with common properties
export interface BaseInbox {
  id: string;
  name: string;
  type: InboxType;
  description: string;
  companyId: string;
  enabled: boolean;
  autoAssignmentEnabled: boolean;
  maxAutoAssignments: number;
  autoResponderEnabled: boolean;
  autoResponderMessage: string;
  createdAt: string;
  updatedAt: string;
  users: UserInbox[];
  userCount?: number;
}

// Pre-chat form field types
export type PreChatFieldType =
  | "text"
  | "email"
  | "phone"
  | "select"
  | "textarea";

// Pre-chat form field interface
export interface PreChatFormField {
  id: string;
  type: PreChatFieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[]; // For select fields
  contactField?: string; // Maps to a contact property: "name", "email", "phone"
}

// Pre-chat form interface
export interface PreChatForm {
  enabled: boolean;
  title: string;
  description: string;
  fields: PreChatFormField[];
}

// Type-specific inbox interfaces
export interface WebChatInbox extends BaseInbox {
  type: "web_chat";
  welcomeMessage: string;
  workingHours: Record<string, WorkingHours>;
  workingHoursEnabled: boolean;
  outsideHoursMessage: string;
  widgetCustomization: WidgetCustomization;
  preChatForm?: PreChatForm;
}

export interface EmailInbox extends BaseInbox {
  type: "email";
  imapServer: string;
  imapPort: number;
  smtpServer: string;
  smtpPort: number;
  username: string;
}

// Union type for all inbox types
export type Inbox = WebChatInbox | EmailInbox;

type ConversationStatus = "active" | "closed" | "pending";

export interface Message {
  conversationId: string;
  name: string;
  content: string;
  sender: {
    id: string;
    name: string;
    type: string;
    avatarUrl?: string;
  };
  type: string;
  metadata: any;
  timestamp: string;
  private?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
}

export interface Conversation {
  inboxId: string;
  conversationId: string;
  status: ConversationStatus;
  messages: Message[];
  assignedTo?: {
    id: string;
    name: string;
  };
  contact: Contact;
  agent: {
    id: string;
    name: string;
  };
  inbox: {
    id: string;
    name: string;
  };
  private: boolean;
  updatedAt: string;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
}

export type SenderType = "agent" | "contact" | "bot" | "system";

export interface Bot {
  id: string;
  name: string;
  avatar: string;
  type: "bot";
  description?: string;
  capabilities?: string[];
}

export interface CannedResponse {
  id: string;
  title: string;
  message: string;
  tag: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | "assigned_conversation"
  | "new_message"
  | "mention";

export interface UserNotification {
  id: string;
  type: NotificationType;
  message: string;
  metadata: Record<string, any>;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  notifications: UserNotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}
