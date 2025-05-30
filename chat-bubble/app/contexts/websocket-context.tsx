import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { WebSocketService } from "~/lib/services/websocket/websocket";
interface WebSocketContextType {
  wsService: WebSocketService;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  // Create WebSocket service with only URL parameter
  const wsService = new WebSocketService();

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
