import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { WebSocketService } from "@/lib/services/websocket/websocket";

interface WebSocketContextType {
  wsService: WebSocketService;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const wsService = new WebSocketService(
    "ws://localhost:6721/ws",
    "0eeb1061-5788-4f07-acb3-030f9ee5b240",
    "agent"
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
