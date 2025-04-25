import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Platform Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="h-24 animate-pulse bg-gray-100">
                  <CardContent className="p-6"></CardContent>
                </Card>
              ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="h-80 animate-pulse bg-gray-100">
                  <CardContent className="p-6"></CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
