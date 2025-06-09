import apiClient from "@/lib/api/client";
import { APIResponse } from "@/lib/api/types";

export const miscService = {
  async getAppInformation(): Promise<
    APIResponse<{ appName: string; version: string }>
  > {
    const response = await apiClient.get<
      APIResponse<{ appName: string; version: string }>
    >(`/app-information`);
    return response.data;
  },
};
