import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ContactState {
  contactId: string;
  setContactId: (id: string) => void;
}

export const useContactStore = create<ContactState>()(
  persist(
    (set) => ({
      contactId: "",
      setContactId: (id: string) => set({ contactId: id }),
    }),
    {
      name: "contact-storage",
    }
  )
);
