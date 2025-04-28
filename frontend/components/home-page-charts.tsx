"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendChart } from "@/components/analytics/trend-chart"
import { OverviewChart } from "@/components/analytics/overview-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for charts
const placementTrendData = [
  { name: "Jan", value: 120 },
  { name: "Feb", value: 150 },
  { name: "Mar", value: 180 },
  { name: "Apr", value: 220 },
  { name: "May", value: 270 },
  { name: "Jun", value: 310 },
  { name: "Jul", value: 350 },
  { name: "Aug", value: 400 },
  { name: "Sep", value: 450 },
  { name: "Oct", value: 500 },
  { name: "Nov", value: 550 },
  { name: "Dec", value: 600 },
]

const studentGrowthData = [
  { name: "Jan", value: 1500 },
  { name: "Feb", value: 1800 },
  { name: "Mar", value: 2200 },
  { name: "Apr", value: 2600 },
  { name: "May", value: 3100 },
  { name: "Jun", value: 3700 },
  { name: "Jul", value: 4400 },
  { name: "Aug", value: 5200 },
  { name: "Sep", value: 6100 },
  { name: "Oct", value: 7000 },
  { name: "Nov", value: 8000 },
  { name: "Dec", value: 9200 },
]

const industryDistributionData = [
  { name: "Technology", total: 35 },
  { name: "Finance", total: 20 },
  { name: "Healthcare", total: 15 },
  { name: "Education", total: 10 },
  { name: "Manufacturing", total: 8 },
  { name: "Retail", total: 7 },
  { name: "Other", total: 5 },
]

const salaryRangeData = [
  { name: "<$30k", total: 5 },
  { name: "$30k-$50k", total: 15 },
  { name: "$50k-$70k", total: 25 },
  { name: "$70k-$90k", total: 30 },
  { name: "$90k-$110k", total: 15 },
  { name: ">$110k", total: 10 },
]

export function HomePageCharts() {
  return (
    <div className="space-y-8">
      <Tabs defaultValue="placements" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
            <TabsTrigger
              value="placements"
              className="rounded-full data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Placements
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="rounded-full data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              Students
            </TabsTrigger>
            <TabsTrigger
              value="industries"
              className="rounded-full data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              Industries
            </TabsTrigger>
            <TabsTrigger
              value="salaries"
              className="rounded-full data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              Salaries
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="placements" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TrendChart
              title="Job Placements Growth"
              description="Monthly job placements over the past year"
              data={placementTrendData}
              color="hsl(221, 83%, 53%)" // blue-500
            />
            <Card>
              <CardHeader>
                <CardTitle>Placement Success Rate</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[200px]">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="hsl(221, 83%, 15%)"
                      strokeWidth="10"
                      className="opacity-10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="hsl(221, 83%, 53%)"
                      strokeWidth="10"
                      strokeDasharray="283"
                      strokeDashoffset="28.3"
                      className="transform -rotate-90 origin-center transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-bold text-blue-500">90%</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Success Rate</span>
                  </div>
                </div>
                <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  90% of our students find employment within 3 months of graduation
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TrendChart
              title="Student Growth"
              description="Monthly student registrations"
              data={studentGrowthData}
              color="hsl(271, 91%, 65%)" // purple-500
            />
            <Card>
              <CardHeader>
                <CardTitle>Student Demographics</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[200px]">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-purple-500">65%</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Undergraduates</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-purple-500">35%</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Graduates</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-purple-500">48%</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Female</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-purple-500">52%</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Male</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="industries" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OverviewChart
              title="Industry Distribution"
              description="Job placements by industry"
              data={industryDistributionData}
            />
            <Card>
              <CardHeader>
                <CardTitle>Top Growing Industries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Technology</span>
                      <span className="text-sm text-green-500">+24%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Healthcare</span>
                      <span className="text-sm text-green-500">+18%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "72%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Finance</span>
                      <span className="text-sm text-green-500">+15%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Education</span>
                      <span className="text-sm text-green-500">+12%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "58%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="salaries" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OverviewChart
              title="Salary Distribution"
              description="Job placements by salary range"
              data={salaryRangeData}
            />
            <Card>
              <CardHeader>
                <CardTitle>Average Starting Salaries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="font-medium">Technology</span>
                    <span className="font-bold text-orange-500">$85,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="font-medium">Finance</span>
                    <span className="font-bold text-orange-500">$75,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="font-medium">Healthcare</span>
                    <span className="font-bold text-orange-500">$70,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="font-medium">Education</span>
                    <span className="font-bold text-orange-500">$55,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="font-medium">Overall Average</span>
                    <span className="font-bold text-orange-500">$72,500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
