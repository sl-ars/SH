"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { employerApi } from "@/lib/api"
import { JobPostingForm } from "@/components/job-posting-form"
import { useToast } from "@/hooks/use-toast"

export default function EditJobPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const jobId = params.id

  // Store the original job data to compare against
  const [originalJobData, setOriginalJobData] = useState<any>(null);

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true)
      try {
        const response = await employerApi.getJob(jobId)
        setJob(response.data) // This is the data for the form to edit
        setOriginalJobData(response.data) // Store a copy for diffing
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

  const handleSubmit = async (formDataFromForm: any) => {
    setIsSaving(true)
    try {
      const changedData: Partial<any> = {}; // Using Partial<any> for flexibility, refine if Job type is strictly known here

      // Compare formDataFromForm with originalJobData
      for (const key in formDataFromForm) {
        if (Object.prototype.hasOwnProperty.call(formDataFromForm, key)) {
          const formValue = formDataFromForm[key];
          const originalValue = originalJobData ? originalJobData[key] : undefined;

          // Handle array comparisons (e.g., requirements, responsibilities, benefits)
          // The form submits these as arrays of strings (if they have content)
          if (Array.isArray(formValue) && Array.isArray(originalValue)) {
            // Simple comparison: convert to sorted JSON strings. Consider more robust deep comparison if needed.
            const sortedFormValue = [...formValue].sort().join(',');
            const sortedOriginalValue = [...originalValue].sort().join(',');
            if (sortedFormValue !== sortedOriginalValue) {
              changedData[key] = formValue;
            }
          } else if (formValue !== originalValue) {
            // For non-array types, directly compare
            // This includes ensuring that if a value was empty and is now filled, or vice versa,
            // or if a value changed (e.g. title, salary_min/max)
            changedData[key] = formValue;
          }
        }
      }
      
      // Check if salary_min or salary_max actually changed from numbers to undefined (cleared input)
      // The form sends undefined if parsed integer is NaN (e.g. empty string)
      if (originalJobData && formDataFromForm.salary_min === undefined && originalJobData.salary_min !== null && originalJobData.salary_min !== undefined) {
        changedData.salary_min = null; // Explicitly set to null to clear it on backend
      }
      if (originalJobData && formDataFromForm.salary_max === undefined && originalJobData.salary_max !== null && originalJobData.salary_max !== undefined) {
        changedData.salary_max = null; // Explicitly set to null to clear it on backend
      }

      if (Object.keys(changedData).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes were made to the job posting.",
        });
        setIsSaving(false);
        return;
      }

      await employerApi.updateJob(jobId, changedData)
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

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Job Posting</h1>
          <p className="text-muted-foreground">Update the details of your job posting</p>
        </div>
        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Make changes to your job posting below</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2 mt-6">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          ) : job ? (
            <JobPostingForm initialData={job} onSubmit={handleSubmit} />
          ) : (
            <div className="text-center py-6">
              <p>Job not found or you don't have permission to edit it.</p>
              <Button onClick={handleCancel} className="mt-4">
                Go Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
