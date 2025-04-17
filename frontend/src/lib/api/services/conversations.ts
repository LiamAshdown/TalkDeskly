import apiClient from "@/lib/api/client";
import { APIResponse } from "@/lib/api/types";
import { Agent, Conversation } from "@/lib/interfaces";

export const conversationService = {
  async getConversations(): Promise<APIResponse<Conversation[]>> {
    const response = await apiClient.get<APIResponse<Conversation[]>>(
      "/conversations"
    );
    return response.data;
  },
  async getConversation(
    conversationId: string
  ): Promise<APIResponse<Conversation>> {
    const response = await apiClient.get<APIResponse<Conversation>>(
      `/conversations/${conversationId}`
    );
    return response.data;
  },
  async assignConversation(
    conversationId: string,
    assignedToId: string
  ): Promise<APIResponse<Conversation>> {
    const response = await apiClient.post<APIResponse<Conversation>>(
      `/conversations/${conversationId}/assign`,
      { assignedToId }
    );
    return response.data;
  },
  async getAssignableAgents(): Promise<APIResponse<Agent[]>> {
    const response = await apiClient.get<APIResponse<Agent[]>>(
      "/conversations/assignable-agents"
    );
    return response.data;
  },
  async closeConversation(
    conversationId: string
  ): Promise<APIResponse<Conversation>> {
    const response = await apiClient.post<APIResponse<Conversation>>(
      `/conversations/${conversationId}/close`
    );
    return response.data;
  },
};
