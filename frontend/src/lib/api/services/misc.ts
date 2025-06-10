import apiClient from "@/lib/api/client";
import { APIResponse } from "@/lib/api/types";

export const miscService = {
  async getAppInformation(): Promise<
    APIResponse<{
      appName: string;
      version: string;
      registrationEnabled: boolean;
    }>
  > {
    const response = await apiClient.get<
      APIResponse<{
        appName: string;
        version: string;
        registrationEnabled: boolean;
      }>
    >(`/app-information`);
    return response.data;
  },
};
