"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { jobApi } from "@/lib/api/jobs"
import { resumeApi } from "@/lib/api/resume"
import type { JobApplicationClientPayload } from "@/lib/api/jobs"
import { useToast } from "@/hooks/use-toast"

// Define a type for the resume objects passed in props
interface UserResume {
  id: string;
  file_name: string; // Or any other property you use for display
  name?: string; // name might be used by resumeApi
}

interface JobApplicationFormProps {
  jobId: string; 
  userResumes?: UserResume[]; // Make userResumes prop optional
  onSubmit?: (data: JobApplicationClientPayload) => void
  isLoading?: boolean
  standalone?: boolean
}

export function JobApplicationForm({
  jobId,
  userResumes: propUserResumes, // Rename to avoid conflict with state
  onSubmit,
  isLoading = false,
  standalone = false,
}: JobApplicationFormProps) {
  const [formData, setFormData] = useState<Omit<JobApplicationClientPayload, 'resume_id'> & { selectedResumeId: string; agreeToTerms: boolean; notes: string; cover_letter: string }>({
    cover_letter: "",
    selectedResumeId: "", 
    notes: "",            
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const { toast } = useToast()
  const [internalResumes, setInternalResumes] = useState<UserResume[]>([])
  const [isFetchingResumes, setIsFetchingResumes] = useState<boolean>(false)

  useEffect(() => {
    // Fetch resumes only if not provided via props or if prop is empty
    if (!propUserResumes || propUserResumes.length === 0) {
      const fetchResumes = async () => {
        setIsFetchingResumes(true)
        try {
          const response = await resumeApi.getUserResumes()
          if (response.status === "success" && response.data) {
            // Adapt fetched data to UserResume type if necessary
            const adaptedResumes = response.data.map(r => ({
              id: r.id,
              file_name: r.name || r.id, // Use name from API, fallback to id
              name: r.name
            })); 
            setInternalResumes(adaptedResumes)
            // If there's only one resume, select it by default
            if (adaptedResumes.length === 1) {
              setFormData(prev => ({ ...prev, selectedResumeId: adaptedResumes[0].id }));
            }
          } else {
            toast({
              title: "Failed to load resumes",
              description: response.message || "Could not fetch your resumes.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error fetching resumes:", error)
          toast({
            title: "Error fetching resumes",
            description: "An unexpected error occurred while fetching your resumes.",
            variant: "destructive",
          })
        }
        setIsFetchingResumes(false)
      }
      fetchResumes()
    }
  }, [propUserResumes, toast]) // Depend on propUserResumes and toast

  // Auto-select first resume if propUserResumes is provided and has one item, and nothing is selected
  useEffect(() => {
    if (propUserResumes && propUserResumes.length === 1 && !formData.selectedResumeId) {
      setFormData(prev => ({ ...prev, selectedResumeId: propUserResumes[0].id }));
    }
  }, [propUserResumes, formData.selectedResumeId]);

  // Determine which list of resumes to use
  const availableResumes = propUserResumes && propUserResumes.length > 0 ? propUserResumes : internalResumes;

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> 
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Use onValueChange from shadcn Select component
  const handleResumeSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, selectedResumeId: value }))
    if (errors.selectedResumeId) {
      setErrors((prev) => ({ ...prev, selectedResumeId: undefined }))
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeToTerms: checked }))
    if (errors.agreeToTerms) {
      setErrors((prev) => ({ ...prev, agreeToTerms: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string | undefined> = {}
    if (!formData.cover_letter.trim()) newErrors.cover_letter = "Cover letter is required"
    if (!formData.selectedResumeId) newErrors.selectedResumeId = "Please select a resume"
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms"

    setErrors(newErrors)
    return Object.values(newErrors).every(error => error === undefined)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const applicationPayload: JobApplicationClientPayload = {
      cover_letter: formData.cover_letter,
      resume_id: formData.selectedResumeId,
      notes: formData.notes.trim() ? formData.notes : undefined, 
    }

    if (onSubmit) {
      onSubmit(applicationPayload)
      return
    }

    try {
      await jobApi.applyToJob(jobId, applicationPayload)
      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted.",
      })
      setFormData({
        cover_letter: "",
        selectedResumeId: "",
        notes: "",
        agreeToTerms: false,
      })
      setErrors({})
    } catch (error) {
      console.error("Error applying to job:", error)
      const errorMessage = error instanceof Error ? error.message : "There was an error submitting your application. Please try again."
      toast({
        title: "Application failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className={standalone ? "space-y-6 p-4 border rounded-lg" : "space-y-4"}>
      {standalone && <div className="text-xl font-semibold mb-4">Apply for this Position</div>}

      <div className="space-y-2">
        <Label htmlFor="selectedResumeId">Your Resume</Label>
        <Select
          value={formData.selectedResumeId}
          onValueChange={handleResumeSelectChange}
          disabled={isLoading || isFetchingResumes || availableResumes.length === 0}
        >
          <SelectTrigger 
            className={`w-full ${errors.selectedResumeId ? "border-destructive" : ""}`}
            id="selectedResumeId"
          >
            <SelectValue placeholder="-- Select a Resume --" />
          </SelectTrigger>
          <SelectContent>
            {availableResumes.map((resume) => (
              <SelectItem key={resume.id} value={resume.id}>
                {resume.file_name || resume.name || `Resume ID: ${resume.id}`} 
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.selectedResumeId && <p className="text-destructive text-sm">{errors.selectedResumeId}</p>}
        {(isFetchingResumes) && (
            <p className="text-sm text-muted-foreground">Loading your resumes...</p>
        )}
        {!isFetchingResumes && availableResumes.length === 0 && (
            <p className="text-sm text-muted-foreground">You have no resumes. Please upload one to your profile.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover_letter">Cover Letter</Label>
        <Textarea
          id="cover_letter"
          name="cover_letter" 
          value={formData.cover_letter}
          onChange={handleChange}
          placeholder="Tell us why you're a good fit for this position..."
          className={`min-h-[120px] ${errors.cover_letter ? "border-destructive" : ""}`}
          disabled={isLoading || isFetchingResumes}
        />
        {errors.cover_letter && <p className="text-destructive text-sm">{errors.cover_letter}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes" 
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional information for the employer..."
          className={`min-h-[80px] ${errors.notes ? "border-destructive" : ""}`}
          disabled={isLoading || isFetchingResumes}
        />
        {errors.notes && <p className="text-destructive text-sm">{errors.notes}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="agreeToTerms"
          checked={formData.agreeToTerms}
          onCheckedChange={handleCheckboxChange}
          className={errors.agreeToTerms ? "border-destructive" : ""} 
          disabled={isLoading || isFetchingResumes}
        />
        <Label htmlFor="agreeToTerms" className={`text-sm ${errors.agreeToTerms ? "text-destructive" : ""}`}>
          I agree to the terms and conditions and privacy policy
        </Label>
      </div>
      {errors.agreeToTerms && !formData.agreeToTerms && (
        <p className="text-destructive text-sm">{errors.agreeToTerms}</p>
      )}

      <Button type="submit" disabled={isLoading || isFetchingResumes || availableResumes.length === 0} className="w-full">
        {isLoading || isFetchingResumes ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  )
}
