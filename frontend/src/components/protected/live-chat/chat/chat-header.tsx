import { ChevronLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/interfaces";

interface ChatHeaderProps {
  conversation: Conversation;
  isContactInfoOpen: boolean;
  onToggleContactInfo: () => void;
  onBackToConversations: () => void;
}

export default function ChatHeader({
  conversation,
  isContactInfoOpen,
  onToggleContactInfo,
  onBackToConversations,
}: ChatHeaderProps) {
  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-1"
            onClick={onBackToConversations}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src={""} alt={conversation?.contact.name} />
            <AvatarFallback>
              {conversation?.contact.name.substring(0, 2).toUpperCase() || "CA"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">
              {conversation?.contact.name || "Unnamed Contact"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {conversation?.status === "active"
                ? "Online"
                : "Last seen " + conversation?.updatedAt}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleContactInfo}
            className={cn(isContactInfoOpen ? "md:hidden" : "")}
            aria-label={
              isContactInfoOpen ? "Hide contact info" : "Show contact info"
            }
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
