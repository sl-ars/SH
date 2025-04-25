"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminApi } from "@/lib/api/admin"
import { isMockEnabled } from "@/lib/utils/config"
import { mockAdminAnalytics, mockAdminStats } from "@/lib/mock-data/admin"
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts"

// Более гармоничная цветовая схема, согласованная с темой приложения
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]

// Добавим стили для recharts
const RECHARTS_STYLES = {
  chart: {
    background: "var(--background)",
    color: "var(--foreground)"
  },
  activeBar: {
    strokeWidth: 2,
    stroke: "var(--accent)"
  }
};

// Кастомный компонент для Bar, чтобы обойти стилизацию активных элементов
const CustomBar = (props: any) => {
  const { fill, x, y, width, height, index, dataKey } = props;
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        className="transition-all duration-200 hover:opacity-90"
      />
    </g>
  );
};

// Кастомный компонент для легенды, более лаконичный и адаптивный к теме
const CustomLegend = (props: any) => {
  const { payload } = props
  return (
    <div className="flex justify-center gap-4 items-center py-2">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center">
          <div 
            className="w-3 h-3 mr-1 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

// Компонент для стилизованного тултипа
const CustomTooltip = ({ active, payload, label, className }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md shadow-md p-2 text-sm">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-foreground">{entry.name}: </span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        if (isMockEnabled()) {
          // Use mock data
          setAnalytics(mockAdminAnalytics)
          setStats(mockAdminStats)
          setLoading(false)
          return
        }

        // Use real API
        console.log("Fetching analytics data...")
        const response = await adminApi.getAnalytics({ period: 'month' })
        console.log("Response received:", response)
        
        if (response.status === 'success' && response.data) {
          // Check if response.data.data exists (doubly nested structure)
          const analyticsData = response.data.data || response.data
          console.log("Analytics data:", analyticsData.analytics)
          console.log("Stats data:", analyticsData.stats)
          setAnalytics(analyticsData.analytics)
          setStats(analyticsData.stats)
          setLoading(false)
        } else {
          console.error("API returned error or no data:", response)
          throw new Error(response.message || 'Failed to load analytics data')
        }
      } catch (err) {
        console.error("Error fetching analytics:", err)
        setError("Failed to load analytics. Please try again later.")
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  // Добавляем глобальные CSS стили для Recharts
  useEffect(() => {
    // Добавляем стили для переопределения поведения при наведении в Recharts
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .recharts-rectangle.recharts-bar-rectangle:hover {
        stroke: var(--background) !important;
        stroke-width: 2px;
      }
      
      .recharts-active-dot {
        stroke: var(--background) !important;
      }
      
      .recharts-area-dot {
        stroke: var(--background) !important;
      }
      
      .recharts-sector:hover {
        stroke: var(--background) !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  if (loading) {
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
                  <Card key={i} className="h-24 animate-pulse">
                    <CardContent className="p-6"></CardContent>
                  </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="h-80 animate-pulse">
                    <CardContent className="p-6"></CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>Error loading analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">{error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics || !stats) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>No analytics data available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              No analytics data is currently available. Please check back later.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Platform Analytics</CardTitle>
          <CardDescription>Comprehensive analytics and statistics for the platform</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</div>
                <div className="text-3xl font-bold mt-1">{stats.users.total}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {stats.users.students} students, {stats.users.employers} employers
                </div>
                <div className="w-full h-1 bg-blue-100 dark:bg-blue-900/50 mt-4 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 dark:bg-blue-400 rounded-full" 
                    style={{ width: `${(stats.users.active / stats.users.total * 100) || 0}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.users.active} active users ({Math.round((stats.users.active / stats.users.total * 100) || 0)}%)
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-green-600 dark:text-green-400">Total Jobs</div>
                <div className="text-3xl font-bold mt-1">{stats.jobs.total}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {stats.jobs.active} active, {stats.jobs.filled} filled
                </div>
                <div className="w-full h-1 bg-green-100 dark:bg-green-900/50 mt-4 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 dark:bg-green-400 rounded-full" 
                    style={{ width: `${(stats.jobs.active / stats.jobs.total * 100) || 0}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.jobs.active} active jobs ({Math.round((stats.jobs.active / stats.jobs.total * 100) || 0)}%)
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-amber-600 dark:text-amber-400">Applications</div>
                <div className="text-3xl font-bold mt-1">{stats.applications.total}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {stats.applications.pending} pending, {stats.applications.accepted} accepted
                </div>
                <div className="w-full h-1 bg-amber-100 dark:bg-amber-900/50 mt-4 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 dark:bg-amber-400 rounded-full" 
                    style={{ width: `${(stats.applications.accepted / stats.applications.total * 100) || 0}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.applications.accepted} accepted ({Math.round((stats.applications.accepted / stats.applications.total * 100) || 0)}%)
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Companies</div>
                <div className="text-3xl font-bold mt-1">{stats.companies.total}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{stats.companies.verified} verified</div>
                <div className="w-full h-1 bg-purple-100 dark:bg-purple-900/50 mt-4 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 dark:bg-purple-400 rounded-full" 
                    style={{ width: `${(stats.companies.verified / stats.companies.total * 100) || 0}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.companies.verified} verified ({Math.round((stats.companies.verified / stats.companies.total * 100) || 0)}%)
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="growth" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="growth">User Growth</TabsTrigger>
              <TabsTrigger value="jobs">Job Statistics</TabsTrigger>
              <TabsTrigger value="distribution">User Distribution</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="growth">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly user registration trends</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="w-full h-[400px]">
                    <AreaChart 
                      width={800} 
                      height={350} 
                      data={analytics.userGrowth}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border opacity-50" />
                      <XAxis dataKey="date" className="text-foreground" />
                      <YAxis className="text-foreground" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        name="New Users" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.2} 
                      />
                    </AreaChart>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle>Job Statistics</CardTitle>
                  <CardDescription>Monthly job posting and filling trends</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="w-full h-[400px]">
                    <BarChart
                      width={800}
                      height={350}
                      data={analytics.jobStats}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      barGap={12}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border opacity-50" />
                      <XAxis dataKey="date" className="text-foreground" />
                      <YAxis className="text-foreground" />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent-foreground)', opacity: 0.05 }} />
                      <Legend />
                      <Bar 
                        dataKey="posted" 
                        name="Jobs Posted" 
                        fill="#10B981" 
                        radius={[4, 4, 0, 0]}
                        shape={<CustomBar />}
                      />
                      <Bar 
                        dataKey="filled" 
                        name="Jobs Filled" 
                        fill="#F59E0B" 
                        radius={[4, 4, 0, 0]}
                        shape={<CustomBar />}
                      />
                    </BarChart>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribution">
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Distribution of users by role</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="w-full h-[400px]">
                    <PieChart width={800} height={350}>
                      <Pie
                        data={analytics.userDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={130}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={3}
                        label={({ name, value, percent }) => 
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {analytics.userDistribution.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            stroke="var(--background)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>Distribution of applications by status</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="w-full h-[400px]">
                    <PieChart width={800} height={350}>
                      <Pie
                        data={[
                          { name: "Pending", value: stats.applications.pending },
                          { name: "Reviewing", value: stats.applications.reviewing },
                          { name: "Accepted", value: stats.applications.accepted },
                          { name: "Rejected", value: stats.applications.rejected },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={130}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={3}
                        label={({ name, value, percent }) => 
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        <Cell fill="#F59E0B" stroke="var(--background)" strokeWidth={2} />
                        <Cell fill="#3B82F6" stroke="var(--background)" strokeWidth={2} />
                        <Cell fill="#10B981" stroke="var(--background)" strokeWidth={2} />
                        <Cell fill="#EF4444" stroke="var(--background)" strokeWidth={2} />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
