"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, LineChart, PieChart, Download } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

interface AnalyticsData {
  totalPlacements: number
  averagePackage: string
  companiesVisited: number
  placementRate: string
  placementTrends?: any // This would be chart data
  placementByIndustry?: any // This would be chart data
  packageDistribution?: any // This would be chart data
}

export default function CampusAnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState("2024")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) router.push("/login")

    const fetchAnalytics = async () => {
      try {
        setLoading(true)

        // Mock data for analytics
        const mockAnalyticsData = {
          totalPlacements: 450,
          averagePackage: "$85,000",
          companiesVisited: 32,
          placementRate: "92%",
          placementTrends: {},
          placementByIndustry: {},
          packageDistribution: {},
        }

        setAnalyticsData(mockAnalyticsData)
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user, router, selectedYear])

  return (
    <ProtectedRoute roles="campus">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Placement Analytics</h1>
            <div className="flex gap-4">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <CardTitle className="bg-muted h-4 w-24 rounded"></CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted h-8 w-16 rounded mb-2"></div>
                      <div className="bg-muted h-4 w-24 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Placements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData?.totalPlacements}</div>
                  <p className="text-xs text-vibrant-blue">+12% from last year</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Average Package</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData?.averagePackage}</div>
                  <p className="text-xs text-vibrant-green">+8% from last year</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Companies Visited</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData?.companiesVisited}</div>
                  <p className="text-xs text-vibrant-orange">+15% from last year</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData?.placementRate}</div>
                  <p className="text-xs text-vibrant-pink">+5% from last year</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Placement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted rounded-md flex items-center justify-center">
                  <LineChart className="w-16 h-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Placement by Industry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <PieChart className="w-16 h-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Package Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <BarChart className="w-16 h-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
