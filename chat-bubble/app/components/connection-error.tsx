import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useChatStateContext } from "~/contexts/chat-state-context";

interface ConnectionErrorProps {
  error: string;
  onRetry: () => void;
}

export function ConnectionError({ error, onRetry }: ConnectionErrorProps) {
  const chatState = useChatStateContext();

  const handleClose = () => {
    chatState.resetChat();
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 text-center space-y-4">
      <div className="bg-red-100 dark:bg-red-900/20 h-16 w-16 rounded-full flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
          Connection Error
        </h2>
        <p className="text-sm text-red-700 dark:text-red-300 max-w-sm">
          {error ||
            "Unable to establish connection. Please check your internet connection and try again."}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>
        <Button
          onClick={handleClose}
          variant="outline"
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
