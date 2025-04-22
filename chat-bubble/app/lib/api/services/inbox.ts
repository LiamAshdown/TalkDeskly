import apiClient from "~/lib/api/client";
import type { APIResponse } from "~/lib/api/types";
import type { Inbox } from "~/types/inbox";

export const inboxService = {
  async getInbox(inboxId: string): Promise<APIResponse<Inbox>> {
    const response = await apiClient.get<APIResponse<Inbox>>(
      `/public/inbox/${inboxId}`
    );

    return response.data;
  },
};
