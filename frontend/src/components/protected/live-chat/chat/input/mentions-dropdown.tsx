"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import type { Agent } from "@/lib/interfaces";

interface MentionsDropdownProps {
  agents: Agent[];
  filter: string;
  onSelect: (agent: Agent) => void;
  onClose: () => void;
}

export default function MentionsDropdown({
  agents,
  filter,
  onSelect,
  onClose,
}: MentionsDropdownProps) {
  return (
    <div className="absolute bottom-full mb-2 left-8 w-64 bg-background rounded-lg shadow-lg border border-border overflow-hidden z-10">
      <div className="p-2 border-b border-border flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">
          Mention an agent
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {agents.length > 0 ? (
          agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
              onClick={() => onSelect(agent)}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback className="text-xs text-white bg-orange-600">
                  {agent.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">
                  {agent.name}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 text-sm text-muted-foreground text-center">
            No agents found matching "{filter}"
          </div>
        )}
      </div>
    </div>
  );
}
