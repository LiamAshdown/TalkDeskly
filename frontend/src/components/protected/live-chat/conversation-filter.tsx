"use client";

import type { Conversation, TeamInbox } from "@/types/chat";
import { useState, useEffect } from "react";
import Header from "@/components/protected/live-chat/filter/header";
import SearchBar from "@/components/protected/live-chat/filter/search-bar";
import TabsComponent from "@/components/protected/live-chat/filter/tabs-component";
import ConversationList from "@/components/protected/live-chat/filter/conversation-list";

interface ConversationFilterProps {
  conversations: Conversation[];
  inboxes: TeamInbox[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  onMobileBack?: () => void;
  onAssignConversation?: (conversationId: string, agentId: string) => void;
}

// Updated ConversationFilter component
export default function ConversationFilter({
  conversations,
  inboxes,
  activeConversationId,
  setActiveConversationId,
  filter,
  setFilter,
  onMobileBack,
  onAssignConversation,
}: ConversationFilterProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [filteredConversations, setFilteredConversations] =
    useState<Conversation[]>(conversations);

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
          conv.contactName.toLowerCase().includes(query) ||
          conv.lastMessage.toLowerCase().includes(query)
      );
    }

    setFilteredConversations(result);
  }, [conversations, activeTab, filter]);

  return (
    <div className="flex flex-col h-full w-full">
      <Header onMobileBack={onMobileBack} />
      <SearchBar filter={filter} setFilter={setFilter} />
      <TabsComponent activeTab={activeTab} setActiveTab={setActiveTab} />
      <ConversationList
        conversations={filteredConversations}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        onAssignConversation={onAssignConversation}
      />
    </div>
  );
}
