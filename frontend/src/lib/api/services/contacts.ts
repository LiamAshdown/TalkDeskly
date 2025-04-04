import { ContactFormData } from "@/lib/schemas/contact-schema";
import apiClient from "../client";
import { APIResponse } from "../types";
import { Contact } from "@/lib/interfaces";

export const contactsService = {
  async getContacts(): Promise<APIResponse<Contact[]>> {
    const response = await apiClient.get<APIResponse<Contact[]>>("/contacts");
    return response.data;
  },

  async createContact(data: ContactFormData): Promise<APIResponse<Contact>> {
    const response = await apiClient.post<APIResponse<Contact>>(
      "/contacts",
      data
    );
    return response.data;
  },

  async updateContact(
    id: string,
    data: ContactFormData
  ): Promise<APIResponse<Contact>> {
    const response = await apiClient.put<APIResponse<Contact>>(
      `/contacts/${id}`,
      data
    );
    return response.data;
  },
};
