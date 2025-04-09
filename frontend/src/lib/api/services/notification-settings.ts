import apiClient from "@/lib/api/client";
import { APIResponse } from "@/lib/api/types";
import { NotificationSettings } from "@/lib/interfaces";

export interface NotificationSettingsUpdateData {
  newConversation: boolean;
  newMessage: boolean;
  mentions: boolean;
  emailEnabled: boolean;
  browserEnabled: boolean;
}

export const notificationSettingsService = {
  async getNotificationSettings(): Promise<APIResponse<NotificationSettings>> {
    const response = await apiClient.get<APIResponse<NotificationSettings>>(
      "/notification-settings"
    );
    return response.data;
  },

  async updateNotificationSettings(
    data: NotificationSettingsUpdateData
  ): Promise<APIResponse<NotificationSettings>> {
    const response = await apiClient.put<APIResponse<NotificationSettings>>(
      "/notification-settings",
      data
    );
    return response.data;
  },
};
