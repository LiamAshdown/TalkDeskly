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
}
