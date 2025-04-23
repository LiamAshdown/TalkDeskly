import { useEffect, useState } from "react";
import ConversationFilter from "@/components/protected/live-chat/conversation-filter";
import ChatPanel from "@/components/protected/live-chat/chat-panel";
import ContactInfo from "@/components/protected/live-chat/contact-info";
import InboxSidebar from "@/components/protected/live-chat/inbox-sidebar";
import ResponsiveLayout from "@/components/protected/responsive-layout";
import { useInboxesStore } from "@/stores/inboxes";
import { useConversationsStore } from "@/stores/conversations";
import {
  ActiveConversationProvider,
  useActiveConversation,
} from "@/context/active-conversation-context";
import { useParams, useNavigate } from "react-router-dom";

export default function LiveChatPortal() {
  return (
    <ActiveConversationProvider>
      <LiveChatContent />
    </ActiveConversationProvider>
  );
}

function LiveChatContent() {
  const { inboxes, fetchInboxes } = useInboxesStore();
  const { conversations, fetchConversations } = useConversationsStore();
  const { isContactInfoOpen, setActiveConversationId } =
    useActiveConversation();
  const [activeInboxId, setActiveInboxId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  // Set conversation from URL param if present
  useEffect(() => {
    if (id) {
      setActiveConversationId(id);
    }
  }, [id]);

  // Custom handler for conversation selection to update URL
  const handleSelectConversation = (conversationId: string) => {
    navigate(`/portal/conversations/${conversationId}`);
  };

  useEffect(() => {
    fetchInboxes();
    fetchConversations();
  }, []);

  return (
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
          filter={filter}
          setFilter={setFilter}
          onSelectConversation={handleSelectConversation}
        />
      }
      chatPanel={
        <div className="h-full overflow-hidden flex flex-col">
          <ChatPanel />
        </div>
      }
      contactInfo={<ContactInfo />}
      isContactInfoOpen={isContactInfoOpen}
    />
  );
}
