import type { Route } from "./+types/live-chat";
import { LiveChatWidget } from "~/components/live-chat-widget";
import { WebSocketProvider } from "~/contexts/websocket-context";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <WebSocketProvider>
      <LiveChatWidget />
    </WebSocketProvider>
  );
}
