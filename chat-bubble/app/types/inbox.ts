interface WidgetCustomization {
  primary_color: string;
  position: string;
}

export interface WorkingHours {
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export interface WorkingHoursMap {
  [key: string]: WorkingHours;
}

export interface Inbox {
  id: string;
  name: string;
  type: string;
  description: string;
  company_id: string;
  enabled: boolean;
  autoAssignmentEnabled: boolean;
  maxAutoAssignments: number;
  autoResponderEnabled: boolean;
  autoResponderMessage: string;
  welcomeMessage: string;
  workingHoursEnabled: boolean;
  outsideHoursMessage: string;
  widgetCustomization: WidgetCustomization;
  preChatForm?: PreChatForm;
  icon: string;
  workingHours: Record<string, WorkingHours>;
  createdAt: string;
  updatedAt: string;
}

// Pre-chat form types
export interface PreChatFormField {
  id: string;
  type: "text" | "email" | "phone" | "select" | "textarea";
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[]; // For select fields
  contactField?: string; // Maps to a contact property: "name", "email", "phone"
}

export interface PreChatForm {
  enabled: boolean;
  title: string;
  description: string;
  fields: PreChatFormField[];
}
