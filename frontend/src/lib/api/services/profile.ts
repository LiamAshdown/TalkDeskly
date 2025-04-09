import apiClient from "@/lib/api/client";
import { APIResponse } from "@/lib/api/types";
import { Profile } from "@/lib/interfaces";
import { ProfileUpdateFormData } from "@/lib/schemas/profile-schema";

export const profileService = {
  async getProfile(): Promise<APIResponse<Profile>> {
    const response = await apiClient.get<APIResponse<Profile>>("/profile");
    return response.data;
  },

  async updateProfile(
    data: ProfileUpdateFormData
  ): Promise<APIResponse<Profile>> {
    const response = await apiClient.put<APIResponse<Profile>>(
      "/profile",
      data
    );
    return response.data;
  },

  async updateProfileAvatar(data: File): Promise<APIResponse<Profile>> {
    const formData = new FormData();
    formData.append("avatar", data);

    const response = await apiClient.put<APIResponse<Profile>>(
      "/profile/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  async updateProfilePassword(
    data: ProfilePasswordUpdateFormData
  ): Promise<APIResponse<Profile>> {
    const response = await apiClient.put<APIResponse<Profile>>(
      "/profile/password",
      data
    );
    return response.data;
  },
};
