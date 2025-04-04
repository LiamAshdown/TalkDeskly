"use client";

import {
  Rocket,
  TrendingUp,
  Wrench,
  AlertTriangle,
  Flame,
  Inbox,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TeamInbox } from "@/types/chat";
import { Link } from "react-router-dom";

interface InboxSelectorProps {
  inboxes: TeamInbox[];
  activeInboxId: string | null;
  onInboxChange: (inboxId: string | null) => void;
}

export default function InboxSelector({
  inboxes,
  activeInboxId,
  onInboxChange,
}: InboxSelectorProps) {
  const getInboxIcon = (icon: TeamInbox["icon"]) => {
    switch (icon) {
      case "rocket":
        return <Rocket className="h-4 w-4" />;
      case "trending-up":
        return <TrendingUp className="h-4 w-4" />;
      case "wrench":
        return <Wrench className="h-4 w-4" />;
      case "alert-triangle":
        return <AlertTriangle className="h-4 w-4" />;
      case "flame":
        return <Flame className="h-4 w-4" />;
      default:
        return <Inbox className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Inboxes
        </h3>
        <Link to="/settings/inboxes">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Plus className="h-4 w-4" />
            <span className="sr-only">New Inbox</span>
          </Button>
        </Link>
      </div>

      <div className="space-y-1">
        <Button
          variant={activeInboxId === null ? "secondary" : "ghost"}
          className="w-full justify-between h-9"
          onClick={() => onInboxChange(null)}
        >
          <div className="flex items-center">
            <Inbox className="h-4 w-4 mr-2" />
            <span>All Inboxes</span>
          </div>
          <Badge variant="outline" className="ml-auto">
            {inboxes.reduce((total, inbox) => total + inbox.unreadCount, 0)}
          </Badge>
        </Button>

        {inboxes.map((inbox) => (
          <Button
            key={inbox.id}
            variant={activeInboxId === inbox.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-between h-9",
              !inbox.isActive && "opacity-50"
            )}
            onClick={() => onInboxChange(inbox.id)}
          >
            <div className="flex items-center">
              {getInboxIcon(inbox.icon)}
              <span className="ml-2">{inbox.name}</span>
            </div>
            {inbox.unreadCount > 0 && (
              <Badge variant="outline" className="ml-auto">
                {inbox.unreadCount}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
