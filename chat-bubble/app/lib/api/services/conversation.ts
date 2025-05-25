import apiClient from "~/lib/api/client";
import type { APIResponse } from "~/lib/api/types";
import type { Conversation } from "~/types/conversation";

export const conversationService = {
  async getConversation(
    conversationId: string,
    contactId: string
  ): Promise<APIResponse<Conversation>> {
    const response = await apiClient.get<APIResponse<Conversation>>(
      `/public/conversations/${conversationId}/${contactId}`
    );

    return response.data;
  },
};
