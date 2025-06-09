import { Outlet } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n/i18n";
import { Toaster } from "@/components/ui/toaster";
import { WebSocketProvider } from "@/context/websocket-context";
import { ErrorBoundary } from "@/components/error-boundary";

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <WebSocketProvider>
          <Outlet />
          <Toaster />
        </WebSocketProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
