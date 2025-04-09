import { useRef, useState } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmojiPicker from "@/components/protected/emoji-picker";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [newMessage, setNewMessage] = useState("");
  const messageInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    // Focus the input after selecting an emoji
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="border-t p-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          ref={messageInputRef}
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="flex-1"
        />
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
          <Send className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>
    </div>
  );
}
