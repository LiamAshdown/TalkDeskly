import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router";
import LiveChat from "~/routes/live-chat";
import "~/app.css";
import type { Config } from "~/types/config";
import { ConfigProvider } from "~/stores/config-context";

// Use hash routing for better embedding compatibility
const router = createHashRouter([
  {
    path: "/",
    element: <LiveChat />,
  },
]);

function ChatBubbleApp({ config }: { config: Config }) {
  return (
    <div className="chat-bubble-container">
      <ConfigProvider initialConfig={config}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </div>
  );
}

function init(options: Config) {
  let container = document.getElementById("talkdeskly-root");

  if (!container) {
    container = document.createElement("div");
    container.id = "talkdeskly-root";
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(<ChatBubbleApp config={options} />);
}

if (typeof window !== "undefined") {
  (window as any).talkDeskly = { init };

  // Auto-initialize in development
  if (import.meta.env.DEV) {
    init({
      inboxId: "53fee7c7-8c0c-4e7b-84ca-c7f8f47760f1",
      position: "bottom-right",
      primaryColor: "#dc0462",
      zIndex: 9999,
      baseUrl: "ws://localhost:6721/ws",
    });
  }
}
