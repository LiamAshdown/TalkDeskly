"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation } from "@/lib/interfaces";

// ConversationItem Component
function ConversationItem({
  conversation,
  activeConversationId,
  setActiveConversationId,
  onAssignConversation,
}: {
  conversation: Conversation;
  activeConversationId: string | null;
  setActiveConversationId: (id: string) => void;
  onAssignConversation?: (conversationId: string, agentId: string) => void;
}) {
  const handleAssignToMe = () => {
    if (onAssignConversation) {
      onAssignConversation(conversation.conversationId, "current-user"); // Use the current user's ID
    }
  };

  const handleAssignToAgent = (agentId: string) => {
    if (onAssignConversation) {
      onAssignConversation(conversation.conversationId, agentId);
    }
  };

  const handleMarkAsUnread = () => {
    console.log(
      `Marking conversation ${conversation.conversationId} as unread`
    );
  };

  const handleCloseConversation = () => {
    console.log(`Closing conversation ${conversation.conversationId}`);
  };

  return (
    <ContextMenu key={conversation.conversationId}>
      <ContextMenuTrigger>
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-3 cursor-pointer",
            activeConversationId === conversation.conversationId
              ? "bg-accent text-accent-foreground"
              : "hover:bg-muted"
          )}
          onClick={() => {
            setActiveConversationId(conversation.conversationId);
            if (typeof window !== "undefined" && window.dispatchEvent) {
              window.dispatchEvent(
                new CustomEvent("mobile-view-change", {
                  detail: "chat",
                })
              );
            }
          }}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={""} alt={conversation.contact.name} />
            <AvatarFallback>
              {conversation.contact.name.substring(0, 2).toUpperCase() || "CA"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">
                {conversation.contact.name || "Unnamed Contact"}
              </h3>
              <span className="text-xs text-muted-foreground">
                {/* {conversation.time} */}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {/* {conversation.lastMessage} */}
            </p>
          </div>
          {conversation.unread > 0 && (
            <Badge variant="default" className="ml-auto">
              {conversation.unread}
            </Badge>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={handleAssignToMe}>
          <User className="mr-2 h-4 w-4" />
          <span>Assign to me</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Users className="mr-2 h-4 w-4" />
          <span>Assign to...</span>
        </ContextMenuItem>
        <ContextMenuItem
          className="pl-8"
          onClick={() => handleAssignToAgent("agent1")}
        >
          Sarah Johnson
        </ContextMenuItem>
        <ContextMenuItem
          className="pl-8"
          onClick={() => handleAssignToAgent("agent2")}
        >
          Michael Chen
        </ContextMenuItem>
        <ContextMenuItem
          className="pl-8"
          onClick={() => handleAssignToAgent("agent3")}
        >
          Alex Rodriguez
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleMarkAsUnread}>
          Mark as unread
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCloseConversation}>
          Close conversation
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default ConversationItem;
