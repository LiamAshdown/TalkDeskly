import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChatBubble } from "~/components/conversation/chat-bubble/chat-bubble";
import type { Message } from "~/types/conversation";
interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.01,
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          <ChatBubble
            message={message}
            className={message.sender.type === "contact" ? "opacity-70" : ""}
          />
        </motion.div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
