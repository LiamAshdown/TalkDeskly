import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { ChatWindow } from "~/components/conversation/chat-window";
import { WelcomeScreen } from "~/components/welcome-screen/welcome-screen";
import { ConnectionError } from "~/components/connection-error";
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
import { useContactStore } from "~/stores/contact-store";
import { TypingProvider } from "~/contexts/typing-context";
import {
  ChatStateProvider,
  useChatStateContext,
} from "~/contexts/chat-state-context";
import type { WebSocketMessage } from "~/lib/services/websocket/types";
import { inboxService } from "~/lib/api/services/inbox";
import { useConfig } from "~/stores/config-context";
import { ThemeProvider } from "~/contexts/theme-provider";

function LiveChatWidgetContent() {
  const chatState = useChatStateContext();
  const { wsService } = useWebSocket();
  const contactId = useContactStore((state) => state.contactId);
  const { config } = useConfig();

  const wsServiceConnected = useRef(false);

  const handleRetryConnection = () => {
    // Clear the error first
    chatState.setConnectionError("");

    // Reconnect
    wsService.disconnect();
    wsServiceConnected.current = false;

    // Reset connection state
    chatState.setConnected(false);

    // Attempt to reconnect
    wsService.connect(config.baseUrl!, contactId, config.inboxId);
    wsServiceConnected.current = true;
  };

  useEffect(() => {
    wsService.registerHandler(
      "connection_established",
      async (message: WebSocketMessage) => {
        wsService.setUserId(message.payload.userId);

        // Clear any existing connection error
        chatState.setConnectionError("");

        chatState.setInboxLoading(true);
        try {
          const response = await inboxService.getInbox(wsService.getInboxId()!);
          chatState.setInboxData(response.data);

          chatState.setConnected(true);
        } catch (error) {
          console.error("Failed to load inbox data:", error);
        } finally {
          chatState.setInboxLoading(false);
        }
      }
    );

    wsService.registerHandler(
      "connection_error",
      (message: WebSocketMessage) => {
        chatState.setConnectionError(message.payload.message);
      }
    );

    if (wsServiceConnected.current) {
      return;
    }

    wsService.initializeHandlers();

    wsService.connect(config.baseUrl!, contactId, config.inboxId);
    wsServiceConnected.current = true;

    return () => {
      wsService.disconnect();
    };
  }, []);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (chatState.isOpen) {
      chatState.updateUnread(0);
      chatState.setNewMessage(false);
    }

    if (chatState.conversationId) {
      wsService.getConversationById(chatState.conversationId);
      chatState.startConversation();
    }
  }, [chatState.isOpen]);

  useEffect(() => {
    // If the inboxId has changed, we need to close the conversation
    if (
      chatState.conversation &&
      config.inboxId !== chatState.conversation?.inboxId
    ) {
      wsService.closeConversation(chatState.conversation.conversationId);

      chatState.endConversation();
    }
  }, [config.inboxId, chatState.conversation]);

  const confirmEndConversation = () => {
    wsService.closeConversation(chatState.conversation?.conversationId || "");
    chatState.endConversation();
  };

  return (
    <>
      {/* Floating chat bubble */}
      <AnimatePresence>
        {!chatState.isOpen && (
          <motion.div
            className={cn(
              "fixed z-50",
              config.position === "bottom-right"
                ? "bottom-4 right-4"
                : config.position === "bottom-left"
                ? "bottom-4 left-4"
                : config.position === "top-right"
                ? "top-4 right-4"
                : "top-4 left-4"
            )}
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
              whileHover={{
                scale: 1.1,
                y: -5,
                rotate: 2,
                transition: { type: "spring", stiffness: 400, damping: 10 },
              }}
              transition={{
                duration: 0.5,
                repeat: chatState.hasNewMessage ? 3 : 0,
                repeatType: "loop",
                repeatDelay: 2,
              }}
            >
              <Button
                onClick={() => chatState.toggleChat(true)}
                className={cn(
                  "h-18 w-18 rounded-full shadow-lg flex items-center justify-center text-primary-foreground overflow-hidden",
                  chatState.connectionError
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-primary hover:bg-primary-hover"
                )}
              >
                <MessageCircle className="transform scale-[1.8]" />
                {chatState.connectionError && (
                  <motion.div
                    className="absolute -right-1 -top-1 flex h-4 w-4 rounded-full bg-red-500 border-2 border-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                    }}
                  />
                )}
                {/* {chatState.unreadCount > 0 && (
                  <motion.span
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white"
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
                )} */}
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
              "fixed z-50 flex flex-col overflow-hidden rounded-lg border bg-background shadow-xl dark:bg-zinc-900 dark:border-zinc-700",
              chatState.isFullScreen
                ? "inset-4 md:inset-6 lg:inset-8"
                : "h-[600px] w-[380px]",
              config.position === "bottom-right"
                ? "bottom-4 right-4"
                : config.position === "bottom-left"
                ? "bottom-4 left-4"
                : config.position === "top-right"
                ? "top-4 right-4"
                : "top-4 left-4"
            )}
            style={{
              transformOrigin:
                config.position === "bottom-right"
                  ? "bottom right"
                  : config.position === "bottom-left"
                  ? "bottom left"
                  : config.position === "top-right"
                  ? "top right"
                  : "top left",
            }}
            initial={{ opacity: 0, scale: 0.5, rotate: 15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: -15 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 30,
            }}
          >
            {chatState.connectionError ? (
              <ConnectionError
                error={chatState.connectionError}
                onRetry={handleRetryConnection}
              />
            ) : !chatState.conversationStarted ? (
              <WelcomeScreen
                isConnected={chatState.isConnected}
                isLoading={chatState.isInboxLoading}
              />
            ) : (
              <ChatWindow />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Conversation Confirmation Dialog */}
      <AlertDialog
        open={chatState.showEndDialog}
        onOpenChange={(open) =>
          open ? chatState.openEndDialog() : chatState.closeEndDialog()
        }
      >
        <AlertDialogContent className="dark:bg-zinc-800 border-0">
          <AlertDialogHeader>
            <AlertDialogTitle>End Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this conversation? You can start a
              new one anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEndConversation}
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              End Conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function LiveChatWidget() {
  return (
    <ChatStateProvider>
      <TypingProvider>
        <ThemeProvider>
          <LiveChatWidgetContent />
        </ThemeProvider>
      </TypingProvider>
    </ChatStateProvider>
  );
}
