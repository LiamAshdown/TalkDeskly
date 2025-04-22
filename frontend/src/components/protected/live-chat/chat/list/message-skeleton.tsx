import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function MessageSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "flex",
            index % 3 === 0 ? "justify-start" : "justify-end"
          )}
        >
          <div className={cn("flex items-start gap-2 max-w-[80%]")}>
            {index % 3 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
            <div
              className={cn(
                "rounded-lg p-3",
                index % 3 === 0 ? "bg-muted" : "bg-primary"
              )}
            >
              <Skeleton className="h-4 w-[200px] mb-2" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
            {index % 3 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
          </div>
        </div>
      ))}
    </div>
  );
}
