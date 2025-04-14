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

interface WidgetCustomization {
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

interface UserInbox {
  id: string;
  name: string;
}

export interface Inbox {
  id: string;
  name: string;
  welcomeMessage: string;
  description: string;
  icon: string;
  companyId: string;
  enabled: boolean;
  autoAssignmentEnabled: boolean;
  maxAutoAssignments: number;
  autoResponderEnabled: boolean;
  autoResponderMessage: string;
  workingHours: Record<string, WorkingHours>;
  outsideHoursMessage: string;
  widgetCustomization: WidgetCustomization;
  createdAt: string;
  updatedAt: string;
  users: UserInbox[];
}

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
}

export interface Conversation {
  inboxId: string;
  conversationId: string;
  status: ConversationStatus;
  messages: Message[];
  contact: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
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

export type SenderType = "agent" | "contact" | "bot" | "system";

export interface Bot {
  id: string;
  name: string;
  avatar: string;
  type: "bot";
  description?: string;
  capabilities?: string[];
}
