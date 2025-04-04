import apiClient from "@/lib/api/client";
import { APIResponse } from "@/lib/api/types";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const userService = {
  async getUsers(): Promise<APIResponse<User[]>> {
    const response = await apiClient.get<APIResponse<User[]>>("/users");
    return response.data;
  },
};
