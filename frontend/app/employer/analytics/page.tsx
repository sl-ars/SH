"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { employerApi } from "@/lib/api/employer"
import type { EmployerDashboardAnalytics, BackendAnalyticsPayload } from "@/lib/types"
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
  LineChart,
  Line
} from "recharts"
import ProtectedRoute from "@/components/protected-route"
import { toast } from "sonner"

// Цветовая схема, согласованная с темой приложения
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]

// Кастомный компонент для стилизованного тултипа
const CustomTooltip = ({ active, payload, label }: any) => {
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

// Define a type for the structured chart/list data derived from BackendAnalyticsPayload.data
interface ProcessedAnalytics {
  jobViewsOverTime: BackendAnalyticsPayload['data']['time_series']['job_views_over_time'];
  applicationsOverTime: BackendAnalyticsPayload['data']['time_series']['applications_over_time'];
  applicationStatusDistribution: { name: string; value: number }[];
  popularJobsData: BackendAnalyticsPayload['data']['popular_jobs'];
  // Add more processed data structures as needed for charts
}

export default function EmployerAnalyticsPage() {
  const [summaryStats, setSummaryStats] = useState<EmployerDashboardAnalytics | null>(null)
  const [processedChartData, setProcessedChartData] = useState<ProcessedAnalytics>({
    jobViewsOverTime: [],
    applicationsOverTime: [],
    applicationStatusDistribution: [],
    popularJobsData: [],
  });
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching employer analytics data for dedicated page...");
        const response = await employerApi.getAnalytics({ period: 'month' }); // Returns ApiResponse<BackendAnalyticsPayload>
        console.log("Full analytics response received:", response);
        
        if (response.status === 'success' && response.data?.data) {
          const backendAnalyticsContainer = response.data.data; // This is { summary, time_series, popular_jobs }
          
          setSummaryStats(backendAnalyticsContainer.summary ?? null);

          // Process data for charts
          const appStatusCounts = backendAnalyticsContainer.summary?.application_status_counts || {};
          const appStatusDistribution = Object.keys(appStatusCounts).map(key => ({
            name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize status name
            value: appStatusCounts[key]
          }));

          setProcessedChartData({
            jobViewsOverTime: backendAnalyticsContainer.time_series?.job_views_over_time || [],
            applicationsOverTime: backendAnalyticsContainer.time_series?.applications_over_time || [],
            applicationStatusDistribution: appStatusDistribution,
            popularJobsData: backendAnalyticsContainer.popular_jobs || [],
          });
          
        } else {
          const errorMessage = response.message || response.data?.message || "Failed to load analytics data or data is in an unexpected format.";
          console.error("API returned error or no data:", response);
          setError(errorMessage);
          setSummaryStats(null);
          setProcessedChartData({ jobViewsOverTime: [], applicationsOverTime: [], applicationStatusDistribution: [], popularJobsData: [] });
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`Could not load data from API: ${message}. Please try again later.`);
        setSummaryStats(null);
        setProcessedChartData({ jobViewsOverTime: [], applicationsOverTime: [], applicationStatusDistribution: [], popularJobsData: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Добавляем глобальные CSS стили для Recharts
  useEffect(() => {
    // Стили для корректного отображения в темной теме
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
            <CardTitle>Job Analytics</CardTitle>
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
            <CardTitle>Job Analytics</CardTitle>
            <CardDescription>Error loading analytics data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!summaryStats) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Job Analytics</CardTitle>
            <CardDescription>No summary data available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              No summary analytics data is currently available. Please check back later.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // JSX for displaying stats and charts will need to be updated to use 
  // summaryStats and processedChartData correctly.
  // Example for summary cards (ensure these match your actual UI):
  const summaryCardsData = [
    { title: "Total Jobs", value: summaryStats.total_jobs ?? 0, iconColor: "text-blue-500" },
    { title: "Active Jobs", value: summaryStats.active_jobs ?? 0, iconColor: "text-green-500" },
    { title: "Total Applications", value: summaryStats.total_applications ?? 0, iconColor: "text-yellow-500" },
    { title: "Total Job Views", value: summaryStats.total_job_views ?? 0, iconColor: "text-purple-500" },
  ];

  return (
    <ProtectedRoute roles={["employer"]}>
      <div className="container mx-auto py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Analytics Dashboard</CardTitle>
            <CardDescription>Overview of your recruitment performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {summaryCardsData.map((item, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                    {/* You can add an icon here if desired, e.g., based on item.iconColor */}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{item.value}</div>
                    {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="jobs">Job Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Applications Over Time</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={processedChartData.applicationsOverTime}>
                          <defs>
                            <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                          <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="applications" stroke={COLORS[0]} fillOpacity={1} fill="url(#colorApplications)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Views Over Time</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={processedChartData.jobViewsOverTime}>
                           <defs>
                            <linearGradient id="colorJobViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                          <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="views" stroke={COLORS[1]} fillOpacity={1} fill="url(#colorJobViews)" name="Job Views" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="applications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={processedChartData.applicationStatusDistribution} 
                          cx="50%" 
                          cy="50%" 
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                                {`${name} (${(percent * 100).toFixed(0)}%)`}
                              </text>
                            );
                          }}
                        >
                          {processedChartData.applicationStatusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                 {/* Add more charts or tables for application data if needed */}
              </TabsContent>

              <TabsContent value="jobs" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Jobs (Top 5)</CardTitle>
                    <CardDescription>Based on views and applications.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {processedChartData.popularJobsData && processedChartData.popularJobsData.length > 0 ? (
                      <ul className="space-y-3">
                        {processedChartData.popularJobsData.map((job: { id: any; title: string; view_count: number; num_applications: number }, index: number) => (
                          <li key={job.id || index} className="flex justify-between items-center p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors">
                            <div>
                              <p className="font-semibold text-primary">{job.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {job.view_count} views, {job.num_applications} applications
                              </p>
                            </div>
                            {/* Maybe a link to the job: <Button variant="link" size="sm" asChild><Link href={`/jobs/${job.id}`}>View</Link></Button> */}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No popular job data available.</p>
                    )}
                  </CardContent>
                </Card>
                {/* Add more charts or tables for job performance if needed */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
} 