import type { Route } from "./+types/live-chat";
import { LiveChatWidget } from "~/components/live-chat-widget";
import { WebSocketProvider } from "~/contexts/websocket-context";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TalkDeskly Chat Bubble" },
    { name: "description", content: "TalkDeskly Chat Bubble" },
  ];
}

export default function Home() {
  return (
    <WebSocketProvider>
      <LiveChatWidget />
    </WebSocketProvider>
  );
}
