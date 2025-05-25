import apiClient from "../client";
import { APIResponse } from "../types";
import { CannedResponse } from "@/lib/interfaces";

export const cannedResponsesService = {
  async getCannedResponses(): Promise<APIResponse<CannedResponse[]>> {
    const response = await apiClient.get<APIResponse<CannedResponse[]>>(
      "/canned-responses"
    );
    return response.data;
  },
  async createCannedResponse(
    data: Omit<CannedResponse, "id" | "createdAt" | "updatedAt" | "companyId">
  ): Promise<APIResponse<CannedResponse>> {
    const response = await apiClient.post<APIResponse<CannedResponse>>(
      "/canned-responses",
      data
    );
    return response.data;
  },
  async updateCannedResponse(
    id: string,
    data: CannedResponse
  ): Promise<APIResponse<CannedResponse>> {
    const response = await apiClient.put<APIResponse<CannedResponse>>(
      `/canned-responses/${id}`,
      data
    );
    return response.data;
  },
  async deleteCannedResponse(id: string): Promise<APIResponse<void>> {
    const response = await apiClient.delete<APIResponse<void>>(
      `/canned-responses/${id}`
    );
    return response.data;
  },
};
