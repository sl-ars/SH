"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { employerApi } from "@/lib/api"
import { JobPostingForm } from "@/components/job-posting-form"
import { useToast } from "@/hooks/use-toast"
import { Job } from "@/lib/types"

interface EditJobPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditJobPage({ params }: EditJobPageProps) {
  const { id } = use(params)
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await employerApi.getJob(id)
        if (!response.data) {
          throw new Error("Job not found")
        }
        setJob(response.data)
      } catch (error) {
        console.error("Error fetching job:", error)
        toast({
          title: "Error",
          description: "Failed to fetch job details",
          variant: "destructive",
        })
        router.push("/employer/jobs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [id])

  const handleSubmit = async (formData: any) => {
    setIsSaving(true)
    try {
      await employerApi.updateJob(id, formData)
      toast({
        title: "Success",
        description: "Job posting updated successfully",
      })
      router.push("/employer/jobs")
    } catch (error) {
      console.error("Error updating job:", error)
      toast({
        title: "Error",
        description: "Failed to update job posting",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <p>Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <p>Job not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Job Posting</h1>
          <p className="text-muted-foreground">Update your job posting details</p>
        </div>
        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Update the details for your job posting</CardDescription>
        </CardHeader>
        <CardContent>
          <JobPostingForm onSubmit={handleSubmit} initialData={job} />
        </CardContent>
      </Card>
    </div>
  )
} 