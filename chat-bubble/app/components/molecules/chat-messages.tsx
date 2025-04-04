import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChatBubble } from "~/components/chat-bubble";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  isRead: boolean;
  sender?: {
    name: string;
    avatar?: string;
    fallback: string;
  };
}

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.05,
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          <ChatBubble
            message={message.content}
            timestamp={message.timestamp}
            sender={message.sender}
            isCurrentUser={message.isCurrentUser}
            isRead={message.isRead}
            className={message.sender?.name === "System" ? "opacity-70" : ""}
          />
        </motion.div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
