"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { jobApi } from "@/lib/api/jobs"
import { JobPostingForm } from "@/components/job-posting-form"
import { useToast } from "@/hooks/use-toast"

export default function AdminNewJobPage() {
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (formData: any) => {
    setIsSaving(true)
    try {
      await jobApi.createJob(formData)
      toast({
        title: "Success",
        description: "Job posting created successfully",
      })
      router.push("/admin/jobs")
    } catch (error) {
      console.error("Error creating job:", error)
      toast({
        title: "Error",
        description: "Failed to create job posting",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin: Create New Job</h1>
          <p className="text-muted-foreground">Add a new job posting to the platform</p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Fill in the details of the new job posting</CardDescription>
        </CardHeader>
        <CardContent>
          <JobPostingForm
            onSubmit={handleSubmit}
            initialData={null}
            isAdmin={true}
          />
        </CardContent>
      </Card>
    </div>
  )
} 