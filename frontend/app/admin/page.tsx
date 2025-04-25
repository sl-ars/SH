"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Briefcase, Building, Settings, UserPlus, BarChart } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { adminApi } from "@/lib/api/admin"
import { isMockEnabled } from "@/lib/utils/config"

interface DashboardStats {
  users: {
    total: number
    change: string
  }
  jobs: {
    total: number
    change: string
  }
  applications: {
    total: number
    change: string
  }
  newUsers: {
    total: number
    change: string
  }
}

const mockAdminStats: DashboardStats = {
  users: {
    total: 1500,
    change: "+10%",
  },
  jobs: {
    total: 350,
    change: "+3%",
  },
  applications: {
    total: 800,
    change: "+7%",
  },
  newUsers: {
    total: 120,
    change: "+5%",
  },
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        const response = await adminApi.getDashboardStats()

        setStats({
          users: {
            total: response.data.total_users || 0,
            change: "+20%", // This would come from the API in a real implementation
          },
          jobs: {
            total: response.data.total_jobs || 0,
            change: "+5%", // This would come from the API in a real implementation
          },
          applications: {
            total: response.data.total_applications || 0,
            change: "+12%", // This would come from the API in a real implementation
          },
          newUsers: {
            total: response.data.new_users_today || 0,
            change: "+8%", // This would come from the API in a real implementation
          },
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)

        // If API call fails or mock is enabled, use mock data
        if (isMockEnabled()) {
          setStats(mockAdminStats)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  // Admin menu items - this is configuration, not mock data
  const adminMenuItems = [
    {
      title: "User Management",
      icon: Users,
      description: "Manage user accounts, roles, and permissions.",
      link: "/admin/users",
      color: "vibrant-blue",
    },
    {
      title: "Job Listings",
      icon: Briefcase,
      description: "Review, approve, or remove job listings.",
      link: "/admin/jobs",
      color: "vibrant-green",
    },
    {
      title: "Company Profiles",
      icon: Building,
      description: "Manage and verify company profiles.",
      link: "/admin/companies",
      color: "vibrant-orange",
    },
    {
      title: "Analytics",
      icon: BarChart,
      description: "View detailed platform analytics and reports.",
      link: "/admin/analytics",
      color: "vibrant-pink",
    },
    {
      title: "Register Account",
      icon: UserPlus,
      description: "Create new user accounts for the platform.",
      link: "/admin/register",
      color: "vibrant-purple",
    },
    {
      title: "System Settings",
      icon: Settings,
      description: "Configure platform settings and preferences.",
      link: "/admin/settings",
      color: "vibrant-yellow",
    },
  ]

  return (
    <ProtectedRoute roles="admin">
      <div className="min-h-screen bg-gradient-to-b from-background via-muted to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Admin Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {loading ? (
              // Loading state for stats
              Array(4)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium bg-muted h-4 w-24 rounded"></CardTitle>
                      <div className="h-4 w-4 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-16"></div>
                    </CardContent>
                  </Card>
                ))
            ) : stats ? (
              <>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/50 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-vibrant-blue" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
                    <p className="text-xs text-vibrant-blue">{stats.users.change} from last month</p>
                  </CardContent>
                </Card>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/50 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                    <Briefcase className="h-4 w-4 text-vibrant-green" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.jobs.total}</div>
                    <p className="text-xs text-vibrant-green">{stats.jobs.change} from last month</p>
                  </CardContent>
                </Card>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/50 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Applications</CardTitle>
                    <FileText className="h-4 w-4 text-vibrant-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.applications.total}</div>
                    <p className="text-xs text-vibrant-orange">{stats.applications.change} from last month</p>
                  </CardContent>
                </Card>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/50 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Users</CardTitle>
                    <UserPlus className="h-4 w-4 text-vibrant-pink" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.newUsers.total}</div>
                    <p className="text-xs text-vibrant-pink">{stats.newUsers.change} from last month</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="col-span-4 text-center py-4">Failed to load dashboard stats</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminMenuItems.map((item, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:bg-muted/50 overflow-hidden"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-full bg-${item.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className="w-6 h-6" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{item.description}</p>
                  <Link href={item.link}>
                    <Button
                      className={`w-full bg-${item.color} text-white hover:bg-${item.color}/90 transition-colors duration-300`}
                    >
                      Manage
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
