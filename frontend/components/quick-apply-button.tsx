"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { jobApi } from "@/lib/api/jobs"
import { useToast } from "@/hooks/use-toast"
import { JobApplicationForm } from "./job-application-form"

interface QuickApplyButtonProps {
  jobId: string
  className?: string
}

export function QuickApplyButton({ jobId, className = "" }: QuickApplyButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleApply = async (formData: any) => {
    setIsLoading(true)
    try {
      await jobApi.applyToJob(jobId, formData)
      setIsOpen(false)
      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted.",
      })
    } catch (error) {
      console.error("Error applying to job:", error)
      toast({
        title: "Application failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          Quick Apply
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Quick Apply</DialogTitle>
          <DialogDescription>
            Fill out the form below to quickly apply for this position. You can edit your application before submitting.
          </DialogDescription>
        </DialogHeader>
        <JobApplicationForm onSubmit={handleApply} isLoading={isLoading} />
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
