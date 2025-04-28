"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { isMockEnabled } from "@/lib/utils/config"
import Link from "next/link"
import { BarChart, Building2, Calendar, FileText, Settings, UserPlus, PieChart, GraduationCap } from "lucide-react"

// Import mock data
import { mockStudents } from "@/lib/mock-data/students"
import { mockEvents } from "@/lib/mock-data/events"
import { mockReports } from "@/lib/mock-data/reports"

export default function CampusDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    students: 0,
    events: 0,
    reports: 0,
    companies: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)

        if (isMockEnabled()) {
          // Use mock data
          setStats({
            students: Object.keys(mockStudents).length,
            events: Object.keys(mockEvents).length,
            reports: Object.keys(mockReports).length,
            companies: 12, // Mock number of companies
          })
        } else {
          // In a real implementation, we would fetch from the API
          // For now, we'll use the mock data even in non-mock mode
          setStats({
            students: Object.keys(mockStudents).length,
            events: Object.keys(mockEvents).length,
            reports: Object.keys(mockReports).length,
            companies: 12,
          })
        }
      } catch (error) {
        console.error("Error loading campus dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (!user) {
    return null
  }

  const campusModules = [
    {
      title: "Students",
      description: "Manage student profiles and placements",
      icon: <GraduationCap className="h-8 w-8 text-vibrant-blue" />,
      link: "/campus/students",
      count: stats.students,
    },
    {
      title: "Companies",
      description: "Manage partner companies",
      icon: <Building2 className="h-8 w-8 text-vibrant-green" />,
      link: "/campus/companies",
      count: stats.companies,
    },
    {
      title: "Events",
      description: "Schedule and manage recruitment events",
      icon: <Calendar className="h-8 w-8 text-vibrant-orange" />,
      link: "/campus/events",
      count: stats.events,
    },
    {
      title: "Analytics",
      description: "View placement statistics and trends",
      icon: <BarChart className="h-8 w-8 text-vibrant-purple" />,
      link: "/campus/analytics",
      count: null,
    },
    {
      title: "Reports",
      description: "Generate and view placement reports",
      icon: <FileText className="h-8 w-8 text-vibrant-pink" />,
      link: "/campus/reports",
      count: stats.reports,
    },
    {
      title: "Register",
      description: "Register new students and faculty",
      icon: <UserPlus className="h-8 w-8 text-vibrant-blue" />,
      link: "/campus/register",
      count: null,
    },
    {
      title: "Settings",
      description: "Configure campus portal settings",
      icon: <Settings className="h-8 w-8 text-vibrant-gray" />,
      link: "/campus/settings",
      count: null,
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">Manage your campus recruitment activities and track student placements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{isLoading ? "..." : stats.students}</CardTitle>
            <CardDescription>Total Students</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="p-0 h-auto">
              <Link href="/campus/students">View all students</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{isLoading ? "..." : stats.events}</CardTitle>
            <CardDescription>Upcoming Events</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="p-0 h-auto">
              <Link href="/campus/events">Manage events</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{isLoading ? "..." : stats.companies}</CardTitle>
            <CardDescription>Partner Companies</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="p-0 h-auto">
              <Link href="/campus/companies">View companies</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{isLoading ? "..." : stats.reports}</CardTitle>
            <CardDescription>Available Reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="p-0 h-auto">
              <Link href="/campus/reports">View reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">Campus Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {campusModules.map((module, index) => (
          <Link href={module.link} key={index}>
            <Card className="h-full transition-all hover:shadow-md hover:border-vibrant-blue cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  {module.icon}
                  {module.count !== null && (
                    <span className="bg-muted rounded-full px-2 py-1 text-sm font-medium">
                      {isLoading ? "..." : module.count}
                    </span>
                  )}
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p>Loading recent activities...</p>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">New student registrations</p>
                      <p className="text-sm text-muted-foreground">5 new students registered</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Career Fair</p>
                      <p className="text-sm text-muted-foreground">Event scheduled for next month</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Yesterday</p>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Placement Report</p>
                      <p className="text-sm text-muted-foreground">Annual report generated</p>
                    </div>
                    <p className="text-sm text-muted-foreground">3 days ago</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Placement Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[200px]">
            <PieChart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              View detailed placement analytics in the Analytics section
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/campus/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
