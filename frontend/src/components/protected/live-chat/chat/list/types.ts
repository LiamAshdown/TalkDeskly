import type { Conversation } from "@/lib/interfaces";

export interface MessageListProps {
  conversation: Conversation;
  isLoading?: boolean;
}
