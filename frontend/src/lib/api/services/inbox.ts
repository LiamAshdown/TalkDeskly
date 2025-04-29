import { CreateInboxFormData } from "@/lib/schemas/inbox-schema";
import apiClient from "../client";
import { APIResponse } from "../types";
import { Inbox } from "@/lib/interfaces";

export const inboxService = {
  async createInbox(
    data: CreateInboxFormData,
    type: "web_chat" | "email" = "web_chat"
  ): Promise<APIResponse<Inbox>> {
    const response = await apiClient.post<APIResponse<Inbox>>(
      `/inbox?type=${type}`,
      {
        ...data,
        type,
      }
    );
    return response.data;
  },
  async getInboxes(): Promise<APIResponse<Inbox[]>> {
    const response = await apiClient.get<APIResponse<Inbox[]>>("/inbox");
    return response.data;
  },
  async updateInboxUsers(
    inboxID: string,
    data: { agentIds: string[] }
  ): Promise<APIResponse<Inbox>> {
    const response = await apiClient.put<APIResponse<Inbox>>(
      `/inbox/${inboxID}/users`,
      data
    );
    return response.data;
  },
  async getInbox(inboxID: string): Promise<APIResponse<Inbox>> {
    const response = await apiClient.get<APIResponse<Inbox>>(
      `/inbox/${inboxID}`
    );
    return response.data;
  },
  async updateInbox(
    inboxID: string,
    data: Partial<Inbox>
  ): Promise<APIResponse<Inbox>> {
    const response = await apiClient.put<APIResponse<Inbox>>(
      `/inbox/${inboxID}`,
      data
    );
    return response.data;
  },
  async deleteInbox(inboxID: string): Promise<APIResponse<void>> {
    const response = await apiClient.delete<APIResponse<void>>(
      `/inbox/${inboxID}`
    );
    return response.data;
  },
};
