import { Bot, Info } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageAvatarProps {
  type: string;
  name: string;
  avatarUrl?: string;
}

export default function MessageAvatar({
  type,
  name,
  avatarUrl,
}: MessageAvatarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="h-8 w-8 border shadow-sm">
            {avatarUrl && (
              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={name} />
            )}
            <AvatarFallback className="bg-primary/10">
              {type === "bot" ? (
                <Bot className="h-4 w-4 text-primary" />
              ) : type === "system" ? (
                <Info className="h-4 w-4 text-muted-foreground" />
              ) : (
                name.substring(0, 2).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
