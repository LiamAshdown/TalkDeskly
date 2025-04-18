import { useEffect, useState } from "react";
import ConversationFilter from "@/components/protected/live-chat/conversation-filter";
import ChatPanel from "@/components/protected/live-chat/chat-panel";
import ContactInfo from "@/components/protected/live-chat/contact-info";
import InboxSidebar from "@/components/protected/live-chat/inbox-sidebar";
import ResponsiveLayout from "@/components/protected/live-chat/responsive-layout";

import { useMobileView } from "@/context/mobile-view-context";
import { useInboxesStore } from "@/stores/inboxes";
import { useConversationsStore } from "@/stores/conversations";
import { ActiveConversationProvider } from "@/context/active-conversation-context";

export default function LiveChatPortal() {
  const { inboxes, fetchInboxes } = useInboxesStore();
  const { conversations, fetchConversations } = useConversationsStore();
  const [activeInboxId, setActiveInboxId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  // Filter conversations based on the selected inbox
  const filteredConversations = conversations.filter((conv) => {
    if (activeInboxId === null) {
      return true; // Show all conversations
    } else if (activeInboxId === "my-inbox") {
      return conv.status === "active";
    } else if (activeInboxId === "unassigned") {
      return conv.status === "pending";
    } else {
      return conv.inboxId === activeInboxId;
    }
  });

  useEffect(() => {
    fetchInboxes();
    fetchConversations();
  }, []);

  // Update the ResponsiveLayout component to use ActiveConversationProvider
  return (
    <ActiveConversationProvider>
      <ResponsiveLayout
        inboxSidebar={
          <InboxSidebar
            inboxes={inboxes}
            activeInboxId={activeInboxId}
            onInboxChange={setActiveInboxId}
          />
        }
        conversationList={
          <ConversationFilter
            conversations={filteredConversations}
            inboxes={inboxes}
            filter={filter}
            setFilter={setFilter}
          />
        }
        chatPanel={
          <div className="h-full overflow-hidden flex flex-col">
            <ChatPanel />
          </div>
        }
        contactInfo={<ContactInfo />}
      />
    </ActiveConversationProvider>
  );
}
