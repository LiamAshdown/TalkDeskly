import { RefreshCw, WifiOff, AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useChatStateContext } from "~/contexts/chat-state-context";
import GeneralHeader from "~/components/general-header";

interface ConnectionErrorProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function ConnectionError({
  error,
  onRetry,
  className,
}: ConnectionErrorProps) {
  const { dispatch } = useChatStateContext();
  const isRetrying = false;

  const resetChat = () => {
    dispatch({ type: "RESET_CHAT" });
  };

  return (
    <div
      className={cn("flex flex-col h-full bg-white overflow-y-auto", className)}
    >
      {/* Header */}
      <GeneralHeader onClose={resetChat} />

      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col overflow-y-auto">
        <div className="max-w-sm mx-auto w-full space-y-4">
          {/* Error Icon & Message */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Connection Lost
              </h2>
              <p className="text-sm text-gray-600">
                Unable to connect to chat service. Please check your connection
                and try again.
              </p>
            </div>
          </div>

          {/* Error Details */}
          <div className="p-5 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex space-x-4">
              <WifiOff className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 space-y-4">
                <p className="text-sm font-medium text-red-800">
                  Error Details
                </p>
                <p className="text-xs text-red-700 font-mono">
                  {error || "Connection timeout - unable to reach server"}
                </p>
              </div>
            </div>
          </div>

          {/* Retry Button */}
          {onRetry && (
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400"
              size="lg"
            >
              <RefreshCw
                className={cn("w-4 h-4 mr-2", isRetrying && "animate-spin")}
              />
              {isRetrying ? "Reconnecting..." : "Try Again"}
            </Button>
          )}

          {/* Troubleshoot Section */}
          <div className="p-5 bg-gray-100 border border-gray-100 rounded-lg space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Troubleshoot</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Check internet connection</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Refresh the page</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span>Contact support if issue persists</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-4 text-center text-xs text-muted-foreground flex items-center justify-center">
        <span className="mr-1">•</span>
        <span>Powered by Talk Deskly</span>
      </div>
    </div>
  );
}
