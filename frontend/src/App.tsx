import { Outlet } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n/i18n";
import { Toaster } from "@/components/ui/toaster";
import { WebSocketProvider } from "@/context/websocket-context";
export default function App() {
  return (
    <I18nProvider>
      <WebSocketProvider>
        <Outlet />
        <Toaster />
      </WebSocketProvider>
    </I18nProvider>
  );
}
