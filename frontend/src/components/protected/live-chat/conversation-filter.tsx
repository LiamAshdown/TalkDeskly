"use client";

import { Conversation, Inbox } from "@/lib/interfaces";
import { useState, useEffect } from "react";
import Header from "@/components/protected/live-chat/filter/header";
import SearchBar from "@/components/protected/live-chat/filter/search-bar";
import TabsComponent from "@/components/protected/live-chat/filter/tabs-component";
import ConversationList from "@/components/protected/live-chat/filter/conversation-list";
import { useActiveConversation } from "@/context/active-conversation-context";
import { conversationService } from "@/lib/api/services/conversations";
import { useMobileView } from "@/context/mobile-view-context";

interface ConversationFilterProps {
  conversations: Conversation[];
  inboxes: Inbox[];
  filter: string;
  setFilter: (filter: string) => void;
}

// Updated ConversationFilter component
export default function ConversationFilter({
  conversations,
  inboxes,
  filter,
  setFilter,
}: ConversationFilterProps) {
  const { activeConversationId, setActiveConversationId } =
    useActiveConversation();
  const { setMobileView } = useMobileView();
  const [activeTab, setActiveTab] = useState("all");
  const [filteredConversations, setFilteredConversations] =
    useState<Conversation[]>(conversations);

  // Function to handle conversation assignment
  const handleAssignConversation = (
    conversationId: string,
    agentId: string
  ) => {
    conversationService.assignConversation(conversationId, agentId);
  };

  // Handle selecting a conversation on mobile
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setMobileView("chat"); // Switch to chat view on mobile when a conversation is selected
  };

  // Apply filters
  useEffect(() => {
    let result = [...conversations];

    // Apply status filter
    if (activeTab !== "all") {
      result = result.filter((conv) => {
        if (activeTab === "active") return conv.status === "active";
        if (activeTab === "closed") return conv.status === "closed";
        if (activeTab === "unassigned") return conv.status === "pending";
        return true;
      });
    }

    // Apply search filter
    if (filter) {
      const query = filter.toLowerCase();
      result = result.filter(
        (conv) =>
          conv.contact.name.toLowerCase().includes(query) ||
          conv.lastMessage.toLowerCase().includes(query)
      );
    }

    setFilteredConversations(result);
  }, [conversations, activeTab, filter]);

  return (
    <div className="flex flex-col h-full w-full">
      <Header onMobileBack={() => setMobileView("conversations")} />
      <SearchBar filter={filter} setFilter={setFilter} />
      <TabsComponent activeTab={activeTab} setActiveTab={setActiveTab} />
      <ConversationList
        conversations={filteredConversations}
        activeConversationId={activeConversationId}
        setActiveConversationId={handleSelectConversation}
        onAssignConversation={handleAssignConversation}
      />
    </div>
  );
}
