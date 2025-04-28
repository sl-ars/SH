import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mx-auto mb-6" />

        {/* Search Bar Skeleton */}
        <Skeleton className="h-20 w-full rounded-xl mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          {/* Filters Skeleton */}
          <Skeleton className="h-96 w-full rounded-xl" />

          <div className="space-y-4">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>

            {/* Job Cards Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
