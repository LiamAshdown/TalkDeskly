import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInput from "@/components/protected/live-chat/chat/input/chat-input";
import { Conversation, Agent } from "@/lib/interfaces";
import { useWebSocket } from "@/context/websocket-context";
import { conversationService } from "@/lib/api/services/conversations";
import { useAuthStore } from "@/stores/auth";

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
  const [assignableAgents, setAssignableAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchAssignableAgents = async () => {
      const response = await conversationService.getAssignableAgents(
        conversation?.conversationId
      );
      setAssignableAgents(response.data);
    };

    fetchAssignableAgents();
  }, []);

  const sendMessage = async (
    message: string,
    files: File[],
    isPrivate: boolean
  ) => {
    if (files.length > 0) {
      await conversationService.sendMessageAttachment(
        conversation?.conversationId,
        "agent",
        user!.id,
        files
      );
    }

    wsService.sendMessage(conversation?.conversationId, message, isPrivate);
  };

  // Handle sending customer message
  const handleSendCustomerMessage = async (message: string, files: File[]) => {
    sendMessage(message, files, false);
  };

  // Handle sending private note
  const handleSendPrivateNote = async (message: string, files: File[]) => {
    sendMessage(message, files, true);
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
            agents={assignableAgents}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
