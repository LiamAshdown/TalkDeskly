import { create } from "zustand";

interface ContactState {
  contactId: string;
  setContactId: (id: string) => void;
}

const getInitialContactId = () => {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("contactId");
  return stored || "";
};

export const useContactStore = create<ContactState>((set) => ({
  contactId: getInitialContactId(),
  setContactId: (id: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("contactId", id);
    }
    set({ contactId: id });
  },
}));
