import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-10 bg-gray-100 rounded"></div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
