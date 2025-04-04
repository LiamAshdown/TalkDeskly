import { inboxService } from "@/lib/api/services/inbox";
import { Inbox } from "@/lib/interfaces";
import { create } from "zustand";

interface InboxesState {
  inboxes: Inbox[];
  setInboxes: (inboxes: Inbox[]) => void;
  fetchInboxes: () => Promise<void>;
  getInbox: (inboxId: string) => Promise<Inbox>;
  handleInboxCreated: (inbox: Inbox) => void;
  handleInboxUpdated: (inbox: Inbox) => void;
}

export const useInboxesStore = create<InboxesState>((set, get) => {
  return {
    inboxes: [],
    isLoading: false,

    setInboxes: (inboxes) => set({ inboxes }),

    fetchInboxes: async () => {
      try {
        const response = await inboxService.getInboxes();
        set({ inboxes: response.data });
      } catch (error) {
        // No need to do anything, the error is handled in axios
      }
    },

    getInbox: async (inboxId: string) => {
      const inbox = get().inboxes.find((inbox) => inbox.id === inboxId);

      // Couldn't find inbox? Fetch it from the API
      if (!inbox) {
        try {
          const response = await inboxService.getInbox(inboxId);
          set({ inboxes: [...get().inboxes, response.data] });
          return response.data;
        } catch (error) {
          throw new Error(`Inbox ${inboxId} not found`);
        }
      }

      return inbox;
    },

    handleInboxCreated: (inbox: Inbox) => {
      const { inboxes } = get();
      set({ inboxes: [...inboxes, inbox] });
    },

    handleInboxUpdated: (inbox: Inbox) => {
      const { inboxes } = get();
      const updatedInboxes = inboxes.map((i) =>
        i.id === inbox.id ? inbox : i
      );
      set({ inboxes: updatedInboxes });
    },
  };
});
