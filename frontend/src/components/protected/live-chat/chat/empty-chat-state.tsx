import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyChatStateProps {
  onViewConversations?: () => void;
}

export default function EmptyChatState({
  onViewConversations,
}: EmptyChatStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 text-muted-foreground">
      <div className="text-center">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p>Select a conversation to start chatting</p>
        {onViewConversations && (
          <Button
            variant="outline"
            className="mt-4 sm:hidden"
            onClick={onViewConversations}
          >
            View Conversations
          </Button>
        )}
      </div>
    </div>
  );
}
