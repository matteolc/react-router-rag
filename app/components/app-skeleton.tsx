import { Skeleton } from "./ui/skeleton";

export const AppSkeleton = () => {
  return (
    <div className="flex h-screen w-full">
      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Content header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>

          {/* Stats grid */}
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={`skeleton-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  i
                }`}
                className="h-32 rounded-xl"
              />
            ))}
          </div>

          {/* Table skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
