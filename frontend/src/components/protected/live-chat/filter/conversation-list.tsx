"use client";

import ConversationItem from "@/components/protected/live-chat/filter/conversation-item";
import type { Conversation } from "@/lib/interfaces";

// ConversationList Component
function ConversationList({
  conversations,
  activeConversationId,
  setActiveConversationId,
  onAssignConversation,
}: {
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string) => void;
  onAssignConversation?: (conversationId: string, agentId: string) => void;
}) {
  return (
    <div className="flex-1 overflow-auto">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          No conversations found
        </div>
      ) : (
        <ul>
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.conversationId}
              conversation={conversation}
              activeConversationId={activeConversationId}
              setActiveConversationId={setActiveConversationId}
              onAssignConversation={onAssignConversation}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default ConversationList;
