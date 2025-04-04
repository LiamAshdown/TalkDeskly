import { OnboardingUser, OnboardingCompany } from "@/lib/schemas/auth-schema";
import apiClient from "../client";
import { APIResponse } from "../types";
import { Company, User } from "@/lib/interfaces";

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthResponse {
  user: User & {
    company: Company;
  };
  token: string;
}

export interface OnboardingUserResponse {
  token: string;
}

export interface OnboardingCompanyResponse extends AuthResponse {}

export const authService = {
  async login(
    credentials: LoginCredentials
  ): Promise<APIResponse<AuthResponse>> {
    const response = await apiClient.post<APIResponse<AuthResponse>>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  async onboardingUser(
    data: OnboardingUser
  ): Promise<APIResponse<OnboardingUserResponse>> {
    const response = await apiClient.post<APIResponse<OnboardingUserResponse>>(
      "/onboarding/user",
      data
    );
    return response.data;
  },

  async onboardingCompany(
    data: OnboardingCompany
  ): Promise<APIResponse<OnboardingCompanyResponse>> {
    const response = await apiClient.post<
      APIResponse<OnboardingCompanyResponse>
    >("/onboarding/company", data);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post("/auth/reset-password", { token, password });
  },
};
