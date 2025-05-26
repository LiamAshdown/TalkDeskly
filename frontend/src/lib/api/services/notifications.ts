import apiClient from "@/lib/api/client";
import { APIResponse } from "@/lib/api/types";
import { UserNotification, NotificationListResponse } from "@/lib/interfaces";

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  unread_only?: boolean;
}

export interface MarkAsReadData {
  notification_ids: string[];
}

export const notificationService = {
  async getNotifications(
    params: NotificationQueryParams = {}
  ): Promise<APIResponse<NotificationListResponse>> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.unread_only) searchParams.append("unread_only", "true");

    const response = await apiClient.get<APIResponse<NotificationListResponse>>(
      `/notifications?${searchParams.toString()}`
    );
    return response.data;
  },

  async getNotification(id: string): Promise<APIResponse<UserNotification>> {
    const response = await apiClient.get<APIResponse<UserNotification>>(
      `/notifications/${id}`
    );
    return response.data;
  },

  async getUnreadCount(): Promise<APIResponse<{ unread_count: number }>> {
    const response = await apiClient.get<APIResponse<{ unread_count: number }>>(
      "/notifications/unread-count"
    );
    return response.data;
  },

  async markAsRead(
    data: MarkAsReadData
  ): Promise<APIResponse<{ affected_count: number }>> {
    const response = await apiClient.put<
      APIResponse<{ affected_count: number }>
    >("/notifications/mark-as-read", data);
    return response.data;
  },

  async markAllAsRead(): Promise<APIResponse<{ affected_count: number }>> {
    const response = await apiClient.put<
      APIResponse<{ affected_count: number }>
    >("/notifications/mark-all-as-read");
    return response.data;
  },

  async deleteNotification(id: string): Promise<APIResponse<void>> {
    const response = await apiClient.delete<APIResponse<void>>(
      `/notifications/${id}`
    );
    return response.data;
  },

  async deleteAllNotifications(): Promise<
    APIResponse<{ affected_count: number }>
  > {
    const response = await apiClient.delete<
      APIResponse<{ affected_count: number }>
    >("/notifications");
    return response.data;
  },
};
