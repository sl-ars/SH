"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { employerApi } from "@/lib/api"
import { JobPostingForm } from "@/components/job-posting-form"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function NewJobPage() {
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()


  const handleSubmit = async (formData: any) => {
    setIsSaving(true)
    try {
      await employerApi.createJob(formData)
      toast({
        title: "Success",
        description: "Job posting created successfully",
      })
      router.push("/employer/jobs")
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
          <h1 className="text-2xl font-bold tracking-tight">Create New Job Posting</h1>
          <p className="text-muted-foreground">Post a new job opening for your company</p>
        </div>
        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Fill in the details for your new job posting</CardDescription>
        </CardHeader>
        <CardContent>
          <JobPostingForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}
