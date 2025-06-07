export { analyticsService } from "./analytics";
export { authService } from "./auth";
export { cannedResponsesService } from "./canned-responses";
export { companyService } from "./company";
export { contactsService } from "./contacts";
export { conversationService } from "./conversations";
export { inboxService } from "./inbox";
export { notificationService } from "./notifications";
export { notificationSettingsService } from "./notification-settings";
export { profileService } from "./profile";
export { superAdminService } from "./superadmin";
export { userService } from "./user";

// Re-export types
export type {
  AnalyticsDashboard,
  ConversationStats,
  MessageStats,
  ConversationStatusStats,
  AgentStats,
  AnalyticsParams,
} from "./analytics";
