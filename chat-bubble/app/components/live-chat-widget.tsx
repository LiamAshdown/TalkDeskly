import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { ChatWindow } from "~/components/organisms/chat-window";
import { WelcomeScreen } from "~/components/molecules/welcome-screen";
import { useWebSocket } from "~/contexts/websocket-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

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

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(1);
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { wsService } = useWebSocket();
  const hasConnected = useRef(false);

  // Set up event handlers
  useEffect(() => {
    wsService.on("message", handleIncomingMessage);
    wsService.on("conversation_start", handleConversationStart);
    wsService.on("conversation_end", handleConversationEnd);
    wsService.on("agent_assigned", handleAgentAssigned);

    // Connect to WebSocket only if not already connected
    if (!hasConnected.current) {
      wsService.connect();
      hasConnected.current = true;
    }

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, [wsService]);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setHasNewMessage(false);
    }
  }, [isOpen]);

  const handleIncomingMessage = (message: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message.payload.content,
      timestamp: formatTime(new Date(message.timestamp)),
      isCurrentUser: false,
      isRead: true,
      sender: {
        name: "Support Agent",
        avatar: "/placeholder.svg?height=32&width=32",
        fallback: "SA",
      },
    };

    setMessages((prev) => [...prev, newMessage]);

    // If chat is closed, increment unread count and trigger animation
    if (!isOpen) {
      setUnreadCount((prev) => prev + 1);
      setHasNewMessage(true);
    }
  };

  const handleConversationStart = (message: any) => {
    setConversationId(message.payload.conversation_id);
    setConversationStarted(true);
  };

  const handleConversationEnd = (message: any) => {
    setIsConversationEnded(true);
    setConversationId(null);
  };

  const handleAgentAssigned = (message: any) => {
    // You can update the UI to show which agent is assigned
    console.log("Agent assigned:", message.payload.agent_id);
  };

  const startConversation = () => {
    setConversationStarted(true);

    wsService.sendCreateConversation();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isConversationEnded || !conversationId) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: formatTime(new Date()),
      isCurrentUser: true,
      isRead: false,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Send message through WebSocket
    wsService.sendMessage(conversationId, newMessage);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleEndConversation = () => {
    setShowEndDialog(true);
  };

  const confirmEndConversation = () => {
    if (conversationId) {
      wsService.leaveConversation(conversationId);
    }
    setIsConversationEnded(true);
    setShowEndDialog(false);

    // Add system message indicating the conversation has ended
    const endMessage: Message = {
      id: Date.now().toString(),
      content:
        "This conversation has ended. You can start a new conversation anytime.",
      timestamp: formatTime(new Date()),
      isCurrentUser: false,
      isRead: true,
      sender: {
        name: "System",
        fallback: "SYS",
      },
    };

    setMessages((prev) => [...prev, endMessage]);
  };

  const startNewConversation = () => {
    // Reset conversation state
    setIsConversationEnded(false);
    setConversationStarted(true);
    setConversationId(null);

    // Clear previous messages and add welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: "👋 Hi there! How can I help you today?",
      timestamp: formatTime(new Date()),
      isCurrentUser: false,
      isRead: true,
      sender: {
        name: "Support Agent",
        avatar: "/placeholder.svg?height=32&width=32",
        fallback: "SA",
      },
    };

    setMessages([welcomeMessage]);
  };

  const resetChat = () => {
    if (conversationId) {
      wsService.leaveConversation(conversationId);
    }
    setIsOpen(false);
    setConversationStarted(false);
    setIsConversationEnded(false);
    setMessages([]);
    setConversationId(null);
  };

  return (
    <>
      {/* Floating chat bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="fixed bottom-4 right-4 z-50"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <motion.div
              animate={
                hasNewMessage
                  ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, -5, 5, -5, 0],
                    }
                  : {}
              }
              transition={{
                duration: 0.5,
                repeat: hasNewMessage ? 3 : 0,
                repeatType: "loop",
                repeatDelay: 2,
              }}
            >
              <Button
                onClick={() => setIsOpen(true)}
                className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90"
              >
                <MessageCircle className="h-6 w-6" />
                {unreadCount > 0 && (
                  <motion.span
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                    }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden rounded-lg border bg-background shadow-xl",
              isFullScreen
                ? "inset-4 md:inset-6 lg:inset-8"
                : "bottom-4 right-4 h-[500px] w-[350px]"
            )}
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            {!conversationStarted ? (
              <WelcomeScreen
                onClose={resetChat}
                onStartConversation={startConversation}
              />
            ) : (
              <ChatWindow
                isFullScreen={isFullScreen}
                isConversationEnded={isConversationEnded}
                messages={messages}
                newMessage={newMessage}
                onToggleFullScreen={toggleFullScreen}
                onEndConversation={handleEndConversation}
                onStartNewConversation={startNewConversation}
                onClose={resetChat}
                onNewMessageChange={setNewMessage}
                onSendMessage={handleSendMessage}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Conversation Confirmation Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this conversation? You can start a
              new one anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEndConversation}>
              End Conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper function to format time
function formatTime(date: Date): string {
  const hours = date.getHours() % 12 || 12;
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  return `${hours}:${minutes} ${ampm}`;
}
