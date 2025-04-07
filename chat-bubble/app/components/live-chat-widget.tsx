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
import { useConversationStore } from "~/stores/conversation";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  sender?: {
    name: string;
    avatar?: string;
    fallback: string;
  };
}

export function LiveChatWidget() {
  const { conversation } = useConversationStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(1);
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const { wsService } = useWebSocket();
  const hasConnected = useRef(false);

  // Set up event handlers
  useEffect(() => {
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

    if (conversation) {
      wsService.getConversationById(conversation.conversationId);
      setConversationStarted(true);
    }
  }, [isOpen]);

  const startConversation = () => {
    setConversationStarted(true);

    wsService.sendCreateConversation();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isConversationEnded || !conversation) return;

    wsService.sendMessage(conversation.conversationId, newMessage);
    setNewMessage("");
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleEndConversation = () => {
    setShowEndDialog(true);
  };

  const confirmEndConversation = () => {};

  const startNewConversation = () => {};

  const resetChat = () => {
    setIsOpen(false);
    setConversationStarted(false);
    setIsConversationEnded(false);
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
                messages={conversation?.messages || []}
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
