import apiClient from "@/lib/api/client";
import { APIResponse } from "@/lib/api/types";

export interface ConversationStats {
  totalConversations: number;
  newConversations: number;
}

export interface MessageStats {
  totalMessages: number;
  agentMessages: number;
  contactMessages: number;
  averagePerConversation: number;
}

export interface ConversationStatusStats {
  active: number;
  pending: number;
  closed: number;
  resolved: number;
}

export interface AgentStats {
  agentId: string;
  agentName: string;
  totalAssigned: number;
  activeAssigned: number;
  closedAssigned: number;
}

export interface AnalyticsDashboard {
  conversationStats: ConversationStats;
  messageStats: MessageStats;
  conversationStatusStats: ConversationStatusStats;
  agentStats: AgentStats[];
  dateRange: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

export interface AnalyticsParams {
  days?: number;
  startDate?: string;
  endDate?: string;
}

export const analyticsService = {
  async getDashboard(
    params: AnalyticsParams = {}
  ): Promise<APIResponse<AnalyticsDashboard>> {
    const searchParams = new URLSearchParams();

    if (params.days) {
      searchParams.append("days", params.days.toString());
    }
    if (params.startDate) {
      searchParams.append("start_date", params.startDate);
    }
    if (params.endDate) {
      searchParams.append("end_date", params.endDate);
    }

    const url = `/analytics/dashboard${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    const response = await apiClient.get<APIResponse<AnalyticsDashboard>>(url);
    return response.data;
  },

  async getConversationStats(
    params: AnalyticsParams = {}
  ): Promise<APIResponse<ConversationStats>> {
    const searchParams = new URLSearchParams();

    if (params.startDate) {
      searchParams.append("start_date", params.startDate);
    }
    if (params.endDate) {
      searchParams.append("end_date", params.endDate);
    }

    const url = `/analytics/conversations${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    const response = await apiClient.get<APIResponse<ConversationStats>>(url);
    return response.data;
  },

  async getAgentStats(
    params: AnalyticsParams = {}
  ): Promise<APIResponse<AgentStats[]>> {
    const searchParams = new URLSearchParams();

    if (params.startDate) {
      searchParams.append("start_date", params.startDate);
    }
    if (params.endDate) {
      searchParams.append("end_date", params.endDate);
    }

    const url = `/analytics/agents${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    const response = await apiClient.get<APIResponse<AgentStats[]>>(url);
    return response.data;
  },

  async getMessageStats(
    params: AnalyticsParams = {}
  ): Promise<APIResponse<MessageStats>> {
    const searchParams = new URLSearchParams();

    if (params.startDate) {
      searchParams.append("start_date", params.startDate);
    }
    if (params.endDate) {
      searchParams.append("end_date", params.endDate);
    }

    const url = `/analytics/messages${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    const response = await apiClient.get<APIResponse<MessageStats>>(url);
    return response.data;
  },

  async getStatusStats(
    params: AnalyticsParams = {}
  ): Promise<APIResponse<ConversationStatusStats>> {
    const searchParams = new URLSearchParams();

    if (params.startDate) {
      searchParams.append("start_date", params.startDate);
    }
    if (params.endDate) {
      searchParams.append("end_date", params.endDate);
    }

    const url = `/analytics/status${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    const response = await apiClient.get<APIResponse<ConversationStatusStats>>(
      url
    );
    return response.data;
  },
};
