"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { applicationApi } from "@/lib/api/applications" // Fixed import name from applicationsApi to applicationApi

interface ApplicationManagerProps {
  jobId?: string
  companyId?: string
  limit?: number
}

export function ApplicationManager({ jobId, companyId, limit }: ApplicationManagerProps) {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const filters: any = {}

        if (jobId) filters.job_id = jobId
        if (companyId) filters.company_id = companyId

        const response = await applicationApi.getApplications(filters)
        const apps = response.data || []

        setApplications(limit ? apps.slice(0, limit) : apps)
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [jobId, companyId, limit])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "applied":
        return "bg-yellow-100 text-yellow-800"
      case "interviewing":
        return "bg-blue-100 text-blue-800"
      case "offered":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await applicationApi.updateApplicationStatus(id, newStatus)

      // Update local state
      setApplications((apps) => apps.map((app) => (app.id === id ? { ...app, status: newStatus } : app)))
    } catch (error) {
      console.error("Error updating application status:", error)
    }
  }

  if (loading) {
    return <div>Loading applications...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications {applications.length > 0 && `(${applications.length})`}</CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{app.user?.name || "Applicant"}</h3>
                    <p className="text-sm text-muted-foreground">{app.job?.title || "Position"}</p>
                  </div>
                  <Badge className={getStatusColor(app.status)}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                </div>

                <div className="text-sm mb-4">
                  <p>
                    <strong>Applied:</strong> {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  {app.resume && (
                    <p>
                      <strong>Resume:</strong>{" "}
                      <a href={app.resume} className="text-blue-600 hover:underline">
                        View Resume
                      </a>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {app.status !== "interviewing" && (
                    <Button variant="outline" size="sm" onClick={() => updateStatus(app.id, "interviewing")}>
                      Move to Interview
                    </Button>
                  )}

                  {app.status !== "offered" && (
                    <Button variant="outline" size="sm" onClick={() => updateStatus(app.id, "offered")}>
                      Send Offer
                    </Button>
                  )}

                  {app.status !== "rejected" && (
                    <Button variant="outline" size="sm" onClick={() => updateStatus(app.id, "rejected")}>
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No applications found.</p>
        )}
      </CardContent>
    </Card>
  )
}
