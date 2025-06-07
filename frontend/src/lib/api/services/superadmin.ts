import apiClient from "@/lib/api/client";
import { APIResponse } from "@/lib/api/types";
import {
  SuperAdminStats,
  SuperAdminUser,
  SuperAdminCompany,
  User,
  Company,
} from "@/lib/interfaces";

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface CreateCompanyRequest {
  name: string;
  email: string;
  website?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCompanyRequest {
  name: string;
  email: string;
  website?: string;
  phone?: string;
  address?: string;
}

export interface UpdateConfigRequest {
  port?: string;
  baseUrl?: string;
  frontendUrl?: string;
  environment?: string;
  logLevel?: string;
  emailProvider?: string;
  emailHost?: string;
  emailPort?: string;
  emailUsername?: string;
  emailPassword?: string;
  emailFrom?: string;
  defaultLanguage?: string;
  supportedLanguages?: string[];
  applicationName?: string;
  enableRegistration?: string;
}

export interface SystemConfig {
  port: string;
  baseUrl: string;
  frontendUrl: string;
  environment: string;
  logLevel: string;
  databaseConfigured: boolean;
  redisConfigured: boolean;
  emailProvider: string;
  emailHost: string;
  emailPort: string;
  emailUsername: string;
  emailPassword: string;
  emailFrom: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  applicationName: string;
  enableRegistration: string;
}

export interface SystemMetric {
  name: string;
  status: "healthy" | "warning" | "critical";
  value: string;
  description: string;
  icon: string;
  error?: string;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
}

export interface SystemHealthResponse {
  overallStatus: "healthy" | "warning" | "critical";
  metrics: SystemMetric[];
  uptime: string;
  version: string;
  timestamp: string;
}

export const superAdminService = {
  // Dashboard
  getStats: async (): Promise<SuperAdminStats> => {
    const response = await apiClient.get<APIResponse<SuperAdminStats>>(
      "/superadmin/stats"
    );
    return response.data.data;
  },

  // User Management
  getAllUsers: async (
    page = 1,
    limit = 10,
    search?: string
  ): Promise<{
    users: SuperAdminUser[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    const response = await apiClient.get<
      APIResponse<{
        users: SuperAdminUser[];
        total: number;
        page: number;
        limit: number;
      }>
    >(`/superadmin/users?${params}`);
    return response.data.data;
  },

  getUser: async (id: string): Promise<SuperAdminUser> => {
    const response = await apiClient.get<APIResponse<SuperAdminUser>>(
      `/superadmin/users/${id}`
    );
    return response.data.data;
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<APIResponse<User>>(
      "/superadmin/users",
      data
    );
    return response.data.data;
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<APIResponse<User>>(
      `/superadmin/users/${id}`,
      data
    );
    return response.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/superadmin/users/${id}`);
  },

  // Company Management
  getAllCompanies: async (
    page = 1,
    limit = 10,
    search?: string
  ): Promise<{
    companies: SuperAdminCompany[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    const response = await apiClient.get<
      APIResponse<{
        companies: SuperAdminCompany[];
        total: number;
        page: number;
        limit: number;
      }>
    >(`/superadmin/companies?${params}`);
    return response.data.data;
  },

  getCompany: async (id: string): Promise<SuperAdminCompany> => {
    const response = await apiClient.get<APIResponse<SuperAdminCompany>>(
      `/superadmin/companies/${id}`
    );
    return response.data.data;
  },

  createCompany: async (data: CreateCompanyRequest): Promise<Company> => {
    const response = await apiClient.post<APIResponse<Company>>(
      "/superadmin/companies",
      data
    );
    return response.data.data;
  },

  updateCompany: async (
    id: string,
    data: UpdateCompanyRequest
  ): Promise<Company> => {
    const response = await apiClient.put<APIResponse<Company>>(
      `/superadmin/companies/${id}`,
      data
    );
    return response.data.data;
  },

  deleteCompany: async (id: string): Promise<void> => {
    await apiClient.delete(`/superadmin/companies/${id}`);
  },

  // Company Users
  getCompanyUsers: async (companyId: string): Promise<SuperAdminUser[]> => {
    const response = await apiClient.get<APIResponse<SuperAdminUser[]>>(
      `/superadmin/companies/${companyId}/users`
    );
    return response.data.data;
  },

  // Configuration Management
  getConfig: async (): Promise<SystemConfig> => {
    const response = await apiClient.get<APIResponse<SystemConfig>>(
      "/superadmin/config"
    );
    return response.data.data;
  },

  updateConfig: async (data: UpdateConfigRequest): Promise<void> => {
    await apiClient.put("/superadmin/config", data);
  },

  // System Health Management
  getSystemHealth: async (): Promise<SystemHealthResponse> => {
    const response = await apiClient.get<APIResponse<SystemHealthResponse>>(
      "/superadmin/system/health"
    );
    return response.data.data;
  },

  getSystemLogs: async (
    page = 1,
    limit = 50,
    level?: string,
    search?: string
  ): Promise<{
    logs: LogEntry[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (level && level !== "all") {
      params.append("level", level);
    }

    if (search) {
      params.append("search", search);
    }

    const response = await apiClient.get<
      APIResponse<{
        logs: LogEntry[];
        total: number;
        page: number;
        limit: number;
      }>
    >(`/superadmin/system/logs?${params}`);

    return response.data.data;
  },
};
