"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { jobApi } from "@/lib/api/jobs"
import type { Job } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { AlertTriangle, Loader2, Briefcase, MapPin, ExternalLink, Trash2 } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function SavedJobsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [unSavingJobId, setUnSavingJobId] = useState<string | null>(null)

  useEffect(() => {
    console.log("[SavedJobsPage] useEffect triggered: authLoading:", authLoading, "user:", !!user);
    if (authLoading) {
      console.log("[SavedJobsPage] Auth is loading, returning.");
      return
    }
    if (!user) {
      console.log("[SavedJobsPage] No user after auth load, setting pageLoading false.");
      setPageLoading(false)
      return
    }

    const fetchSavedJobs = async () => {
      console.log("[SavedJobsPage] Fetching saved jobs...");
      setPageLoading(true)
      const response = await jobApi.getSavedJobs()
      console.log("[SavedJobsPage] API response for getSavedJobs:", JSON.stringify(response, null, 2));
      if (response.status === "success" && response.data) {
        console.log("[SavedJobsPage] Successfully fetched jobs:", response.data);
        setSavedJobs(response.data)
        } else {
        console.error("[SavedJobsPage] Failed to fetch jobs or no data:", response.message);
        setSavedJobs([])
      }
      setPageLoading(false)
      console.log("[SavedJobsPage] Page loading set to false.");
    }

    fetchSavedJobs()
  }, [user, authLoading])

  const handleUnsaveJob = async (jobId: string) => {
    if (!jobId) return
    setUnSavingJobId(jobId)
    const response = await jobApi.unsaveJob(jobId)
    if (response.status === "success") {
      setSavedJobs((prevJobs) => prevJobs.filter((job) => job.id.toString() !== jobId.toString()))
    }
    setUnSavingJobId(null)
  }

  console.log("[SavedJobsPage] Rendering - authLoading:", authLoading, "pageLoading:", pageLoading, "savedJobs count:", savedJobs.length);

  if (authLoading || pageLoading) {
    console.log("[SavedJobsPage] Displaying loader.");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    )
  }
  
  console.log("[SavedJobsPage] Proceeding to render main content.");

  return (
    <ProtectedRoute roles="student">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Saved Jobs</h1>
          <Link href="/jobs">
            <Button variant="outline">Browse More Jobs</Button>
          </Link>
        </div>

        {savedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-card border rounded-lg shadow-sm">
            <AlertTriangle className="w-16 h-16 text-muted-foreground mb-6" />
            <p className="text-xl font-semibold text-card-foreground mb-3">No Saved Jobs Yet</p>
            <p className="text-sm text-muted-foreground mb-8 max-w-md">
              You haven&apos;t saved any jobs. Explore current openings and save those that catch your eye!
            </p>
            <Link href="/jobs">
              <Button size="lg">Find Jobs</Button>
            </Link>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedJobs.map((job) => (
              <Card key={job.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">
                    <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                  </CardTitle>
                  <CardDescription className="flex items-center pt-1 text-xs text-muted-foreground">
                    <Briefcase className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> 
                    {job.company_name || job.company || "N/A"}
                  </CardDescription>
                  <CardDescription className="flex items-center pt-0.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> 
                    {job.location || "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow py-2">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {job.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter className="mt-auto pt-3 pb-4 flex justify-between items-center border-t">
                  <Link href={`/jobs/${job.id}`} passHref>
                    <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs px-2 py-1 h-auto"
                    onClick={() => handleUnsaveJob(job.id.toString())}
                    disabled={unSavingJobId === job.id.toString()}
                  >
                    {unSavingJobId === job.id.toString() ? (
                      <Loader2 className="animate-spin h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                    )}
                    Unsave
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}
