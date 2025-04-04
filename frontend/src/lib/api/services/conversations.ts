import apiClient from "@/lib/api/client";
import { APIResponse } from "@/lib/api/types";
import { Conversation } from "@/lib/interfaces";

export const conversationService = {
  async getConversations(): Promise<APIResponse<Conversation[]>> {
    const response = await apiClient.get<APIResponse<Conversation[]>>(
      "/conversations"
    );
    return response.data;
  },
};
