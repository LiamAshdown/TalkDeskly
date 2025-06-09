import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, RotateCcw, Bug, Zap } from "lucide-react";
import { CodeBlock } from "./ui/code-block";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console and any error reporting service
    console.error("Error caught by boundary:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center">
            {/* Animated Error Icon */}
            <div className="mb-8 relative">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-r from-red-500 to-orange-500 mb-6 shadow-2xl animate-pulse">
                <Zap className="h-12 w-12 text-white animate-bounce" />
              </div>

              {/* Floating Elements */}
              <div
                className="absolute top-2 left-1/2 transform -translate-x-8 w-3 h-3 bg-red-400 rounded-full animate-ping"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="absolute top-8 right-1/2 transform translate-x-12 w-2 h-2 bg-orange-400 rounded-full animate-ping"
                style={{ animationDelay: "0.6s" }}
              ></div>
              <div
                className="absolute bottom-2 left-1/2 transform translate-x-8 w-4 h-4 bg-yellow-400 rounded-full animate-ping"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>

            {/* Error Content */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-8 md:p-12 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Whoops! Something broke
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Don't panic! Our app hit a small snag, but we're on it. Try
                refreshing the page or give it another shot. If the problem
                persists, our team will get this sorted out quickly.
              </p>

              {/* Error Type Badge */}
              {this.state.error && (
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-100 to-orange-100 text-red-800 mb-8 shadow-sm border border-red-200">
                  <Bug className="h-4 w-4 mr-2" />
                  {this.state.error.name || "JavaScript Error"}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  size="lg"
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl border-2 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                >
                  <RotateCcw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  Try Again
                </Button>

                <Button
                  onClick={this.handleReload}
                  size="lg"
                  className="group flex items-center text-white gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  Reload Page
                </Button>
              </div>

              {/* Helpful Message */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">
                  Still having trouble? Here are some things you can try:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <RefreshCw className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Clear cache</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <AlertTriangle className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Check connection</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <Bug className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Report issue</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Development error details */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/30 p-4 text-left shadow-lg">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium mb-2 flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Show Error Details (Development Only)
                </summary>
                <div className="mt-4 space-y-4">
                  {/* Error Message */}
                  <div className="p-4 bg-red-900 rounded-lg">
                    <div className="font-semibold text-red-200 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    <CodeBlock
                      code={this.state.error.stack || ""}
                      language="javascript"
                      showCopyButton={false}
                    />
                  </div>

                  {/* Component Stack */}
                  {this.state.errorInfo && (
                    <div className="p-4 bg-blue-900 rounded-lg">
                      <div className="font-semibold text-blue-200 mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Component Stack:
                      </div>
                      <CodeBlock
                        code={this.state.errorInfo.componentStack || ""}
                        language="javascript"
                        showCopyButton={false}
                      />
                    </div>
                  )}

                  {/* Quick Actions for Developers */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => console.log("Error:", this.state.error)}
                      className="px-3 py-1 text-xs bg-gray-800 text-gray-200 rounded-md hover:bg-gray-700 transition-colors duration-200"
                    >
                      Log to Console
                    </button>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          this.state.error?.stack || ""
                        )
                      }
                      className="px-3 py-1 text-xs bg-gray-800 text-gray-200 rounded-md hover:bg-gray-700 transition-colors duration-200"
                    >
                      Copy Stack Trace
                    </button>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
