"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Building, Calendar, Clock, Briefcase, Share2, Edit, Trash2, Users } from "lucide-react"
import { getJobById } from "@/lib/api/jobs"
import { useToast } from "@/hooks/use-toast"
import { QuickApplyButton } from "@/components/quick-apply-button"
import { ResumeJobMatch } from "@/components/resume-job-match"
import { formatDistanceToNow } from "date-fns"
import type { Job } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { employerApi } from "@/lib/api"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function JobDetailPage() {
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams()
  const jobId = params?.id as string
  const { user } = useAuth()
  const isEmployer = user?.role === "employer"
  const isJobOwner = job?.company_id === user?.company_id || job?.company_id === user?.company_id

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true)
      try {
        console.log("Fetching job with ID:", jobId, "Type:", typeof jobId)
        const job = await getJobById(jobId)
        console.log("Fetched job:", job)
        console.log("Current user:", user)
        console.log("Is employer:", isEmployer)
        console.log("Is job owner:", job?.company_id === user?.company_id || job?.company_id === user?.company_id)
        
        if (job) {
          console.log("Setting job state with:", job)
          setJob(job)
        } else {
          console.log("No job found with ID:", jobId)
          toast({
            title: "Error",
            description: "Failed to load job details",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching job:", error)
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (jobId) {
      fetchJob()
    }
  }, [jobId, toast])

  const handleShare = async () => {
    try {
      await navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title} at ${job?.company}`,
        url: window.location.href,
      })
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const handleEdit = () => {
    router.push(`/employer/jobs/${jobId}/edit`)
  }

  const handleDelete = async () => {
    if (!job) return
    
    setIsDeleting(true)
    try {
      await employerApi.deleteJob(jobId)
      toast({
        title: "Success",
        description: "Job deleted successfully",
      })
      router.push("/employer/jobs")
    } catch (error) {
      console.error("Error deleting job:", error)
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleViewApplications = () => {
    router.push(`/employer/applications?jobId=${jobId}`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The job posting you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push("/jobs")}>View All Jobs</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Safely format the posted time with fallback
  const getPostedTimeAgo = () => {
    try {
      const dateString = job.posted_date
      if (!dateString) return "Recently posted"
      
      // Check if the date is valid before formatting
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Recently posted"
      
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Recently posted"
    }
  }

  const postedTimeAgo = getPostedTimeAgo()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Building className="h-4 w-4" />
                <span>{job.company}</span>
                <span>•</span>
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline" className="flex items-center">
                <Briefcase className="h-3 w-3 mr-1" />
                {job.type}
              </Badge>
              {job.salary && (
                <Badge variant="outline" className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {job.salary}
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {postedTimeAgo}
              </Badge>
            </div>

            <div className="flex gap-2 mt-4">
              {isEmployer && isJobOwner ? (
                <>
                  <Button onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Job
                  </Button>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Job
                  </Button>
                  <Button variant="outline" onClick={handleViewApplications}>
                    <Users className="h-4 w-4 mr-2" />
                    View Applications
                  </Button>
                </>
              ) : (
                <>
                  <QuickApplyButton jobId={job.id} />
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <p>{job.description}</p>
              </div>

              {/* Responsibilities Section */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ul className="list-disc list-inside space-y-1">
                      {job.responsibilities.map((responsibility, index) => (
                        <li key={index}>{responsibility}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {job.requirements && job.requirements.length > 0 && (

                <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="list-disc list-inside space-y-1">
                    {job.requirements.map((requirements, index) => (
                      <li key={index}>{requirements}</li>
                    ))}
                  </ul>
                </CardContent>
                </Card>
                )}

              {job.benefits && job.benefits.length > 0 && (

              <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  {job.benefits.map((benefits, index) => (
                    <li key={index}>{benefits}</li>
                  ))}
                </ul>
              </CardContent>
              </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        {/* <div className="space-y-6">
          <ResumeJobMatch jobId={job.id} resumeId="current" />
        </div> */}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Job"
        description="Are you sure you want to delete this job? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  )
} 