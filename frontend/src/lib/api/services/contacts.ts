import { ContactFormData } from "@/lib/schemas/contact-schema";
import apiClient from "@/lib/api/client";
import { APIResponse } from "@/lib/api/types";
import { Contact, ContactNote, Conversation } from "@/lib/interfaces";

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

  async getContactNotes(id: string): Promise<APIResponse<ContactNote[]>> {
    const response = await apiClient.get<APIResponse<ContactNote[]>>(
      `/contacts/${id}/notes`
    );
    return response.data;
  },

  async createContactNote(
    id: string,
    content: string
  ): Promise<APIResponse<ContactNote>> {
    const response = await apiClient.post<APIResponse<ContactNote>>(
      `/contacts/${id}/notes`,
      {
        content,
      }
    );
    return response.data;
  },

  async getContactConversations(
    id: string
  ): Promise<APIResponse<Conversation[]>> {
    const response = await apiClient.get<APIResponse<Conversation[]>>(
      `/contacts/${id}/conversations`
    );
    return response.data;
  },
};
