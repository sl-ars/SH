import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { userApi } from "@/lib/api/user"
import { USER_ROLES } from "@/lib/constants/roles"
import { parseDRFErrors } from "@/lib/utils/error-handling"
import type { UserProfile, Education, Experience } from "@/lib/types"

interface UseProfileOptions {
  role: keyof typeof USER_ROLES
}

export function useProfile({ role }: UseProfileOptions) {
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const response = await userApi.getMyProfile()
      setProfile(response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Update profile
  const updateProfile = useCallback(async (data: Partial<UserProfile> & { avatar?: File }) => {
    try {
      setSaving(true)
      setFieldErrors({})
      const response = await userApi.updateProfile(data)
      setProfile(response.data)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      return response.data
    } catch (error: any) {
      console.error("Error updating profile:", error)
      
      if (error.response?.data?.errors) {
        const flattenedErrors = parseDRFErrors(error.response.data.errors)
        setFieldErrors(flattenedErrors)
        
        toast({
          title: "Error",
          description: "Please fix the errors in the form",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        })
      }
      throw error
    } finally {
      setSaving(false)
    }
  }, [toast])

  // Remove education entry
  const removeEducation = useCallback(async (educationId: string) => {
    try {
      setSaving(true)
      const updatedProfile = await userApi.removeEducation(role, educationId)
      setProfile(updatedProfile)
      toast({
        title: "Success",
        description: "Education entry removed successfully",
      })
      return updatedProfile
    } catch (error) {
      console.error("Error removing education:", error)
      toast({
        title: "Error",
        description: "Failed to remove education entry",
        variant: "destructive",
      })
      throw error
    } finally {
      setSaving(false)
    }
  }, [role, toast])

  // Remove experience entry
  const removeExperience = useCallback(async (experienceId: string) => {
    try {
      setSaving(true)
      const updatedProfile = await userApi.removeExperience(role, experienceId)
      setProfile(updatedProfile)
      toast({
        title: "Success",
        description: "Experience entry removed successfully",
      })
      return updatedProfile
    } catch (error) {
      console.error("Error removing experience:", error)
      toast({
        title: "Error",
        description: "Failed to remove experience entry",
        variant: "destructive",
      })
      throw error
    } finally {
      setSaving(false)
    }
  }, [role, toast])

  // Add education entry
  const addEducation = useCallback(async (education: Omit<Education, "id">) => {
    try {
      setSaving(true)
      const updatedProfile = await userApi.addEducation(role, education)
      setProfile(updatedProfile)
      toast({
        title: "Success",
        description: "Education entry added successfully",
      })
      return updatedProfile
    } catch (error) {
      console.error("Error adding education:", error)
      toast({
        title: "Error",
        description: "Failed to add education entry",
        variant: "destructive",
      })
      throw error
    } finally {
      setSaving(false)
    }
  }, [role, toast])

  // Add experience entry
  const addExperience = useCallback(async (experience: Omit<Experience, "id">) => {
    try {
      setSaving(true)
      const updatedProfile = await userApi.addExperience(role, experience)
      setProfile(updatedProfile)
      toast({
        title: "Success",
        description: "Experience entry added successfully",
      })
      return updatedProfile
    } catch (error) {
      console.error("Error adding experience:", error)
      toast({
        title: "Error",
        description: "Failed to add experience entry",
        variant: "destructive",
      })
      throw error
    } finally {
      setSaving(false)
    }
  }, [role, toast])

  return {
    profile,
    loading,
    saving,
    fieldErrors,
    fetchProfile,
    updateProfile,
    removeEducation,
    removeExperience,
    addEducation,
    addExperience,
  }
} 