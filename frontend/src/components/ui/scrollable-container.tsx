import { useRef, useState, ReactNode } from "react";

interface ScrollableContainerProps {
  children: ReactNode;
  maxHeight?: string;
  className?: string;
}

export function ScrollableContainer({
  children,
  maxHeight = "300px",
  className = "",
}: ScrollableContainerProps) {
  const [showFade, setShowFade] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      // Show fade if not at bottom (with a small threshold)
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      setShowFade(!isAtBottom);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`overflow-y-auto`}
        style={{ maxHeight }}
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {children}
      </div>
      {showFade && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
      )}
    </div>
  );
}
