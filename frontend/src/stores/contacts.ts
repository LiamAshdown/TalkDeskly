import { create } from "zustand";
import { Contact, ContactNote } from "@/lib/interfaces";
import { contactsService } from "@/lib/api/services/contacts";
import { toast } from "@/lib/hooks/use-toast";

interface ContactsState {
  contacts: Contact[];
  isLoading: boolean;
  setContacts: (contacts: Contact[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  fetchContacts: () => Promise<void>;
  handleDeleteContact: (contactId: string) => void;
  handleContactCreated: (contact: Contact) => void;
  handleContactUpdated: (contact: Contact) => void;
  handleContactNoteCreated: (contactNote: ContactNote) => void;
}

export const useContactsStore = create<ContactsState>()((set, get) => {
  return {
    contacts: [],
    isLoading: false,

    setContacts: (contacts) => set({ contacts }),
    setIsLoading: (isLoading) => set({ isLoading }),

    fetchContacts: async () => {
      set({ isLoading: true });
      try {
        const response = await contactsService.getContacts();
        set({ contacts: response.data });
      } catch (error) {
        // No need to do anything, the error is handled in axios
      } finally {
        set({ isLoading: false });
      }
    },

    handleDeleteContact: (contactId) => {
      const { contacts } = get();
      const updatedContacts = contacts.filter(
        (contact) => contact.id !== contactId
      );
      set({ contacts: updatedContacts });
      toast({
        title: "Contact deleted",
        description: "The contact has been removed from the list.",
      });
    },

    handleContactCreated: (contact: Contact) => {
      const { contacts } = get();
      set({ contacts: [...contacts, contact] });
      toast({
        title: "New contact",
        description: `${contact.name} has been added to contacts.`,
      });
    },

    handleContactUpdated: (updatedContact: Contact) => {
      const { contacts } = get();
      const updatedContacts = contacts.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact
      );
      set({ contacts: updatedContacts });
      toast({
        title: "Contact updated",
        description: `${updatedContact.name}'s information has been updated.`,
      });
    },

    handleContactNoteCreated: (contactNote: ContactNote) => {
      // Do Nothing
    },
  };
});
