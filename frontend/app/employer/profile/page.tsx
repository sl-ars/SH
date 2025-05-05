"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { UserProfile } from "@/lib/types"
import { USER_ROLES } from "@/lib/constants/roles"
import { userApi } from "@/lib/api/user"
import { calculateProfileCompletion } from "@/lib/utils/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Briefcase, MapPin, Phone, Mail, Globe, Building2, Users } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { AvatarUpload } from "@/components/avatar-upload"

export default function EmployeeProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [profileData, setProfileData] = useState<UserProfile | null>(null)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await userApi.getMyProfile()
        setProfileData(response.data)
        const { percentage, missingFields } = calculateProfileCompletion(response.data)
        setProfileCompletion(percentage)
        setMissingFields(missingFields)
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [toast, router])

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfileData((prev) => {
      if (!prev) return null
      return { ...prev, [field]: value }
    })
  }

  const handleProfileUpdate = async () => {
    if (!profileData) return

    try {
      setSaving(true)
      await userApi.updateProfile(profileData)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <ProtectedRoute roles={[USER_ROLES.EMPLOYER]}>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/50 to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            Employer Profile
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibrant-blue"></div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Profile Overview */}
              <div className="md:col-span-1 space-y-6">
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-vibrant-blue to-vibrant-purple"></div>
                  <CardContent className="-mt-16 relative">
                    <AvatarUpload
                      currentAvatar={profileData?.avatar}
                      onAvatarChange={(newAvatar) => handleInputChange("avatar", newAvatar)}
                    />
                    <h2 className="mt-4 text-2xl font-bold text-center">{profileData?.company_name || profileData?.name}</h2>
                    <p className="text-muted-foreground text-center">Employer</p>
                  </CardContent>
                </Card>

                {/* Employee Stats */}
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink w-full"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center text-vibrant-orange">
                      <Users className="w-5 h-5 mr-2" />
                      Employer Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Jobs Posted</span>
                      <span className="font-semibold">{profileData?.totalJobsPosted || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Active Applications</span>
                      <span className="font-semibold">{profileData?.activeApplications || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Hires</span>
                      <span className="font-semibold">{profileData?.totalHires || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Profile Content */}
              <div className="md:col-span-2 space-y-6">
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-vibrant-green to-vibrant-blue w-full"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center text-vibrant-green">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Employer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData?.name || ""}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData?.email || ""}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          disabled={true}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData?.phone || ""}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+1 (555) 555-5555"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="City, State"
                          value={profileData?.location || ""}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Professional Description</Label>
                      <Textarea
                        id="description"
                        value={profileData?.description || ""}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="skills">Skills</Label>
                      <Textarea
                        id="skills"
                        value={profileData?.skills?.join("\n") || ""}
                        onChange={(e) =>
                          handleInputChange("skills", e.target.value.split("\n").filter(Boolean))
                        }
                        className="min-h-[120px]"
                        placeholder="Enter each skill on a new line"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleProfileUpdate} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
} 