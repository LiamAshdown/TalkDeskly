import { convertKeysToSnakeCase } from "@/lib/utils/string-transforms";
import type { EventType, WebSocketMessage } from "./types";

export class MessageFactory {
  static createMessage(event: EventType, payload: any): WebSocketMessage {
    return {
      event,
      payload,
      timestamp: new Date(),
    };
  }

  static preparePayload(payload: any): any {
    return convertKeysToSnakeCase(payload);
  }
}
