import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/protected/navigation/app-sidebar";
import { useWebSocket } from "@/context/websocket-context";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth";

export default function ProtectedLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const { wsService } = useWebSocket();
  const hasConnected = useRef(false);

  useEffect(() => {
    console.log(user);
    if (isAuthenticated && !hasConnected.current && user && user.company) {
      wsService.initializeHandlers();
      wsService.connect(user.id, "agent", user.company.id);
      hasConnected.current = true;
    } else if (!isAuthenticated) {
      wsService.disconnect();
      hasConnected.current = false;
    }
  }, [isAuthenticated]);

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
