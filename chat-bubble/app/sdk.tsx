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

  // Create React root and render the app
  const root = createRoot(container);
  root.render(<ChatBubbleApp config={options} />);
}

if (typeof window !== "undefined") {
  (window as any).talkDeskly = { init };

  // Auto-initialize in development
  if (import.meta.env.DEV) {
    init({
      inboxId: "c0377c01-c2dc-4e79-80ee-98c914d22cd4",
      position: "bottom-right",
      primaryColor: "#dc0462",
      zIndex: 9999,
      baseUrl: "ws://localhost:6721",
    });
  }
}
