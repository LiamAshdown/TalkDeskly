import LiveChatPortal from "@/components/protected/live-chat/live-chat-portal";
import { MobileViewProvider } from "@/context/mobile-view-context";

export default function LiveChatPage() {
  return (
    <MobileViewProvider>
      <main className="h-full overflow-hidden flex-1">
        <LiveChatPortal />
      </main>
    </MobileViewProvider>
  );
}
