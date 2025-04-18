"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInput from "@/components/protected/live-chat/chat/input/chat-input";
import type { FileWithPreview } from "@/components/protected/live-chat/chat/input/types";
import type { Agent } from "@/components/protected/live-chat/chat/input/types";
import { useActiveConversation } from "@/context/active-conversation-context";
import { Conversation } from "@/lib/interfaces";
import { useWebSocket } from "@/context/websocket-context";
import { conversationService } from "@/lib/api/services/conversations";
import { useAuthStore } from "@/stores/auth";

// Sample agent data - in a real app, this would come from your API
const agents: Agent[] = [
  { id: 1, name: "Alex Johnson", avatar: "/abstract-aj.png", status: "online" },
  {
    id: 2,
    name: "Sam Taylor",
    avatar: "/stylized-letter-st.png",
    status: "online",
  },
  {
    id: 3,
    name: "Jamie Smith",
    avatar: "/javascript-code-abstract.png",
    status: "away",
  },
  {
    id: 4,
    name: "Morgan Lee",
    avatar: "/machine-learning-concept.png",
    status: "offline",
  },
  {
    id: 5,
    name: "Casey Wilson",
    avatar: "/abstract-colorful-swirls.png",
    status: "online",
  },
];

type ChatPortalProps = {
  disabled: boolean;
  conversation: Conversation;
};

export default function ChatPortal({
  disabled,
  conversation,
}: ChatPortalProps) {
  const [activeTab, setActiveTab] = useState("customer");
  const { wsService } = useWebSocket();
  const { user } = useAuthStore();

  // Handle sending customer message
  const handleSendCustomerMessage = async (message: string, files: File[]) => {
    await conversationService.sendMessageAttachment(
      conversation?.conversationId,
      "agent",
      user!.id,
      files
    );

    wsService.sendMessage(conversation?.conversationId, message, false);
  };

  // Handle sending private note
  const handleSendPrivateNote = async (message: string, files: File[]) => {
    wsService.sendMessage(conversation?.conversationId, message, true);
  };

  return (
    <div className="p-4 border-t border-gray-800">
      <Tabs
        defaultValue="customer"
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <div className="flex items-center mb-2">
          <TabsList className="bg-gray-100 dark:bg-gray-800">
            <TabsTrigger
              value="customer"
              className="data-[state=active]:bg-blue-600"
            >
              Customer
            </TabsTrigger>
            <TabsTrigger
              value="private"
              className="data-[state=active]:bg-orange-600"
            >
              Private Notes
            </TabsTrigger>
          </TabsList>
          <div className="ml-2 text-xs text-gray-400">
            {/* Indicator of who will see the message */}
            <span className={activeTab === "customer" ? "block" : "hidden"}>
              Visible to customer
            </span>
            <span className={activeTab === "private" ? "block" : "hidden"}>
              Only visible to agents
            </span>
          </div>
        </div>

        <TabsContent value="customer" className="mt-0">
          <ChatInput
            onSendMessage={handleSendCustomerMessage}
            disabled={conversation?.status === "closed"}
            placeholder="Type your message..."
            buttonText="Send"
            buttonColor="bg-blue-600 hover:bg-blue-700"
            agents={[]} // No @mentions for customer messages
          />
        </TabsContent>

        <TabsContent value="private" className="mt-0">
          <ChatInput
            onSendMessage={handleSendPrivateNote}
            disabled={conversation?.status === "closed"}
            placeholder="Add a private note... Use @ to mention agents"
            buttonText="Send"
            buttonColor="bg-orange-600 hover:bg-orange-700"
            borderColor="border-orange-600"
            agents={agents}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
