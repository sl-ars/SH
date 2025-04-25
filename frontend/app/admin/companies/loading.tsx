import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Company Management</CardTitle>
            <CardDescription>Manage all companies registered on the platform</CardDescription>
          </div>
          <Skeleton className="h-10 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-64 mb-6" />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Industry</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Verification</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">
                        <Skeleton className="h-6 w-32" />
                      </td>
                      <td className="px-4 py-2">
                        <Skeleton className="h-6 w-24" />
                      </td>
                      <td className="px-4 py-2">
                        <Skeleton className="h-6 w-40" />
                      </td>
                      <td className="px-4 py-2">
                        <Skeleton className="h-6 w-16" />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Skeleton className="h-8 w-32 ml-auto" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
