"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import ProtectedRoute from "@/components/protected-route"
import { employerApi } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { isMockEnabled } from "@/lib/utils/config"
import { INDUSTRIES } from "@/lib/constants/industries"

interface CompanyProfile {
  company_name: string
  industry: string
  website: string
  description: string
  company: string
  company_id: string
}

export default function CompanyProfilePage() {
  const { user, refreshUserInfo } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<CompanyProfile>({
    company_name: "",
    industry: "",
    website: "",
    description: "",
    company: "",
    company_id: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) router.push("/login")

    const fetchCompanyProfile = async () => {
      try {
        setLoading(true)
        const response = await employerApi.getCompanyProfile()
        
        // Add additional safety check for data
        if (response && response.data) {
          const companyData = response.data as any; // Type cast to any to avoid property access errors
          setProfile({
            company_name: companyData.company_name || "",
            industry: companyData.industry || "",
            website: companyData.website || "",
            description: companyData.description || "",
            company: companyData.company || "",
            company_id: companyData.company_id || "",
          })
        } else {
          console.warn("Company profile data was undefined or incomplete, using empty values")
          // Set default values if data is missing
          setProfile({
            company_name: "",
            industry: "",
            website: "",
            description: "",
            company: "",
            company_id: "",
          })
        }
      } catch (error) {
        console.error("Error fetching company profile:", error)
        
        // Set default empty values on error
        setProfile({
          company_name: "",
          industry: "",
          website: "",
          description: "",
          company: "",
          company_id: "",
        })
        
        // Show error toast
        toast({
          title: "Error loading profile",
          description: "Could not load company profile. Using empty form.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyProfile()
  }, [user, router, toast])

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const profileData = {
        ...profile,
        company: profile.company_name,
        company_id: profile.company_name.toLowerCase().replace(/\s+/g, '-')
      }
      console.log('Saving profile data:', profileData)
      const response = await employerApi.updateCompanyProfile(profileData)
      console.log('Profile update response:', response)

      // Update profile if we received data from the server
      if (response && response.data) {
        const companyData = response.data;
        
        // Update local profile with server data
        setProfile({
          company_name: companyData.name || "", // in Company model the field is called name
          industry: companyData.industry || "",
          website: companyData.website || "",
          description: companyData.description || "",
          company: companyData.name || "",
          company_id: companyData.id || "",
        });

        // Refresh user context data with updated company info
        console.log('Refreshing user context with new company data...');
        await refreshUserInfo();
        console.log('User context refreshed. Current user data:', user);
        
        // Show success notification
        toast({
          title: "Profile updated successfully! ✅",
          description: "Your company profile has been updated and all related data refreshed.",
          variant: "default",
        })
      } else {
        console.warn('Update response did not contain data:', response);
        toast({
          title: "Profile updated",
          description: "Your company profile has been updated.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update company profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute roles="employer">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Company Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Edit Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading company profile...</div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={profile.company_name}
                    onChange={(e) => handleChange("company_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={profile.industry}
                    onValueChange={(value) => handleChange("industry", value)}
                  >
                    <SelectTrigger id="industry" className="w-full">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profile.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    value={profile.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
