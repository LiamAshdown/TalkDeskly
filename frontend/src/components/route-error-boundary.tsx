"use client";

import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, AlertTriangle, Search } from "lucide-react";
import { CodeBlock } from "./ui/code-block";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage: string;
  let errorStatus: number | undefined;

  if (isRouteErrorResponse(error)) {
    // Route-based errors (404, 500, etc.)
    errorMessage = error.statusText || error.data?.message || "Page not found";
    errorStatus = error.status;
  } else if (error instanceof Error) {
    // JavaScript errors
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    errorMessage = "An unexpected error occurred";
  }

  const handleGoHome = () => {
    navigate("/portal");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const is404 = errorStatus === 404;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Main Error Display */}
        <div className="mb-8">
          {is404 ? (
            <div className="relative">
              {/* Large 404 Text */}
              <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 select-none">
                404
              </div>
              {/* Floating Elements */}
              <div
                className="absolute top-4 left-1/4 w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="absolute top-8 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.3s" }}
              ></div>
              <div
                className="absolute bottom-4 left-1/3 w-4 h-4 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.5s" }}
              ></div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-red-500 to-pink-500 mb-6 shadow-lg">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Error Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 md:p-12 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {is404 ? "Oops! Page not found" : "Something went wrong"}
          </h1>

          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {is404
              ? "The page you're looking for seems to have wandered off into the digital void. Don't worry, it happens to the best of us!"
              : "We encountered an unexpected error. Our team has been notified and is working on a fix."}
          </p>

          {errorStatus && (
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 mb-8 shadow-sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Error {errorStatus}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleGoBack}
              variant="outline"
              size="lg"
              className="group flex items-center gap-2 px-6 py-3 rounded-xl border-2 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              Go Back
            </Button>

            <Button
              onClick={handleGoHome}
              size="lg"
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 text-white"
            >
              <Home className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              Go Home
            </Button>
          </div>

          {/* Helpful Links for 404 */}
          {is404 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">
                Looking for something specific?
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-200">
                  <Search className="h-3 w-3" />
                  Search
                </button>
                <button className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-200">
                  Help Center
                </button>
                <button className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-200">
                  Contact Support
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Development error details */}
        {process.env.NODE_ENV === "development" && (
          <details className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 p-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium mb-2">
              🔧 Show Error Details (Development Only)
            </summary>
            <div className="mt-3 p-4 bg-gray-900 rounded-lg">
              <div className="text-sm">
                <div className="font-semibold text-red-400 mb-2">
                  Route Error Details:
                </div>
                <CodeBlock
                  code={JSON.stringify(error, null, 2)}
                  language="json"
                  showCopyButton={false}
                />
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
