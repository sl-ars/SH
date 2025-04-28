import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F2F2F7] py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Job Header Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-5 w-1/2 mb-4" />

              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>

              <div className="flex gap-3">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>

            {/* Job Details Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Skeleton className="h-7 w-48 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />

              <Skeleton className="h-7 w-48 mb-3" />
              <div className="space-y-2 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start">
                    <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>

              <Skeleton className="h-7 w-48 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start">
                    <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            {/* Company Info Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <Skeleton className="h-7 w-48 mb-4" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            {/* Similar Jobs Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Skeleton className="h-7 w-48 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
