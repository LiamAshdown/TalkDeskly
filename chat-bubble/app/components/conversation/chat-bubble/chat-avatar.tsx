import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";

interface ChatAvatarProps {
  src?: string;
  fallback: string;
  isOnline?: boolean;
  isConversationEnded?: boolean;
}

export function ChatAvatar({
  src,
  fallback,
  isOnline,
  isConversationEnded,
}: ChatAvatarProps) {
  return (
    <div className="relative">
      <motion.div
        className={cn(
          "absolute bottom-0 right-0 h-2 w-2 rounded-full ring-1 ring-white",
          isConversationEnded ? "bg-yellow-500" : "bg-green-500"
        )}
        animate={{
          scale: isConversationEnded ? 1 : [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: isConversationEnded ? 0 : Number.POSITIVE_INFINITY,
        }}
      />
      <Avatar className="h-8 w-8">
        <AvatarImage src={src} alt={fallback} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
    </div>
  );
}
