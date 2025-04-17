import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { WebSocketService } from "~/lib/services/websocket/websocket";
import { useContactStore } from "~/stores/contact-store";

interface WebSocketContextType {
  wsService: WebSocketService;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const contactId = useContactStore((state) => state.contactId);
  const wsService = new WebSocketService(
    "ws://localhost:6721/ws",
    contactId || "",
    "contact",
    "153ea199-e7c4-4e55-8c6e-febd8a969a6c"
  );

  return (
    <WebSocketContext.Provider value={{ wsService }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
