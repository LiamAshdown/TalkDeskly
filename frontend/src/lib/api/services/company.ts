import apiClient from "@/lib/api/client";
import { APIResponse } from "@/lib/api/types";
import { Company, CompanyInvite, TeamMember } from "@/lib/interfaces";

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
  async getCompanyInvite(token: string): Promise<APIResponse<CompanyInvite>> {
    const response = await apiClient.get<APIResponse<CompanyInvite>>(
      `/companies/invite/${token}`
    );
    return response.data;
  },
  async sendCompanyInvite(
    emails: string[]
  ): Promise<APIResponse<CompanyInvite[]>> {
    const response = await apiClient.post<APIResponse<CompanyInvite[]>>(
      `/companies/invite`,
      {
        emails,
      }
    );
    return response.data;
  },
  async getTeamMembers(): Promise<APIResponse<TeamMember[]>> {
    const response = await apiClient.get<APIResponse<TeamMember[]>>(
      `/companies/team-members`
    );
    return response.data;
  },
  async resendCompanyInvite(id: string): Promise<APIResponse<void>> {
    const response = await apiClient.post<APIResponse<void>>(
      `/companies/invites/${id}/resend`
    );
    return response.data;
  },
};
