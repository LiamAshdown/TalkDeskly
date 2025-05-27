import { Company } from "@/lib/interfaces";
import { IWebSocketHandler } from "@/lib/services/websocket/handlers/types";
import { WebSocketMessage } from "@/lib/services/websocket/handlers/types";
import { useAuthStore } from "@/stores/auth";

export class CompanyHandler implements IWebSocketHandler {
  handle(message: WebSocketMessage): void {
    switch (message.event) {
      case "company_updated":
        this.handleCompanyUpdated(message);
        break;
    }
  }

  private handleCompanyUpdated(message: WebSocketMessage): void {
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      useAuthStore.getState().updateUser({
        ...currentUser,
        company: message.payload as Company,
      });
    }
  }
}
