export const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="rounded-full p-3 bg-muted flex items-center gap-1.5 w-auto h-8">
      <div
        className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
  </div>
);
