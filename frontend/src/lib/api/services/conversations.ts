import apiClient from "@/lib/api/client";
import { APIResponse } from "@/lib/api/types";
import { Agent, Conversation, Message } from "@/lib/interfaces";

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
  async getAssignableAgents(
    conversationId: string
  ): Promise<APIResponse<Agent[]>> {
    const response = await apiClient.get<APIResponse<Agent[]>>(
      `/conversations/${conversationId}/assignable-agents`
    );
    return response.data;
  },
  async getConversationMessages(
    conversationId: string
  ): Promise<APIResponse<Message[]>> {
    const response = await apiClient.get<APIResponse<Message[]>>(
      `/conversations/${conversationId}/messages`
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
  async sendMessageAttachment(
    conversationId: string,
    senderType: string,
    senderId: string,
    files: File[]
  ): Promise<APIResponse<null>> {
    const formData = new FormData();
    formData.append("conversation_id", conversationId);
    formData.append("sender_type", senderType);
    formData.append("sender_id", senderId);

    for (const file of files) {
      formData.append("files", file);
    }

    const response = await apiClient.post<APIResponse<null>>(
      `/conversations/${conversationId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};
