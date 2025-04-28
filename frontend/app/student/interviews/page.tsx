"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Building, Video } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { applicationApi } from "@/lib/api"
import type { JobApplication } from "@/lib/types"

export default function InterviewsPage() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true)
        // Get applications with interview status
        const response = await applicationApi.getMyApplications({ status: "interview" })
        setInterviews(response.results)
      } catch (error) {
        console.error("Error fetching interviews:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchInterviews()
    }
  }, [user])

  return (
    <ProtectedRoute roles="student">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Interviews</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibrant-blue"></div>
          </div>
        ) : interviews.length > 0 ? (
          <div className="grid gap-6">
            {interviews.map((interview) => (
              <Card key={interview.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>
                    {interview.job?.title || "Position"} at {interview.job?.company || "Company"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {interview.interviewDate || new Date(interview.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {interview.interviewTime || "Time TBD"}
                    </span>
                    <span className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {interview.interviewType || "Interview format TBD"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Button variant="outline">View Details</Button>
                    {interview.interviewType === "Video" && (
                      <Button>
                        <Video className="w-4 h-4 mr-2" />
                        Join Interview
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <h3 className="text-xl font-medium mb-2">No Interviews Scheduled</h3>
            <p className="text-muted-foreground mb-6">
              You don't have any upcoming interviews scheduled at the moment.
            </p>
            <Button asChild>
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
