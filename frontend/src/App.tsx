import { Outlet } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n/i18n";
import { Toaster } from "@/components/ui/toaster";
import { WebSocketProvider } from "@/context/websocket-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { miscService } from "@/lib/api/services/misc";
import { useEffect } from "react";
import { useMiscStore } from "./stores/misc";

export default function App() {
  const { setAppInformation } = useMiscStore();

  useEffect(() => {
    miscService.getAppInformation().then((res) => {
      console.log(res);
      setAppInformation({
        appName: res.data.appName,
        version: res.data.version,
      });
    });
  }, []);

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
