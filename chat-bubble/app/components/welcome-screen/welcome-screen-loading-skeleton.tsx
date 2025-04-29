import { Skeleton } from "../ui/skeleton";

export function WelcomeScreenLoadingSkeleton() {
  return (
    <div>
      <Skeleton className="h-10 w-10 rounded-full mb-4" />
      <Skeleton className="h-8 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-6" />
      <Skeleton className="h-20 w-full rounded-md mb-4" />
      <Skeleton className="h-10 w-full rounded-md mt-28" />
    </div>
  );
}
