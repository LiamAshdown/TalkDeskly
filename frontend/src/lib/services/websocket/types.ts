import { EventType } from "@/lib/services/websocket/handlers/types";

export interface WebSocketMessage {
  event: EventType;
  payload: any;
  timestamp: Date;
}
