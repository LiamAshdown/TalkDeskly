import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { ChatWindow } from "~/components/conversation/chat-window";
import { WelcomeScreen } from "~/components/welcome-screen/welcome-screen";
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
import { useContactStore } from "~/stores/contact-store";
import { TypingProvider } from "~/contexts/typing-context";
import {
  ChatStateProvider,
  useChatStateContext,
} from "~/contexts/chat-state-context";
import type { WebSocketMessage } from "~/lib/services/websocket/types";
import { inboxService } from "~/lib/api/services/inbox";
import { useConfig } from "~/stores/config-context";

function LiveChatWidgetContent() {
  const { conversation, endConversation, conversationId } =
    useConversationStore();
  const { chatState, dispatch } = useChatStateContext();
  const { wsService } = useWebSocket();
  const contactId = useContactStore((state) => state.contactId);
  const { config } = useConfig();

  const wsServiceConnected = useRef(false);
  useEffect(() => {
    wsService.registerHandler(
      "connection_established",
      async (message: WebSocketMessage) => {
        wsService.setUserId(message.payload.userId);

        dispatch({ type: "SET_INBOX_LOADING", isLoading: true });
        try {
          const response = await inboxService.getInbox(wsService.getInboxId()!);
          dispatch({ type: "SET_INBOX_DATA", data: response.data });

          dispatch({ type: "SET_CONNECTED", isConnected: true });
        } catch (error) {
          console.error("Failed to load inbox data:", error);
        } finally {
          dispatch({ type: "SET_INBOX_LOADING", isLoading: false });
        }
      }
    );

    if (wsServiceConnected.current) {
      return;
    }

    wsService.initializeHandlers();

    wsService.connect(contactId, config.inboxId);
    wsServiceConnected.current = true;

    return () => {
      wsService.disconnect();
    };
  }, []);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (chatState.isOpen) {
      dispatch({ type: "UPDATE_UNREAD", count: 0 });
      dispatch({ type: "NEW_MESSAGE", hasNew: false });
    }

    if (conversationId) {
      wsService.getConversationById(conversationId);
      dispatch({ type: "START_CONVERSATION" });
    }
  }, [chatState.isOpen]);

  const confirmEndConversation = () => {
    wsService.closeConversation(conversation?.conversationId || "");
    endConversation();
    dispatch({ type: "END_CONVERSATION" });
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
                onClick={() => dispatch({ type: "TOGGLE_CHAT", payload: true })}
                className="h-18 w-18 rounded-full shadow-lg flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white overflow-hidden"
              >
                <MessageCircle className="transform scale-[1.8]" />
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
            {!chatState.conversationStarted ? (
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
          dispatch({ type: open ? "OPEN_END_DIALOG" : "CLOSE_END_DIALOG" })
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
              className="bg-blue-500 hover:bg-blue-600 text-white"
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
        <LiveChatWidgetContent />
      </TypingProvider>
    </ChatStateProvider>
  );
}
