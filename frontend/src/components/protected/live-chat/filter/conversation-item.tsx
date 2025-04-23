"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { User, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation, Agent } from "@/lib/interfaces";
import { conversationService } from "@/lib/api/services/conversations";

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
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [assignableAgents, setAssignableAgents] = useState<Agent[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchAssignableAgents = async () => {
    if (assignableAgents.length === 0) {
      setIsLoadingAgents(true);
      try {
        const response = await conversationService.getAssignableAgents();
        setAssignableAgents(response.data);
      } catch (error) {
        console.error("Failed to fetch assignable agents:", error);
      } finally {
        setIsLoadingAgents(false);
      }
    }
  };

  const handleContextMenuOpen = (open: boolean) => {
    setMenuOpen(open);
    if (open) {
      fetchAssignableAgents();
    }
  };

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

  const handleCloseConversation = async () => {
    await conversationService.closeConversation(conversation.conversationId);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "closed":
        return "bg-red-200 text-red-800 hover:bg-red-200";
      case "pending":
        return "bg-yellow-200 text-yellow-800 hover:bg-yellow-200";
      case "active":
        return "bg-green-200 text-green-800 hover:bg-green-200";
      default:
        return "";
    }
  };

  return (
    <ContextMenu
      key={conversation.conversationId}
      onOpenChange={handleContextMenuOpen}
    >
      <ContextMenuTrigger>
        <div
          className={cn(
            "rounded-lg p-3 cursor-pointer",
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
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={""} alt={conversation.contact.name} />
              <AvatarFallback>
                {conversation.contact.name.substring(0, 2).toUpperCase() ||
                  "CA"}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-medium truncate">
              {conversation.contact.name || "Unnamed Contact"}
            </h3>
          </div>
          {/* {conversation.unread > 0 && (
            <Badge variant="default" className="ml-auto">
              {conversation.unread}
            </Badge>
          )} */}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground dark:text-white truncate">
                {conversation.lastMessage}
              </p>
              {conversation.status && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs ml-1 capitalize",
                    getStatusBadgeVariant(conversation.status)
                  )}
                >
                  {conversation.status}
                </Badge>
              )}
            </div>
            {conversation.assignedTo && (
              <div className="flex items-center">
                <Badge variant="outline" className="text-xs">
                  {conversation.assignedTo.name}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={handleAssignToMe}>
          <User className="mr-2 h-4 w-4" />
          <span>Assign to me</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled>
          <Users className="mr-2 h-4 w-4" />
          <span>Assign to...</span>
        </ContextMenuItem>

        {isLoadingAgents ? (
          <ContextMenuItem disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading agents...</span>
          </ContextMenuItem>
        ) : (
          assignableAgents.map((agent) => (
            <ContextMenuItem
              key={agent.id}
              className="pl-8"
              onClick={() => handleAssignToAgent(agent.id)}
            >
              {agent.name}
              {conversation.assignedTo?.id === agent.id && (
                <Badge variant="outline" className="ml-auto">
                  Assigned
                </Badge>
              )}
            </ContextMenuItem>
          ))
        )}

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
