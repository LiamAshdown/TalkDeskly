import { useRef, useEffect, useState } from "react";
import { FixedSizeList as List } from "react-window";
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
  // Create a ref for the List component to scroll to active conversation
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(800);

  // Find index of active conversation to scroll to it
  useEffect(() => {
    if (activeConversationId && listRef.current) {
      const activeIndex = conversations.findIndex(
        (conv) => conv.conversationId === activeConversationId
      );
      if (activeIndex !== -1) {
        listRef.current.scrollToItem(activeIndex, "smart");
      }
    }
  }, [activeConversationId, conversations]);

  useEffect(() => {
    const calculateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    calculateHeight();

    window.addEventListener("resize", calculateHeight);

    // Cleanup
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  const ITEM_SIZE = 115;

  const renderRow = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const conversation = conversations[index];
    return (
      <div style={style}>
        <ConversationItem
          key={conversation.conversationId}
          conversation={conversation}
          activeConversationId={activeConversationId}
          setActiveConversationId={setActiveConversationId}
          onAssignConversation={onAssignConversation}
        />
      </div>
    );
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden h-full">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          No conversations found
        </div>
      ) : (
        <List
          ref={listRef}
          height={containerHeight}
          width="100%"
          itemCount={conversations.length}
          itemSize={ITEM_SIZE}
          overscanCount={5}
        >
          {renderRow}
        </List>
      )}
    </div>
  );
}

export default ConversationList;
