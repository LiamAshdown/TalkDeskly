import apiClient from "@/lib/api/client";
import { APIResponse } from "@/lib/api/types";
import { Company } from "@/lib/interfaces";

export const companyService = {
  async getCompany(): Promise<APIResponse<Company>> {
    const response = await apiClient.get<APIResponse<Company>>("/companies");
    return response.data;
  },
  async updateCompany(company: Company): Promise<APIResponse<Company>> {
    const response = await apiClient.put<APIResponse<Company>>(
      "/companies",
      company
    );
    return response.data;
  },
  async updateCompanyLogo(data: File): Promise<APIResponse<Company>> {
    const formData = new FormData();
    formData.append("logo", data);

    const response = await apiClient.post<APIResponse<Company>>(
      "/companies/logo",
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
