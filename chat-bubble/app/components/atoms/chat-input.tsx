import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your message...",
}: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1"
      />
      <Button
        type="submit"
        size="icon"
        className="bg-primary hover:bg-primary/90"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
