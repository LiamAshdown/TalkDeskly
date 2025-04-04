"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Conversation } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import EmojiPicker from "@/components/protected/emoji-picker";

// Add the missing imports
import { ChevronLeft, User } from "lucide-react";
import { useMobileView } from "@/context/mobile-view-context";

// Update the interface to include the new props
interface ChatPanelProps {
  conversation: Conversation | null;
  onSendMessage: (message: string) => void;
  isContactInfoOpen?: boolean;
  onToggleContactInfo?: () => void;
}

// Update the function signature to include the new props with defaults
export default function ChatPanel({
  conversation,
  onSendMessage,
  isContactInfoOpen = true,
  onToggleContactInfo = () => {},
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState("");
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(conversation?.messages || []);
  const { setMobileView } = useMobileView();

  // Update messages when conversation changes
  useEffect(() => {
    setMessages(conversation?.messages || []);
  }, [conversation]);

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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-muted-foreground">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Select a conversation to start chatting</p>
          <Button variant="outline" className="mt-4 sm:hidden">
            View Conversations
          </Button>
        </div>
      </div>
    );
  }

  // Update the header section to include a button to toggle contact info
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden mr-1"
              onClick={() => {
                setMobileView("conversations");
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={""} alt={conversation?.contact.name} />
              <AvatarFallback>
                {conversation?.contact.name.substring(0, 2).toUpperCase() ||
                  "CA"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">
                {conversation?.contact.name || "Unnamed Contact"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {conversation?.status === "active"
                  ? "Online"
                  : "Last seen " + conversation?.time}
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 h-full max-h-[calc(100vh-12rem)]">
        {messages && messages.length > 0 ? (
          messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                message.isAgent ? "justify-end" : "justify-start"
              )}
            >
              <div className="flex items-start gap-2 max-w-[80%]">
                {!message.isAgent && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={""} alt={conversation.contact.name} />
                    <AvatarFallback>
                      {conversation.contact.name
                        .substring(0, 2)
                        .toUpperCase() || "CA"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-lg p-3",
                    message.isAgent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">{message.time}</p>
                </div>
                {message.isAgent && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="Agent"
                    />
                    <AvatarFallback>AG</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No messages in this conversation yet.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
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
    </div>
  );
}
