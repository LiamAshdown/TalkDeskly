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
import { useChatState } from "~/stores/chat-state";

export function LiveChatWidget() {
  const { conversation, endConversation } = useConversationStore();
  const [chatState, dispatch] = useChatState();
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { wsService } = useWebSocket();
  const wsServiceConnected = useRef(false);

  useEffect(() => {
    if (wsServiceConnected.current) return;
    console.log("wsService", wsService);
    wsService.initializeHandlers();
    wsService.connect();
    wsServiceConnected.current = true;
  }, []);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (chatState.isOpen) {
      dispatch({ type: "UPDATE_UNREAD", count: 0 });
      dispatch({ type: "NEW_MESSAGE", hasNew: false });
    }

    if (conversation) {
      wsService.getConversationById(conversation.conversationId);
      dispatch({ type: "START_CONVERSATION" });
    }
  }, [chatState.isOpen]);

  const startConversation = () => {
    dispatch({ type: "START_CONVERSATION" });
    wsService.sendCreateConversation();
  };

  const handleSetMessage = (message: string) => {
    setNewMessage(message);

    if (conversation) {
      if (message.length > 0 && !isTyping) {
        setIsTyping(true);
        wsService.startTyping(conversation.conversationId);
      } else if (message.length === 0 && isTyping) {
        setIsTyping(false);
        wsService.stopTyping(conversation.conversationId);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || chatState.isConversationEnded || !conversation)
      return;

    wsService.sendMessage(conversation.conversationId, newMessage);
    wsService.stopTyping(conversation.conversationId);
    setNewMessage("");
  };

  const toggleFullScreen = () => {
    dispatch({ type: "TOGGLE_FULLSCREEN" });
  };

  const handleEndConversation = () => {
    dispatch({ type: "OPEN_END_DIALOG" });
  };

  const confirmEndConversation = () => {
    wsService.closeConversation(conversation?.conversationId || "");
    endConversation();
    dispatch({ type: "END_CONVERSATION" });
  };

  const startNewConversation = () => {};

  const resetChat = () => {
    dispatch({ type: "RESET_CHAT" });
  };

  return (
    <>
      {/* Floating chat bubble */}
      <AnimatePresence>
        {!chatState.isOpen && (
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
                chatState.hasNewMessage
                  ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, -5, 5, -5, 0],
                    }
                  : {}
              }
              transition={{
                duration: 0.5,
                repeat: chatState.hasNewMessage ? 3 : 0,
                repeatType: "loop",
                repeatDelay: 2,
              }}
            >
              <Button
                onClick={() => dispatch({ type: "TOGGLE_CHAT", payload: true })}
                className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90"
              >
                <MessageCircle className="h-6 w-6" />
                {chatState.unreadCount > 0 && (
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
                    {chatState.unreadCount}
                  </motion.span>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {chatState.isOpen && (
          <motion.div
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden rounded-lg border bg-background shadow-xl",
              chatState.isFullScreen
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
            {!chatState.conversationStarted ? (
              <WelcomeScreen
                onClose={resetChat}
                onStartConversation={startConversation}
              />
            ) : (
              <ChatWindow
                isFullScreen={chatState.isFullScreen}
                isConversationEnded={chatState.isConversationEnded}
                messages={conversation?.messages || []}
                newMessage={newMessage}
                status={conversation?.status || ""}
                onToggleFullScreen={toggleFullScreen}
                onEndConversation={handleEndConversation}
                onStartNewConversation={startNewConversation}
                onClose={resetChat}
                onNewMessageChange={handleSetMessage}
                onSendMessage={handleSendMessage}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Conversation Confirmation Dialog */}
      <AlertDialog
        open={chatState.showEndDialog}
        onOpenChange={(open) =>
          dispatch({ type: open ? "OPEN_END_DIALOG" : "CLOSE_END_DIALOG" })
        }
      >
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
