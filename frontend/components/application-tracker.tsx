"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { applicationApi } from "@/lib/api/applications" // Fixed import name from applicationsApi to applicationApi
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface ApplicationTrackerProps {
  limit?: number
}

export function ApplicationTracker({ limit }: ApplicationTrackerProps) {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    interviewing: 0,
    offered: 0,
    rejected: 0,
  })

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const response = await applicationApi.getMyApplications()

        // If response has results property, use it, otherwise use the data property
        const apps = response.results || response.data || []

        setApplications(limit ? apps.slice(0, limit) : apps)

        // Calculate stats
        const total = apps.length
        const pending = apps.filter((app) => app.status === "pending" || app.status === "applied").length
        const interviewing = apps.filter((app) => app.status === "interviewing").length
        const offered = apps.filter((app) => app.status === "offered").length
        const rejected = apps.filter((app) => app.status === "rejected").length

        setStats({
          total,
          pending,
          interviewing,
          offered,
          rejected,
        })
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [limit])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "applied":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "interviewing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "offered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Tracker</CardTitle>
        <CardDescription>Track your job application progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-background p-3 rounded-lg border">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : stats.total}</p>
          </div>
          <div className="bg-background p-3 rounded-lg border">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : stats.pending}</p>
          </div>
          <div className="bg-background p-3 rounded-lg border">
            <p className="text-sm text-muted-foreground">Interviewing</p>
            <p className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : stats.interviewing}</p>
          </div>
          <div className="bg-background p-3 rounded-lg border">
            <p className="text-sm text-muted-foreground">Offered</p>
            <p className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : stats.offered}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Recent Applications</h3>
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))
          ) : applications.length > 0 ? (
            applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{app.job?.title || "Unknown Position"}</p>
                  <p className="text-sm text-muted-foreground">
                    {app.company?.name || app.job?.company?.name || "Unknown Company"}
                  </p>
                </div>
                <Badge className={getStatusColor(app.status)} variant="outline">
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-3">No applications yet. Start applying to jobs!</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
