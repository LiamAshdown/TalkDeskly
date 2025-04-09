import { useEffect, useState } from "react";
import ConversationFilter from "@/components/protected/live-chat/conversation-filter";
import ChatPanel from "@/components/protected/live-chat/chat-panel";
import ContactInfo from "@/components/protected/live-chat/contact-info";
import InboxSidebar from "@/components/protected/live-chat/inbox-sidebar";
import ResponsiveLayout from "@/components/protected/live-chat/responsive-layout";

import { useMobileView } from "@/context/mobile-view-context";
import { useInboxesStore } from "@/stores/inboxes";
import { useConversationsStore } from "@/stores/conversations";
import { useWebSocket } from "@/context/websocket-context";
import { Contact } from "@/lib/interfaces";

export default function LiveChatPortal() {
  const { inboxes, fetchInboxes } = useInboxesStore();
  const { conversations, fetchConversations } = useConversationsStore();
  const { wsService } = useWebSocket();

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [activeInboxId, setActiveInboxId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const { setMobileView } = useMobileView();

  // Find active conversation and contact
  const activeConversation =
    conversations.find(
      (conv) => conv.conversationId === activeConversationId
    ) || null;

  // Filter conversations based on the selected inbox
  const filteredConversations = conversations.filter((conv) => {
    if (activeInboxId === null) {
      return true; // Show all conversations
    } else if (activeInboxId === "my-inbox") {
      // For demo purposes, let's assume "my-inbox" shows conversations assigned to the current agent
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

  // Function to send a message
  const handleSendMessage = (message: string) => {
    if (!activeConversationId) return;

    wsService.sendMessage(activeConversationId, message);
  };

  // Add a new function to handle conversation assignment
  const handleAssignConversation = (
    conversationId: string,
    agentId: string
  ) => {};

  // Add a new state variable to track if the contact info panel is open
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(true);

  // Update the ResponsiveLayout component to hande mobile navigation
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
          inboxes={inboxes}
          activeConversationId={activeConversationId}
          setActiveConversationId={(id: string) => {
            setActiveConversationId(id);
            setMobileView("chat"); // Switch to chat view on mobile when a conversation is selected
          }}
          filter={filter}
          setFilter={setFilter}
          onMobileBack={() => setMobileView("conversations")}
          onAssignConversation={handleAssignConversation}
        />
      }
      chatPanel={
        <div className="h-full overflow-hidden flex flex-col">
          <ChatPanel
            conversation={activeConversation}
            onSendMessage={handleSendMessage}
            isContactInfoOpen={isContactInfoOpen}
            onToggleContactInfo={() => {
              setIsContactInfoOpen(!isContactInfoOpen);
              if (isContactInfoOpen) {
                setMobileView("chat");
              } else {
                setMobileView("contact");
              }
            }}
          />
        </div>
      }
      contactInfo={
        isContactInfoOpen && (
          <ContactInfo
            contact={activeConversation?.contact as Contact | null}
            onClose={() => {
              setIsContactInfoOpen(false);
              setMobileView("chat");
            }}
          />
        )
      }
      isContactInfoOpen={isContactInfoOpen}
    />
  );
}
